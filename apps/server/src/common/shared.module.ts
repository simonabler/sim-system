import { Module } from '@nestjs/common';
import { AppConfigModule } from '../config/app/config.module';
import { PdfMakerService } from './services/pdfmaker.service';
import { PrinterService } from './services/printer.service';

@Module({
  imports: [AppConfigModule],
  providers: [PdfMakerService, PrinterService],
  exports: [PdfMakerService, PrinterService],
})
export class SharedModule {}
