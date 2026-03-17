export class Discount {
  id!: number;
  value!: number;
  articleGroup!: { id: number; name: string };
  constructor(init?: Partial<Discount>) { Object.assign(this, init); }
}

export class Customer {
  id!: number;
  email: string;
  customerNumber: string;
  firstName: string;
  lastName: string;
  companyName!: string;
  phoneCompany: string;
  phonePrivate!: string;
  customerDiscount: number;
  address: string;
  postcode: string;
  country: string;
  uid: string;
  discounts: Discount[];
  createdAt!: Date;

  constructor(init?: Partial<Customer>) {
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
    this.discounts = (init?.discounts || []).map(x => new Discount(x));
  }

  getName(): string {
    if (!this.companyName || this.companyName === '') {
      return `${this.lastName} ${this.firstName}`.trim();
    }
    return this.companyName;
  }

  getInitials(): string {
    const name = this.getName();
    return name.split(' ').slice(0, 2).map(w => w[0] || '').join('').toUpperCase();
  }
}
