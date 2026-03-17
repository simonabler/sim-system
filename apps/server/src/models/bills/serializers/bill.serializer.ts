import { Expose } from 'class-transformer';
import { ModelEntity } from '../../../common/serializers/model.serializer';
import { BillState } from '../enums/bill-state.enum';
import { IBill } from '../interfaces/bill.interface';
import { SlipsheetEntity } from './slipsheet.serializer';

export const defaultBillForSerializing: string[] = [
  'default',
  'bill_timestamps',
];
export const extendedBillForSerializing: string[] = [
  ...defaultBillForSerializing,
];
export const allBillForSerializing: string[] = [
  ...extendedBillForSerializing,
];
export class BillEntity extends ModelEntity implements IBill {

  @Expose({ groups: ['default'] })
  billNumber: string;

  @Expose({ groups: ['default'] })
  slipsheets: SlipsheetEntity[];

  @Expose({ groups: ['default'] })
  state: BillState;

  @Expose({ groups: ['default'] })
  billDate: Date;

  @Expose({ groups: ['default'] })
  path: string;

  @Expose({ groups: ['bill_timestamps'] })
  lastSeen: Date;
  @Expose({ groups: ['bill_timestamps'] })
  createdAt: Date;
  @Expose({ groups: ['bill_timestamps'] })
  updatedAt: Date;
}
