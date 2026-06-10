import { Expose } from 'class-transformer';
import { ModelEntity } from '../../../common/serializers/model.serializer';
import { ArticleGroupEntity } from '../../article/serializers/article-group.serializer';
import { CustomerEntity } from '../../customer/serializers/customer.serializer';
import { IDiscount } from '../interfaces/discount.interface';

export const defaultDiscountForSerializing: string[] = [
  'default',
];
export const extendedDiscountForSerializing: string[] = [
  ...defaultDiscountForSerializing,
];
export const allDiscountForSerializing: string[] = [
  ...extendedDiscountForSerializing,
];
export class DiscountEntity extends ModelEntity implements IDiscount {

  @Expose({ groups: ['default'] })
  value: number;

  @Expose({ groups: ['default'] })
  articleGroup: ArticleGroupEntity;

  @Expose({ groups: ['default'] })
  customer: CustomerEntity;

}
