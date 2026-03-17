import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

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
    return this.configService.get<string>('app.url', 'http://localhost:9000');
  }
  get port(): number {
    return Number(this.configService.get<number>('app.port', 9000));
  }
  get jwt_secret(): string {
    return this.configService.get<string>('app.jwt_secret', 'ACCESS_TOKEN_SECRET');
  }
  get jwt_expires(): string {
    return this.configService.get<string>('app.jwt_expires', '30d');
  }

  get pdf_slip_path(): string {
    return this.configService.get<string>('app.pdf_slip_path', './slips');
  }

  get pdf_bill_path(): string {
    return this.configService.get<string>('app.pdf_bill_path', './bills');
  }

  get printer(): string {
    return this.configService.get<string>('app.printer', 'Microsoft Print to PDF');
  }
}
