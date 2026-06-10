import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { instanceToPlain, plainToInstance } from 'class-transformer';
import { ModelRepository } from '../model.repository';
import { Bill } from './entities/bill.entity';
import { allBillForSerializing, BillEntity } from './serializers/bill.serializer';

@Injectable()
export class BillRepository extends ModelRepository<Bill, BillEntity> {
  constructor(private dataSource: DataSource) {
    super(Bill, dataSource.createEntityManager());
  }

  transform(model: Bill): BillEntity {
    const tranformOptions = {
      groups: allBillForSerializing,
    };
    return plainToInstance(
      BillEntity,
      instanceToPlain(model, tranformOptions),
      tranformOptions,
    );
  }

  transformMany(models: Bill[]): BillEntity[] {
    return models.map((model) => this.transform(model));
  }
}
