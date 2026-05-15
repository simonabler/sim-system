import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SqliteConfigService {
  constructor(private configService: ConfigService) {}

  get path(): string {
    return this.configService.get<string>('sqlite.path', 'sim.db');
  }
  get migrationsRun(): boolean {
    return JSON.parse(this.configService.get<string>('sqlite.migrationsRun', 'false'));
  }
  get synchronizeRun(): boolean {
    return JSON.parse(this.configService.get<string>('sqlite.synchronizeRun', 'false'));
  }
  get entities(): string {
    return this.configService.get<string>('sqlite.entities', 'dist/**/*.entity.js');
  }

  get logging(): string[] {
    return [this.configService.get<string>('sqlite.logging', 'error')];
  }

}
