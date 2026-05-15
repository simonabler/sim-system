import { Module } from '@nestjs/common';
import configuration from './configuration';
import { AppConfigService } from './config.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forFeature(configuration),
  ],
  providers: [AppConfigService],
  exports: [ConfigModule, AppConfigService],
})
export class AppConfigModule {}
