import { EntityRepository } from 'typeorm';
import { Bill } from './entities/bill.entity';
import { ModelRepository } from '../model.repository';
import {
  allBillForSerializing,
  BillEntity,
} from './serializers/bill.serializer';
import { classToPlain, plainToClass } from 'class-transformer';
@EntityRepository(Bill)
export class BillRepository extends ModelRepository<Bill, BillEntity> {
  transform(model: Bill): BillEntity {
    const tranformOptions = {
      groups: allBillForSerializing,
    };
    return plainToClass(
      BillEntity,
      classToPlain(model, tranformOptions),
      tranformOptions,
    );
  }
  transformMany(models: Bill[]): BillEntity[] {
    return models.map((model) => this.transform(model));
  }
}
