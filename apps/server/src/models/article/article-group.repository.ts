import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { instanceToPlain, plainToInstance } from 'class-transformer';
import { ClassTransformOptions } from '@nestjs/common/interfaces/external/class-transform-options.interface';
import { ModelRepository } from '../model.repository';
import { ArticleGroup } from './entities/article-group.entity';
import { allArticleGroupForSerializing, ArticleGroupEntity, extendedArticleGroupForSerializing } from './serializers/article-group.serializer';

@Injectable()
export class ArticleGroupRepository extends ModelRepository<ArticleGroup, ArticleGroupEntity> {
  constructor(private dataSource: DataSource) {
    super(ArticleGroup, dataSource.createEntityManager());
  }

  transform(model: ArticleGroup): ArticleGroupEntity {
    const tranformOptions: ClassTransformOptions = {
      groups: extendedArticleGroupForSerializing,
    };
    return plainToInstance(
      ArticleGroupEntity,
      instanceToPlain(model, tranformOptions),
      tranformOptions,
    );
  }

  transformMany(models: ArticleGroup[]): ArticleGroupEntity[] {
    return models.map((model) => this.transform(model));
  }
}
