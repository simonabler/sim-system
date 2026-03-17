import { Module } from '@nestjs/common';
import configuration from './configuration';
import { SqliteConfigService } from './config.service';
import { ConfigModule, ConfigService } from '@nestjs/config';

const ENV = process.env.NODE_ENV;
@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      envFilePath: !ENV ? '.env' : `.env.${ENV}`,
    }),
  ],
  providers: [ConfigService, SqliteConfigService],
  exports: [ConfigService, SqliteConfigService],
})
export class SqliteConfigModule {}
