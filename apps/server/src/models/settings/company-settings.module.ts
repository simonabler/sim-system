import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompanySettings } from './entities/company-settings.entity';
import { CompanySettingsRepository } from './company-settings.repository';
import { CompanySettingsService } from './company-settings.service';
import { CompanySettingsController } from './company-settings.controller';
import { MulterModule } from '@nestjs/platform-express';
import { join } from 'path';

@Module({
  imports: [
    TypeOrmModule.forFeature([CompanySettings]),
    MulterModule.register({ dest: join(process.cwd(), 'uploads', 'settings') }),
  ],
  controllers: [CompanySettingsController],
  providers: [CompanySettingsRepository, CompanySettingsService],
  exports: [CompanySettingsService],
})
export class CompanySettingsModule {}
