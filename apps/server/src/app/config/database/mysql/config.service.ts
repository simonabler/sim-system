import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
/**
 * Service dealing with app config based operations.
 *
 * @class
 */
@Injectable()
export class MysqlConfigService {
  constructor(private configService: ConfigService) {}

  get host(): string {
    return this.configService.get<string>('mysql.host');
  }
  get port(): number {
    return Number(this.configService.get<number>('mysql.port'));
  }
  get username(): string {
    return this.configService.get<string>('mysql.username');
  }
  get password(): string {
    return this.configService.get<string>('mysql.password');
  }
  get database(): string {
    return this.configService.get<string>('mysql.database');
  }
  get migrationsRun(): boolean {
    return JSON.parse(this.configService.get<string>('mysql.migrationsRun'));
  }
  get synchronizeRun(): boolean {
    return JSON.parse(this.configService.get<string>('mysql.synchronizeRun'));
  }
  get entities(): string {
    return this.configService.get<string>('mysql.entities');
  }
}
