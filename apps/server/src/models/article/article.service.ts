import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CsvParser } from 'nest-csv-parser';
import { Readable } from 'stream';
import { BaseService } from '../../common/base.service';
import { OrderEntry } from '../bills/entities/order-entry.entity';
import { ArticleRepository } from './article.repository';
import { ArticleCsvEntity } from './entities/article-import.csv-entity';
import { Article } from './entities/article.entity';
import { InventoryService } from './inventory.service';
import { ArticleEntity } from './serializers/article.serializer';

@Injectable()
export class ArticleService extends BaseService<Article, ArticleEntity> {

  constructor(
    private readonly articleRepository: ArticleRepository,
    private readonly csvParser: CsvParser,
    private readonly inventoryService: InventoryService,
  ) {
    super(articleRepository);
  }

  async get(
    id: number,
    relations: string[] = [],
    throwsException = true,
  ): Promise<ArticleEntity> {

    let querybuilder = this.getQueryBuilder();

    let value: ArticleEntity = await querybuilder
      .where('article.id = :id', { id })
      .getOne()
      .then((entity) => {
        if (!entity && throwsException) {
          return Promise.reject(new NotFoundException('Model not found.'));
        }
        if (entity) {
          entity['stock'] = (entity.inventoryStock ?? 0) - (entity['totalAmount'] ?? 0);
        }

        return Promise.resolve(entity ? this.articleRepository.transform(entity) : null);
      })
      .catch((error) => Promise.reject(error));

    return value;
  }


  async getAll(
    relations: string[] = [],
    throwsException = true,
  ): Promise<ArticleEntity[]> {

    let querybuilder = this.getQueryBuilder();

    let value: ArticleEntity[] = await querybuilder
      .getMany()
      .then((entity) => {
        if (!entity && throwsException) {
          return Promise.reject(new NotFoundException('Model not found.'));
        }
        entity.map((m) => (m['stock'] = (m.inventoryStock ?? 0) - (m['totalAmount'] ?? 0)));

        return Promise.resolve(entity ? this.articleRepository.transformMany(entity) : null);
      })
      .catch((error) => Promise.reject(error));

    return value;
  }

  async getByCode(
    code: string,
    throwsException = true,
  ): Promise<ArticleEntity> {

    let querybuilder = this.getQueryBuilder();

    let value: ArticleEntity = await querybuilder
      .where('article.code = :code', { code })
      .getOne()
      .then((entity) => {
        if (!entity && throwsException) {
          return Promise.reject(new NotFoundException('Model not found.'));
        }
        if (entity) {
          entity['stock'] = (entity.inventoryStock ?? 0) - (entity['totalAmount'] ?? 0);
        }
        return Promise.resolve(entity ? this.articleRepository.transform(entity) : null);
      })
      .catch((error) => Promise.reject(error));

    return value;
  }

  getQueryBuilder() {
    return this.articleRepository
      .createQueryBuilder('article')
      .addSelect(
        (subquery) =>
          subquery
            .select('COALESCE(SUM(orderEntry.amount), 0)')
            .from(OrderEntry, 'orderEntry')
            .where('orderEntry.articleId = article.id')
            .andWhere('orderEntry.createdAt >= article.inventoryDate'),
        'article_totalAmount',
      )
      .leftJoinAndSelect('article.articleGroup', 'articlegroup');
  }


  async importCsv(preview: boolean, file: Express.Multer.File) {

    const entities = await this.csvParser.parse(Readable.from(file.buffer.toString()), ArticleCsvEntity);
    const articleUpdate = await this.checkCSV(entities.list);

    if (preview) {
      return articleUpdate;
    } else {

      const [cRet, cRetFailed] = await this.createArticlesFromImport(articleUpdate.newArticle);
      const [uRet, uRetFailed] = await this.updateArticlesFromImport(articleUpdate.updateableArticle);

      return [[...cRet, ...uRet], [...cRetFailed, ...uRetFailed]];
    }
  }

  async updateArticlesFromImport(updateableArticle: ArticleCsvEntity[]) {
    let successArticles = [];
    let failedArticles = [];

    for (let index = 0; index < updateableArticle.length; index++) {
      const element = updateableArticle[index];
      try {

        let per = (+(element.pe.replace(',', '.')) || 1);
        per = per === 0 ? 1 : per;
        await this.articleRepository.update({ code: element.barcode }, {
          name: element.artikelbez,
          unit: element.unit,
          price: this.ceilNumber(+(element.brutto.replace(',', '.')) / per),
          netto: this.ceilNumber(+(element.netto.replace(',', '.')) / per),
          type: element.bezeichnung2,
          artNumber: element.verkaufsobjekt,
        });
        successArticles.push(element);

      } catch (error) {
        failedArticles.push(element);
      }
    }

    return [successArticles, failedArticles];

  }

  ceilNumber(value) {
    return Math.ceil(value * 100) / 100;
  }

  async createArticlesFromImport(newArticle: ArticleCsvEntity[]) {

    let successArticles = [];
    let failedArticles = [];

    for (let index = 0; index < newArticle.length; index++) {
      const element = newArticle[index];
      let article = new Article();
      article.code = element.barcode;
      let per = (+(element.pe.replace(',', '.')) || 1);
      per = per === 0 ? 1 : per;
      try {

        article.name = element.artikelbez;
        article.unit = element.unit;
        article.price = this.ceilNumber(+(element.brutto.replace(',', '.')) / per);
        article.netto = this.ceilNumber(+(element.netto.replace(',', '.')) / per);
        article.type = element.bezeichnung2;
        article.artNumber = element.verkaufsobjekt;

        await this.articleRepository.insert(article);
        successArticles.push(element);

      } catch (error) {
        failedArticles.push(element);
      }
    }

    return [successArticles, failedArticles];

  }


  async checkCSV(entries: ArticleCsvEntity[]) {

    const articles = await this.getAll();
    const newArticle = [];
    const updateableArticle = [];

    entries.forEach((element: ArticleCsvEntity) => {
      let find = articles.find((a) => a.code === element.barcode);
      if (find) {
        updateableArticle.push(element);
      } else {
        newArticle.push(element);
      }
    });

    let retValue = {
      articleCount: updateableArticle.length + newArticle.length,
      newArticle,
      updateableArticle,
    };

    return retValue;
  }


  async makeInventory(article: ArticleEntity, newStock: number): Promise<ArticleEntity> {

    if (newStock === undefined || newStock < 0) {
      throw new BadRequestException('newStock Parameter nicht angegeben oder kleiner 0');
    }

    if (!article.trackStock) {
      throw new BadRequestException('Artikel Lagerstand wird nicht überwacht');
    }

    const articleStock = article.stock;

    // Bug #5 fix: wrap inventory creation in try/catch so a failed inventory entry
    // does not prevent the article stock from being updated
    try {
      await this.inventoryService.create(
        {
          amountNew: newStock,
          diff: articleStock - newStock,
          article: article,
        }
      );
    } catch (error) {
      // Inventory log entry failed — continue so the article stock is still updated
    }

    await this.articleRepository.updateEntity(article.id, {
      inventoryStock: newStock,
      inventoryDate: new Date(),
    });

    return this.getByCode(article.code);

  }

  async getByName(
    name: string,
    relations: string[] = [],
    throwsException = false,
  ): Promise<ArticleEntity | null> {
    return this.articleRepository
      .findOne({
        where: { name: name },
        relations,
      })
      .then((entity) => {
        if (!entity && throwsException) {
          return Promise.reject(new NotFoundException('Model not found.'));
        }

        return Promise.resolve(
          entity ? this.articleRepository.transform(entity) : null,
        );
      })
      .catch((error) => Promise.reject(error));
  }

}
