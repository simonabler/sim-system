import { Shoppingcart } from './shoppingcart.model';
import { Bill } from './bill.model';
import { Customer } from './customer.model';

export class BillWithShop extends Bill {
  slipsheets: Array<Shoppingcart>;

  public constructor(init?: Partial<BillWithShop>) {
    super();
    Object.assign(this, init);
    this.slipsheets = init?.slipsheets?.map(x => new Shoppingcart(x)) || new Array<Shoppingcart>();
  }

  public getPrice() {
    return this.slipsheets.map(cart => cart.getPrice()).reduce((accumulator, currentValue) => accumulator + currentValue, 0);
  }

  public getCustomer() {
    return this.slipsheets[0]?.customer || new Customer();
  }

  public getOverallClosed() {
    const billClosed = this.state === 'closed';
    const someClosed = this.slipsheets.every(o => o.state === 'closed')



    return someClosed && billClosed;
  }
}
