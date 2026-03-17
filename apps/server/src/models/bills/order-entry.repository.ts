import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { instanceToPlain, plainToInstance } from 'class-transformer';
import { ModelRepository } from '../model.repository';
import { OrderEntry } from './entities/order-entry.entity';
import { allOrderEntryForSerializing, OrderEntryEntity } from './serializers/order-entry.serializer';

@Injectable()
export class OrderEntryRepository extends ModelRepository<OrderEntry, OrderEntryEntity> {
  constructor(private dataSource: DataSource) {
    super(OrderEntry, dataSource.createEntityManager());
  }

  transform(model: OrderEntry): OrderEntryEntity {
    const tranformOptions = {
      groups: allOrderEntryForSerializing,
    };
    return plainToInstance(
      OrderEntryEntity,
      instanceToPlain(model, tranformOptions),
      tranformOptions,
    );
  }

  transformMany(models: OrderEntry[]): OrderEntryEntity[] {
    return models.map((model) => this.transform(model));
  }
}
