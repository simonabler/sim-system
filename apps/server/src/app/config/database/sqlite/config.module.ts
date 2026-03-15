import * as Joi from 'joi';
import { Module } from '@nestjs/common';
import configuration from './configuration';
import { SqliteConfigService } from './config.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
/**
 * Import and provide app configuration related classes.
 *
 * @module
 */
const ENV = process.env.NODE_ENV;
@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      envFilePath: !ENV ? '.env' : `.env.${ENV}`,
      validationSchema: Joi.object({
        SQLITE_PATH: Joi.string().default('test.db'),
        SQLITE_RUN_MIGRATION: Joi.boolean().default(false),
        SQLITE_ENTITIES: Joi.string().default('dist/**/*.entity.*{ts,js}'),
        SQLITE_RUN_SYNCHRONIZE: Joi.boolean().default(false),
      }),
    }),
  ],
  providers: [ConfigService, SqliteConfigService],
  exports: [ConfigService, SqliteConfigService],
})
export class SqliteConfigModule {}
