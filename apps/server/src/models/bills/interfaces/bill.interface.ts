import { BillState } from '../enums/bill-state.enum';
import { ISlipsheet } from './slipsheet.interface';

export interface IBill {
  billNumber: string;
  slipsheets: ISlipsheet[];
  state: BillState;
  billDate: Date;
  path: string;
}
