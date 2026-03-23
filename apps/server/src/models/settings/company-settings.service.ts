import { Injectable } from '@nestjs/common';
import { CompanySettingsRepository } from './company-settings.repository';
import { CompanySettingsEntity } from './serializers/company-settings.serializer';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { CompanySettings } from './entities/company-settings.entity';

@Injectable()
export class CompanySettingsService {
  constructor(private readonly repo: CompanySettingsRepository) {}

  async get(): Promise<CompanySettingsEntity | null> {
    return this.repo.get(1, [], false);
  }

  async upsert(dto: UpdateSettingsDto): Promise<CompanySettingsEntity> {
    const existing = await this.repo.findOne({ where: { id: 1 } });
    if (existing) {
      return this.repo.updateEntity(1, dto as any);
    }
    const created = await this.repo.save({ id: 1, ...dto } as CompanySettings);
    return this.repo.transform(created);
  }

  async updateAssetPath(
    field: 'logoPath' | 'badge1Path' | 'badge2Path' | 'templatePdfPath',
    path: string,
  ): Promise<CompanySettingsEntity> {
    const existing = await this.repo.findOne({ where: { id: 1 } });
    if (existing) {
      return this.repo.updateEntity(1, { [field]: path } as any);
    }
    const created = await this.repo.save(
      Object.assign(new CompanySettings(), { id: 1, [field]: path }),
    );
    return this.repo.transform(created);
  }
}
