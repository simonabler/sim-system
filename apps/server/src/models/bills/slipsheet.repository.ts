import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { instanceToPlain, plainToInstance } from 'class-transformer';
import { ModelRepository } from '../model.repository';
import { Slipsheet } from './entities/slipsheet.entity';
import { allSlipsheetForSerializing, SlipsheetEntity } from './serializers/slipsheet.serializer';

@Injectable()
export class SlipsheetRepository extends ModelRepository<Slipsheet, SlipsheetEntity> {
  constructor(private dataSource: DataSource) {
    super(Slipsheet, dataSource.createEntityManager());
  }

  transform(model: Slipsheet): SlipsheetEntity {
    const tranformOptions = {
      groups: allSlipsheetForSerializing,
    };
    return plainToInstance(
      SlipsheetEntity,
      instanceToPlain(model, tranformOptions),
      tranformOptions,
    );
  }

  transformMany(models: Slipsheet[]): SlipsheetEntity[] {
    return models.map((model) => this.transform(model));
  }
}
