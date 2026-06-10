import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { instanceToPlain, plainToInstance } from 'class-transformer';
import { ClassTransformOptions } from '@nestjs/common/interfaces/external/class-transform-options.interface';
import { ModelRepository } from '../model.repository';
import { Article } from './entities/article.entity';
import { allArticleForSerializing, ArticleEntity, extendedArticleForSerializing } from './serializers/article.serializer';

@Injectable()
export class ArticleRepository extends ModelRepository<Article, ArticleEntity> {
  constructor(private dataSource: DataSource) {
    super(Article, dataSource.createEntityManager());
  }

  transform(model: Article): ArticleEntity {
    const tranformOptions: ClassTransformOptions = {
      groups: extendedArticleForSerializing,
    };
    return plainToInstance(
      ArticleEntity,
      instanceToPlain(model, tranformOptions),
      tranformOptions,
    );
  }

  transformMany(models: Article[]): ArticleEntity[] {
    return models.map((model) => this.transform(model));
  }
}
