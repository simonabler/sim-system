import * as Joi from 'joi';
import { Module } from '@nestjs/common';
import configuration from './configuration';
import { MysqlConfigService } from './config.service';
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
        MYSQL_HOST: Joi.string().default('localhost'),
        MYSQL_PORT: Joi.number().default(3306),
        MYSQL_USERNAME: Joi.string().default('nestjs'),
        MYSQL_PASSWORD: Joi.string().default('nestjs'),
        MYSQL_DATABASE: Joi.string().default('nestjs'),
        MYSQL_RUN_MIGRATION: Joi.boolean().default(false),
        MYSQL_ENTITIES: Joi.string().default('dist/**/*.entity.*{ts,js}'),
        MYSQL_RUN_SYNCHRONIZE: Joi.boolean().default(false),
      }),
    }),
  ],
  providers: [ConfigService, MysqlConfigService],
  exports: [ConfigService, MysqlConfigService],
})
export class MysqlConfigModule { }
