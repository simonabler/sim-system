import { Expose, Type } from 'class-transformer';
import { ModelEntity } from '../../../common/serializers/model.serializer';
import { CustomerEntity } from '../../customer/serializers/customer.serializer';
import { OrderEntry } from '../entities/order-entry.entity';
import { SlipsheetState } from '../enums/slipsheet-state.enum';
import { IBill } from '../interfaces/bill.interface';
import { IOrderEntry } from '../interfaces/order-entry.interface';
import { ISlipsheet } from '../interfaces/slipsheet.interface';
import { AnnotationEntity } from './annotation.serializer';
import { BillEntity } from './bill.serializer';
import { OrderEntryEntity } from './order-entry.serializer';

export const defaultSlipsheetForSerializing: string[] = [
  'default',
  'slipsheet.timestamps',
];
export const extendedSlipsheetForSerializing: string[] = [
  ...defaultSlipsheetForSerializing,
];
export const allSlipsheetForSerializing: string[] = [
  ...extendedSlipsheetForSerializing,
];
export class SlipsheetEntity extends ModelEntity implements ISlipsheet {
  
  @Expose({ groups: ['default'] })
  slipsheetnumber: string;

  @Expose({ groups: ['default'] })
  @Type(()=>OrderEntryEntity)
  orderEntries: OrderEntryEntity[];

  @Expose({ groups: ['default'] })
  bill: BillEntity;

  @Expose({ groups: ['default'] })
  printDate: Date;

  @Expose({ groups: ['default'] })
  state: SlipsheetState;
  
  @Expose({ groups: ['default'] })
  path: string;
  
  @Expose({ groups: ['default'] })
  name: string;

  @Expose({ groups: ['default'] })
  @Type(()=>CustomerEntity)
  customer: CustomerEntity;

  @Expose({ groups: ['default'] })
  @Type(()=>AnnotationEntity)
  annotations: AnnotationEntity[];

  @Expose({ groups: ['slipsheet.timestamps'] })
  createdAt: Date;
  @Expose({ groups: ['slipsheet.timestamps'] })
  updatedAt: Date;
}
