import { Expose, Type } from 'class-transformer';
import { ModelEntity } from '../../../common/serializers/model.serializer';
import { Discount } from '../../bills/entities/discount.entity';
import { DiscountEntity } from '../../bills/serializers/discount.serializer';
import { ICustomer } from '../interfaces/customer.interface';

export const defaultCustomerForSerializing: string[] = [
  'default',
  'slipsheet.timestamps',
];
export const extendedCustomerForSerializing: string[] = [
  'customer.timestamps',
  ...defaultCustomerForSerializing,
];
export const allCustomerForSerializing: string[] = [
  ...extendedCustomerForSerializing,
];
export class CustomerEntity
  extends ModelEntity
  implements ICustomer {


  @Expose({ groups: ['default'] })
  firstName: string;
  @Expose({ groups: ['default'] })
  lastName: string;
  @Expose({ groups: ['default'] })
  customerNumber: string;
  @Expose({ groups: ['default'] })
  customerDiscount: number;
  @Expose({ groups: ['default'] })
  email: string;
  @Expose({ groups: ['default'] })
  companyName: string;
  @Expose({ groups: ['default'] })
  address: string;
  @Expose({ groups: ['default'] })
  postcode: string;
  @Expose({ groups: ['default'] })
  phoneCompany: string;
  @Expose({ groups: ['default'] })
  phonePrivate: string;
  @Expose({ groups: ['default'] })
  uid: string;
  @Expose({ groups: ['default'] })
  country: string;
  @Expose({ groups: ['default'] })
  @Type(() => DiscountEntity)
  discounts: DiscountEntity[];



  @Expose({ groups: ['customer.timestamps'] })
  createdAt: Date;
  @Expose({ groups: ['customer.timestamps'] })
  updatedAt: Date;
}
