import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { instanceToPlain, plainToInstance } from 'class-transformer';
import { ModelRepository } from '../model.repository';
import { CompanySettings } from './entities/company-settings.entity';
import {
  CompanySettingsEntity,
  defaultSettingsGroupsForSerializing,
} from './serializers/company-settings.serializer';

@Injectable()
export class CompanySettingsRepository extends ModelRepository<CompanySettings, CompanySettingsEntity> {
  constructor(private dataSource: DataSource) {
    super(CompanySettings, dataSource.createEntityManager());
  }

  transform(model: CompanySettings): CompanySettingsEntity {
    const transformOptions = { groups: defaultSettingsGroupsForSerializing };
    return plainToInstance(
      CompanySettingsEntity,
      instanceToPlain(model, transformOptions),
      transformOptions,
    );
  }

  transformMany(models: CompanySettings[]): CompanySettingsEntity[] {
    return models.map((m) => this.transform(m));
  }
}
