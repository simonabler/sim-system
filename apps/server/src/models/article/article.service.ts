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
import { UpdateArticleDto } from './dto/update-article.dto';
import {
  ArticleImportRow,
  CsvColumnMapping,
  ImportExecuteResponse,
  ImportPreviewResponse,
} from './dto/article-import-row';

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

  async getTotalStockValue(): Promise<number> {
    const result = await this.articleRepository
      .createQueryBuilder('article')
      .select('SUM(article.netto * article.inventoryStock)', 'stockValue')
      .where('article.trackStock = :trackStock', { trackStock: true })
      .getRawOne();
    return Number(result?.stockValue ?? 0);
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


  // ── Dynamic CSV import (column mapping provided by frontend) ──

  async importCsvWithMapping(
    preview: boolean,
    file: Express.Multer.File,
    mapping: CsvColumnMapping[],
  ): Promise<ImportPreviewResponse | ImportExecuteResponse> {
    const rawRows = ArticleService.parseCsvRaw(file.buffer);
    const fieldMap = new Map<string, keyof ArticleImportRow>();
    for (const m of mapping) {
      if (m.articleField !== null) fieldMap.set(m.csvHeader, m.articleField);
    }

    const rows: ArticleImportRow[] = rawRows
      .map(raw => {
        const row: ArticleImportRow = { code: '' };
        for (const [header, field] of fieldMap) {
          (row as unknown as Record<string, string>)[field] = raw[header] ?? '';
        }
        return row;
      })
      .filter(r => r.code.trim().length > 0);

    const checked = await this.checkCSVDynamic(rows);

    if (preview) {
      return checked;
    }

    let succeeded = 0;
    const failedCodes: string[] = [];

    for (const row of checked.newArticle) {
      try {
        await this.createArticleFromRow(row);
        succeeded++;
      } catch {
        failedCodes.push(row.code);
      }
    }

    for (const row of checked.updateableArticle) {
      try {
        await this.updateArticleFromRow(row);
        succeeded++;
      } catch {
        failedCodes.push(row.code);
      }
    }

    return { succeeded, failed: failedCodes.length, failedCodes };
  }

  private static parseCsvRaw(buffer: Buffer): Record<string, string>[] {
    const content = buffer.toString('utf-8');
    const lines = content.split(/\r?\n/).filter(l => l.trim().length > 0);
    if (lines.length < 2) return [];
    const sep = lines[0].includes(';') ? ';' : ',';
    const headers = lines[0].split(sep).map(h => h.trim().replace(/^"|"$/g, ''));
    return lines.slice(1).map(line => {
      const vals = line.split(sep).map(v => v.trim().replace(/^"|"$/g, ''));
      return Object.fromEntries(headers.map((h, i) => [h, vals[i] ?? '']));
    });
  }

  private async checkCSVDynamic(rows: ArticleImportRow[]): Promise<ImportPreviewResponse> {
    const articles = await this.getAll();
    const newArticle: ArticleImportRow[] = [];
    const updateableArticle: ArticleImportRow[] = [];

    for (const row of rows) {
      if (articles.find(a => a.code === row.code)) {
        updateableArticle.push(row);
      } else {
        newArticle.push(row);
      }
    }

    return { articleCount: newArticle.length + updateableArticle.length, newArticle, updateableArticle };
  }

  private async createArticleFromRow(row: ArticleImportRow): Promise<void> {
    const per = this.parsePe(row.pe);
    const article = new Article();
    article.code = row.code;
    article.name = row.name ?? row.code;
    article.unit = row.unit ?? '';
    article.type = row.type ?? '';
    article.artNumber = row.artNumber ?? '';
    article.price = row.price ? this.ceilNumber(+(row.price.replace(',', '.')) / per) : 0;
    article.netto = row.netto ? this.ceilNumber(+(row.netto.replace(',', '.')) / per) : 0;
    await this.articleRepository.insert(article);
  }

  private async updateArticleFromRow(row: ArticleImportRow): Promise<void> {
    const per = this.parsePe(row.pe);
    const update: Partial<Article> = {};
    if (row.name !== undefined)      update.name      = row.name;
    if (row.unit !== undefined)      update.unit      = row.unit;
    if (row.type !== undefined)      update.type      = row.type;
    if (row.artNumber !== undefined) update.artNumber = row.artNumber;
    if (row.price !== undefined)     update.price     = this.ceilNumber(+(row.price.replace(',', '.')) / per);
    if (row.netto !== undefined)     update.netto     = this.ceilNumber(+(row.netto.replace(',', '.')) / per);
    await this.articleRepository.update({ code: row.code }, update);
  }

  private parsePe(pe?: string): number {
    const val = +(pe?.replace(',', '.') ?? '1') || 1;
    return val === 0 ? 1 : val;
  }

  async update(id: number, inputs: UpdateArticleDto): Promise<ArticleEntity> {
    const { articleGroup, ...rest } = inputs;
    // TypeORM's update() expects the FK column directly for ManyToOne relations.
    // Passing { articleGroup: { id } } as a nested object is silently ignored in
    // some TypeORM 0.3 versions. We pass it explicitly as a relation reference.
    const updateData: any = { ...rest };
    if (articleGroup?.id !== undefined) {
      updateData.articleGroup = { id: articleGroup.id };
    }
    return this.articleRepository.updateEntity(id, updateData);
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
