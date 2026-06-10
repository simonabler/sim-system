export class Order {
  id!: number;
  amount: number;
  price: number;
  article: any;
  text!: string;
  articleGroupRabatt: number;
  customerRabatt: number;

  constructor(init?: Partial<Order>) {
    this.amount = 0;
    this.price = 0;
    this.articleGroupRabatt = 0;
    this.customerRabatt = 0;
    Object.assign(this, init);
  }

  getPrice(): number {
    return (this.amount || 0) * (this.price || 0);
  }
}

export class Slipsheet {
  id!: number;
  slipsheetnumber!: string;
  state: string;
  billId?: number | null;
  bill?: { id?: number | null } | null;
  createdAt!: Date;
  updatedAt!: Date;
  customer: any;
  orderEntries: Order[];
  annotations!: any[];
  printDate: any;

  constructor(init?: Partial<Slipsheet>) {
    this.state = 'open';
    Object.assign(this, init);
    this.bill = init?.bill ?? null;
    this.billId = init?.billId ?? init?.bill?.id ?? null;
    this.orderEntries = (init?.orderEntries || []).map(x => new Order(x));
  }

  hasBill(): boolean {
    return !!(this.bill?.id ?? this.billId);
  }

  isCompleted(): boolean {
    return this.state === 'closed' && this.hasBill();
  }

  isOpen(): boolean {
    return !this.isCompleted();
  }

  getStateLabel(): string {
    switch (this.state) {
      case 'open':         return 'offen';
      case 'closed':       return 'fertig';
      case 'payed':        return 'bezahlt';
      case 'changed':      return 'bearbeitet';
      case 'edit':         return 'bearbeitet';
      case 'deliveryPrint': return 'Lieferschein';
      default: return this.state;
    }
  }

  getPrice(): number {
    return (this.orderEntries || []).reduce((sum, o) => sum + o.getPrice(), 0);
  }
}

export class Bill {
  id!: number;
  billNumber: string;
  billDate: string;
  state: string;
  path!: string;
  billPath!: string;
  createdAt!: Date;
  updatedAt!: Date;
  paymentAt!: Date;
  slipsheets: Slipsheet[];
  customer: any;

  constructor(init?: Partial<Bill>) {
    this.billNumber = '';
    this.billDate = '';
    this.state = 'open';
    Object.assign(this, init);
    this.slipsheets = (init?.slipsheets || []).map(x => new Slipsheet(x));
  }

  getNumber(): string {
    return this.billNumber || `RE-${this.id}`;
  }

  getTotal(): number {
    return (this.slipsheets || []).reduce((sum, s) => sum + s.getPrice(), 0);
  }
}

export class User {
  id!: number;
  username!: string;
  firstName!: string;
  lastName!: string;
  token!: string;
  constructor(init?: Partial<User>) { Object.assign(this, init); }
}
