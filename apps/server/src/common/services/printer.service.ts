import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { print } from 'pdf-to-printer';
import { AppConfigService } from '../../config/app/config.service';
import { CompanySettingsService } from '../../models/settings/company-settings.service';

@Injectable()
export class PrinterService {
  constructor(
    private readonly appConfigService: AppConfigService,
    private readonly settingsService: CompanySettingsService,
  ) {}

  async print(path: string): Promise<boolean> {
    const settings = await this.settingsService.get();
    const printer = settings?.printerName?.trim() || this.appConfigService.printer;
    const copies = Math.max(1, settings?.printCopies ?? 1);
    const options = { printer };

    try {
      for (let i = 0; i < copies; i++) {
        await print(path, options);
      }
      return true;
    } catch (error) {
      throw new InternalServerErrorException('Drucken fehlgeschlagen');
    }
  }
}
