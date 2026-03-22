import { Module } from '@nestjs/common';
import { AppConfigModule } from '../config/app/config.module';
import { CompanySettingsModule } from '../models/settings/company-settings.module';
import { PdfMakerService } from './services/pdfmaker.service';
import { PrinterService } from './services/printer.service';

@Module({
  imports: [AppConfigModule, CompanySettingsModule],
  providers: [PdfMakerService, PrinterService],
  exports: [PdfMakerService, PrinterService],
})
export class SharedModule {}
