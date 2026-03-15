import { Discount } from './discount.model';

export class Customer {
  id: number;
  email: string;
  customerNumber: string;
  firstName: string;
  lastName: string;
  companyName: string;
  phoneCompany: string;
  phonePrivate: string;
  customerDiscount: number;

  address: string;
  postcode: string;
  country: string;
  uid: string;

  discounts: Discount[];

  created_at: Date;

  public constructor(init?: Partial<Customer>) {
    this.email = '';
    this.customerNumber = '';
    this.firstName = '';
    this.lastName = '';
    this.phoneCompany = '';
    this.address = '';
    this.postcode = '';
    this.country = '';
    this.customerDiscount = 0;
    this.uid = '';
    Object.assign(this, init);
    this.discounts = init?.discounts?.map(x => new Discount(x)) || new Array<Discount>();
  }

  public getName() {
    if (!this.companyName || this.companyName === '') {
      return this.lastName + ' ' + this.firstName;
    } else {
      return this.companyName;
    }
  }

}

