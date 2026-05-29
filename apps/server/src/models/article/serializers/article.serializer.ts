import { Expose, Transform, Type } from 'class-transformer';
import { ModelEntity } from '../../../common/serializers/model.serializer';
import { IArticle } from '../interfaces/article.interface';
import { ArticleGroupEntity } from './article-group.serializer';

export const defaultArticleForSerializing: string[] = [
  'bucketCategory.timestamps',
  'default',
];
export const extendedArticleForSerializing: string[] = [
  ...defaultArticleForSerializing,
];
export const allArticleForSerializing: string[] = [
  ...extendedArticleForSerializing,
];
export class ArticleEntity
  extends ModelEntity
  implements IArticle {
  @Expose({ groups: ['default'] })
  name: string;
  @Expose({ groups: ['default'] })
  code: string;
  @Expose({ groups: ['default'] })
  inventoryStock: number;
  @Expose({ groups: ['default'] })
  inventoryDate: Date;
  @Expose({ groups: ['default'] })
  imgPath: string;
  @Expose({ groups: ['default'] })
  unit: string;
  @Expose({ groups: ['default'] })
  artNumber: string;

  @Expose({ groups: ['default'] })
  stock: number | null;

  @Expose({ groups: ['default'] })
  @Type(() => ArticleGroupEntity)
  articleGroup: ArticleGroupEntity;

  @Expose({ groups: ['default'] })
  description: string;

  @Expose({ groups: ['default'] })
  supplier: string;

  @Expose({ groups: ['default'] })
  singlePos: boolean;
  @Expose({ groups: ['default'] })
  trackStock: boolean;
  @Expose({ groups: ['default'] })
  noDiscount: boolean;

  @Expose({ groups: ['default'] })
  @Transform(({ value }) => value != null ? Number(value) : 0)
  price: number;
  @Expose({ groups: ['default'] })
  type: string;

  @Expose({ groups: ['default', 'bucketCategory.timestamps'] })
  createdAt: Date;
  @Expose({ groups: ['default', 'bucketCategory.timestamps'] })
  updatedAt: Date;
}
