export class DeliverySlip {
  id: number;
  number: number;
  year: Date;
  deliverySlipPath: string;
  deliverySlipNumber: string;


  public constructor(init?: Partial<DeliverySlip>) {
    Object.assign(this, init);
  }

  getNumber() {

    if (!this.deliverySlipNumber) {
      return '';
    }
    return this.deliverySlipNumber;
  }
}
