import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { print } from 'pdf-to-printer';
import { AppConfigService } from '../../config/app/config.service';

@Injectable()
export class PrinterService {

  constructor(private appConfigService: AppConfigService) {}
  async print(path: string): Promise<boolean> {
    const options = {
      printer: this.appConfigService.printer
    };
    try {
      await print(path, options);
      return true;
    } catch (error) {
      throw new InternalServerErrorException('Drucken fehlgeschlagen');
    }
    return false;
  }
}
