import { Module } from '@nestjs/common';
import configuration from './configuration';
import { SqliteConfigService } from './config.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forFeature(configuration),
  ],
  providers: [SqliteConfigService],
  exports: [ConfigModule, SqliteConfigService],
})
export class SqliteConfigModule {}
