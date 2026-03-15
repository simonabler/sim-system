import { ICustomer } from "../../customer/interfaces/customer.interface";
import { SlipsheetState } from "../enums/slipsheet-state.enum";
import { IAnnotation } from "./annotation.interface";
import { IBill } from "./bill.interface";
import { IOrderEntry } from "./order-entry.interface";

export interface ISlipsheet {
  slipsheetnumber: string;
  state: SlipsheetState;
  path: string;
  orderEntries: IOrderEntry[];
  customer: ICustomer;
  bill: IBill;
  annotations: IAnnotation[]
}
