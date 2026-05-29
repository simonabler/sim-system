export interface BankAccount {
  name: string;
  iban: string;
  bic: string;
}

export type LetterheadMode = 'generated' | 'disabled' | 'template_pdf';

export interface PrinterOption {
  deviceId: string;
  name: string;
}

export class CompanySettings {
  id?: number;
  companyName: string = '';
  street: string = '';
  zip: string = '';
  city: string = '';
  country: string = 'Österreich';
  phone: string = '';
  email: string = '';
  website: string = '';
  firmenbuchnummer: string = '';
  vatId: string = '';
  issueCity: string = '';
  vatRate: number = 20;
  paymentTermDays: number = 14;
  paymentFooterText: string = '';
  bankAccounts: BankAccount[] = [];
  logoPath: string | null = null;
  badge1Path: string | null = null;
  badge2Path: string | null = null;
  letterheadMode: LetterheadMode = 'generated';
  templatePdfPath: string | null = null;
  printDeliverySlipLetterhead: boolean = true;
  printerName: string = '';
  printCopies: number = 1;
  updatedAt?: Date;

  constructor(init?: Partial<CompanySettings>) {
    Object.assign(this, init);
  }
}
