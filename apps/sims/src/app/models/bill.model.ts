import { Shoppingcart } from './shoppingcart.model';

export class Bill {
  id: number;
  billNumber: number;
  // year: number;
  billPath: string;
  billDate: string;
  state: string;
  updatedAt: Date;
  createdAt: Date;
  paymentAt: Date;
  public constructor(init?: Partial<Bill>) {
    Object.assign(this, init);
    // this.shoppingcarts = init?.shoppingcarts?.map(x => new Shoppingcart(x)) || new Array<Shoppingcart>();
  }

  getNumber() {
    if (/*!this.year || */!this.billNumber) {
      return '';
    }
    return 'R' + /*this.year + '/' +*/ this.billNumber;
  }


}
