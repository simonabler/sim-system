import { Expose, Type } from 'class-transformer';
import { ModelEntity } from '../../../common/serializers/model.serializer';
import { IArticleGroup } from '../interfaces/article-group.interface';

export const defaultArticleGroupForSerializing: string[] = [
  'articleGroup.timestamps',
  'default',
];
export const extendedArticleGroupForSerializing: string[] = [
  ...defaultArticleGroupForSerializing,
];
export const allArticleGroupForSerializing: string[] = [
  ...extendedArticleGroupForSerializing,
];
export class ArticleGroupEntity
  extends ModelEntity
  implements IArticleGroup {

  @Expose({ groups: ['default'] })
  name: string;

  @Expose({ groups: ['default', 'articleGroup.timestamps'] })
  createdAt: Date;
  @Expose({ groups: ['default', 'articleGroup.timestamps'] })
  updatedAt: Date;
}
