import {
  Column,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import {
  ICompanySettings,
  LetterheadMode,
} from '../interfaces/company-settings.interface';

@Entity({ name: 'company_settings' })
export class CompanySettings implements ICompanySettings {
  @PrimaryColumn({ default: 1 })
  id: number;

  @Column({ nullable: true, default: null })
  companyName: string | null;

  @Column({ nullable: true, default: null })
  street: string | null;

  @Column({ nullable: true, default: null })
  zip: string | null;

  @Column({ nullable: true, default: null })
  city: string | null;

  @Column({ nullable: true, default: 'Österreich' })
  country: string | null;

  @Column({ nullable: true, default: null })
  phone: string | null;

  @Column({ nullable: true, default: null })
  email: string | null;

  @Column({ nullable: true, default: null })
  website: string | null;

  @Column({ nullable: true, default: null })
  firmenbuchnummer: string | null;

  @Column({ nullable: true, default: null })
  vatId: string | null;

  @Column({ nullable: true, default: null })
  issueCity: string | null;

  @Column({ default: 20 })
  vatRate: number;

  @Column({ default: 14 })
  paymentTermDays: number;

  @Column({ nullable: true, default: null, type: 'text' })
  paymentFooterText: string | null;

  @Column({ type: 'simple-json', nullable: true, default: '[]' })
  bankAccounts: Array<{ name: string; iban: string; bic: string }>;

  @Column({ nullable: true, default: null })
  logoPath: string | null;

  @Column({ nullable: true, default: null })
  badge1Path: string | null;

  @Column({ nullable: true, default: null })
  badge2Path: string | null;

  @Column({ nullable: false, default: 'generated', length: 20 })
  letterheadMode: LetterheadMode;

  @Column({ nullable: true, default: null })
  templatePdfPath: string | null;

  @Column({ default: true })
  printDeliverySlipLetterhead: boolean;

  @Column({ nullable: true, default: null })
  printerName: string | null;

  @Column({ default: 1 })
  printCopies: number;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
