import { EntityRepository } from 'typeorm';
import { ModelRepository } from '../model.repository';
import { classToPlain, plainToClass } from 'class-transformer';
import { ClassTransformOptions } from '@nestjs/common/interfaces/external/class-transform-options.interface';
import { ArticleGroup } from './entities/article-group.entity';
import { allArticleGroupForSerializing, ArticleGroupEntity, extendedArticleGroupForSerializing } from './serializers/article-group.serializer';

@EntityRepository(ArticleGroup)
export class ArticleGroupRepository extends ModelRepository<
  ArticleGroup,
  ArticleGroupEntity
> {
  transform(model: ArticleGroup): ArticleGroupEntity {
    const tranformOptions: ClassTransformOptions = {
      groups: extendedArticleGroupForSerializing,
    //  excludeExtraneousValues: true,
    };
    return plainToClass(
      ArticleGroupEntity,
      classToPlain(model, tranformOptions),
      tranformOptions,
    );
  }
  transformMany(models: ArticleGroup[]): ArticleGroupEntity[] {
    return models.map((model) => this.transform(model));
  }
}
