import { Expose } from 'class-transformer';
import { ModelEntity } from '../../../common/serializers/model.serializer';
import { ICompanySettings } from '../interfaces/company-settings.interface';

export const defaultSettingsGroupsForSerializing: string[] = ['default', 'settings.default'];

export class CompanySettingsEntity extends ModelEntity implements ICompanySettings {
  @Expose({ groups: ['default'] }) companyName: string | null;
  @Expose({ groups: ['default'] }) street: string | null;
  @Expose({ groups: ['default'] }) zip: string | null;
  @Expose({ groups: ['default'] }) city: string | null;
  @Expose({ groups: ['default'] }) country: string | null;
  @Expose({ groups: ['default'] }) phone: string | null;
  @Expose({ groups: ['default'] }) email: string | null;
  @Expose({ groups: ['default'] }) website: string | null;
  @Expose({ groups: ['default'] }) firmenbuchnummer: string | null;
  @Expose({ groups: ['default'] }) vatId: string | null;
  @Expose({ groups: ['default'] }) issueCity: string | null;
  @Expose({ groups: ['default'] }) vatRate: number;
  @Expose({ groups: ['default'] }) paymentTermDays: number;
  @Expose({ groups: ['default'] }) paymentFooterText: string | null;
  @Expose({ groups: ['default'] }) bankAccounts: Array<{ name: string; iban: string; bic: string }>;
  @Expose({ groups: ['default'] }) logoPath: string | null;
  @Expose({ groups: ['default'] }) badge1Path: string | null;
  @Expose({ groups: ['default'] }) badge2Path: string | null;
  @Expose({ groups: ['default'] }) letterheadMode: 'generated' | 'disabled' | 'template_pdf';
  @Expose({ groups: ['default'] }) templatePdfPath: string | null;
  @Expose({ groups: ['default'] }) printDeliverySlipLetterhead: boolean;
  @Expose({ groups: ['default'] }) printerName: string | null;
  @Expose({ groups: ['default'] }) printCopies: number;
  @Expose({ groups: ['default'] }) updatedAt: Date;
}
