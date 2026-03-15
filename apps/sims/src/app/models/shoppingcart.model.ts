import { Customer } from './customer.model';
import { Order } from './order.model';
import { Bill } from './bill.model';
import { DeliverySlip } from './deliverySlip.model';

export class Shoppingcart {
  id: number;
  customer: Customer;
  orderEntries: Order[];
  state: string;
  paymentAt: Date;
  updatedAt: Date;
  bill: Bill;
  deliverySlip: DeliverySlip;
  slipsheetnumber: number;
  annotations;
  printDate;
  customerRabatt;
  articleGroupRabatt;

  public constructor(init?: Partial<Shoppingcart>) {
    this.state = 'open';
    Object.assign(this, init);
    this.orderEntries = init?.orderEntries?.map(x => new Order(x)) || new Array<Order>();
    this.customer = new Customer(init?.customer);
    this.bill = new Bill(init?.bill);
    // this.deliverySlip = new DeliverySlip(init?.deliverySlip);
  }


  getPrice() {
    return this.orderEntries
      .reduce((sum, current) => sum + current.getPrice(), 0);
  }

  getAmountItems() {
    return this.orderEntries
      .reduce((sum, current) => sum + current.amount, 0);
  }

  getState() {

    switch (this.state) {
      case 'open': return 'offen';
      case 'closed': return 'fertig';
      case 'payed': return 'bezahlt';
      case 'changed': return 'bearbeitet';
      case 'edit': return 'bearbeitet';
      case 'deliveryPrint': return 'Lieferschein';
      default: return 'unknown';
    }



  }

  isEditable() {
    let isBill = false;
    let isSlip = false;

    if (this.bill?.billPath) {
      isBill = true;
    }
    if (this.deliverySlip?.deliverySlipPath) {
      isSlip = true;
    }

    return !isBill && !isSlip;

  }
}

