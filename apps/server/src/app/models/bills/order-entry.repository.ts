import { EntityRepository } from 'typeorm';
import { OrderEntry } from './entities/order-entry.entity';
import { ModelRepository } from '../model.repository';
import {
  allOrderEntryForSerializing,
  OrderEntryEntity,
} from './serializers/order-entry.serializer';
import { classToPlain, plainToClass } from 'class-transformer';
@EntityRepository(OrderEntry)
export class OrderEntryRepository extends ModelRepository<OrderEntry, OrderEntryEntity> {
  transform(model: OrderEntry): OrderEntryEntity {
    const tranformOptions = {
      groups: allOrderEntryForSerializing,
    };
    return plainToClass(
      OrderEntryEntity,
      classToPlain(model, tranformOptions),
      tranformOptions,
    );
  }
  transformMany(models: OrderEntry[]): OrderEntryEntity[] {
    return models.map((model) => this.transform(model));
  }
}
