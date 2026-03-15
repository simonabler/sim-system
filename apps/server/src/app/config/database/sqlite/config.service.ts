import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
/**
 * Service dealing with app config based operations.
 *
 * @class
 */
@Injectable()
export class SqliteConfigService {
  constructor(private configService: ConfigService) {}

  get path(): string {
    return this.configService.get<string>('sqlite.path');
  }
  get migrationsRun(): boolean {
    return JSON.parse(this.configService.get<string>('sqlite.migrationsRun'));
  }
  get synchronizeRun(): boolean {
    return JSON.parse(this.configService.get<string>('sqlite.synchronizeRun'));
  }
  get entities(): string {
    return this.configService.get<string>('sqlite.entities');
  }
}
