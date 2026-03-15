import { Expose, Type } from 'class-transformer';
import { ModelEntity } from '../../../common/serializers/model.serializer';
import { IInventory } from '../interfaces/inventory.interface';
import { IArticle } from '../interfaces/article.interface';
import { ArticleEntity } from './article.serializer';

export const defaultInventoryForSerializing: string[] = [
  'inventory.timestamps',
  'default',
];
export const extendedInventoryForSerializing: string[] = [
  ...defaultInventoryForSerializing,
];
export const allInventoryForSerializing: string[] = [
  ...extendedInventoryForSerializing,
];
export class InventoryEntity
  extends ModelEntity
  implements IInventory {

  @Expose({ groups: ['default'] })
  amountNew: number;

  @Expose({ groups: ['default'] })
  diff: number;

  @Expose({ groups: ['default'] })
  @Type(() => ArticleEntity)
  article: ArticleEntity;

  @Expose({ groups: ['default', 'inventory.timestamps'] })
  createdAt: Date;
  @Expose({ groups: ['default', 'inventory.timestamps'] })
  updatedAt: Date;
}
