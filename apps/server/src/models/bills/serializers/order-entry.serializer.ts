import { Expose, Type } from 'class-transformer';
import { ModelEntity } from '../../../common/serializers/model.serializer';
import { ArticleEntity } from '../../article/serializers/article.serializer';
import { IOrderEntry } from '../interfaces/order-entry.interface';
import { SlipsheetEntity } from './slipsheet.serializer';

export const defaultOrderEntryForSerializing: string[] = [
  'default',
  'orderEntry.timestamps',
];
export const extendedOrderEntryForSerializing: string[] = [
  ...defaultOrderEntryForSerializing,
];
export const allOrderEntryForSerializing: string[] = [
  ...extendedOrderEntryForSerializing,
];
export class OrderEntryEntity extends ModelEntity implements IOrderEntry {

  @Expose({ groups: ['default'] })
  text: string;

  @Expose({ groups: ['default'] })
  amount: number;

  @Expose({ groups: ['default'] })
  price: number;

  @Expose({ groups: ['default'] })
  customerRabatt: number;

  @Expose({ groups: ['default'] })
  articleGroupRabatt: number;

  @Expose({ groups: ['default'] })
  @Type(() => ArticleEntity)
  article: ArticleEntity;

  @Expose({ groups: ['default'] })
  @Type(() => SlipsheetEntity)
  slipsheet: SlipsheetEntity;

  @Expose({ groups: ['orderEntry.timestamps'] })
  lastSeen: Date;
  @Expose({ groups: ['orderEntry.timestamps'] })
  createdAt: Date;
  @Expose({ groups: ['orderEntry.timestamps'] })
  updatedAt: Date;
}
