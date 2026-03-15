import * as Joi from '@hapi/joi';
import { Module } from '@nestjs/common';
import configuration from './configuration';
import { AppConfigService } from './config.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { join } from 'path';
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
        APP_NAME: Joi.string().default('MyApp'),
        APP_ENV: Joi.string()
          .valid('development', 'production', 'test', 'provision')
          .default('development'),
        APP_URL: Joi.string().default('http://localhost:9000'),
        APP_PORT: Joi.number().default(9000),
        APP_JWT_SECRET: Joi.string().default('ACCESS_TOKEN_SECRET'),
        APP_JWT_EXPIRES: Joi.string().default('30d'),
        APP_PDF_SLIP_PATH: Joi.string().default(join(__dirname, 'slip')),
        APP_PDF_BILL_PATH: Joi.string().default(join(__dirname, 'bill')),
        APP_PRINTER: Joi.string().default('Microsoft Print to PDF'),
      }),
    }),
  ],
  providers: [ConfigService, AppConfigService],
  exports: [ConfigService, AppConfigService],
})
export class AppConfigModule {}
