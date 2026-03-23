export type LetterheadMode = 'generated' | 'disabled' | 'template_pdf';

export interface ICompanySettings {
  id: number;
  companyName: string | null;
  street: string | null;
  zip: string | null;
  city: string | null;
  country: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  firmenbuchnummer: string | null;
  vatId: string | null;
  issueCity: string | null;
  vatRate: number;
  paymentTermDays: number;
  paymentFooterText: string | null;
  bankAccounts: Array<{ name: string; iban: string; bic: string }>;
  logoPath: string | null;
  badge1Path: string | null;
  badge2Path: string | null;
  letterheadMode: LetterheadMode;
  templatePdfPath: string | null;
  updatedAt: Date;
}
