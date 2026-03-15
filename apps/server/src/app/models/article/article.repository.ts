import { EntityRepository } from 'typeorm';
import { ModelRepository } from '../model.repository';
import { classToPlain, plainToClass } from 'class-transformer';
import { ClassTransformOptions } from '@nestjs/common/interfaces/external/class-transform-options.interface';
import { Article } from './entities/article.entity';
import { allArticleForSerializing, ArticleEntity, extendedArticleForSerializing } from './serializers/article.serializer';

@EntityRepository(Article)
export class ArticleRepository extends ModelRepository<
  Article,
  ArticleEntity
> {
  transform(model: Article): ArticleEntity {
    const tranformOptions: ClassTransformOptions = {
      groups: extendedArticleForSerializing,
    //  excludeExtraneousValues: true,
    };
    return plainToClass(
      ArticleEntity,
      classToPlain(model, tranformOptions),
      tranformOptions,
    );
  }
  transformMany(models: Article[]): ArticleEntity[] {
    return models.map((model) => this.transform(model));
  }
}
