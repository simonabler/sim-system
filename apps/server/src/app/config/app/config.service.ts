import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
/**
 * Service dealing with app config based operations.
 *
 * @class
 */
@Injectable()
export class AppConfigService {
  constructor(private configService: ConfigService) {}

  get name(): string {
    return this.configService.get<string>('app.name');
  }
  get env(): string {
    return this.configService.get<string>('app.env');
  }
  get url(): string {
    return this.configService.get<string>('app.url');
  }
  get port(): number {
    return Number(this.configService.get<number>('app.port'));
  }
  get jwt_secret(): string {
    return this.configService.get<string>('app.jwt_secret');
  }
  get jwt_expires(): string {
    return this.configService.get<string>('app.jwt_expires');
  }

  get pdf_slip_path(): string {
    return this.configService.get<string>('app.pdf_slip_path');
  }

  get pdf_bill_path(): string {
    return this.configService.get<string>('app.pdf_bill_path');
  }

  get printer(): string {
    return this.configService.get<string>('app.printer');
  }


}
