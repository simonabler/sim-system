import { EntityRepository } from 'typeorm';
import { Slipsheet } from './entities/slipsheet.entity';
import { ModelRepository } from '../model.repository';
import {
  allSlipsheetForSerializing,
  SlipsheetEntity,
} from './serializers/slipsheet.serializer';
import { classToPlain, plainToClass } from 'class-transformer';
@EntityRepository(Slipsheet)
export class SlipsheetRepository extends ModelRepository<Slipsheet, SlipsheetEntity> {
  transform(model: Slipsheet): SlipsheetEntity {
    const tranformOptions = {
      groups: allSlipsheetForSerializing,
    };
    return plainToClass(
      SlipsheetEntity,
      classToPlain(model, tranformOptions),
      tranformOptions,
    );
  }
  transformMany(models: Slipsheet[]): SlipsheetEntity[] {
    return models.map((model) => this.transform(model));
  }
}
