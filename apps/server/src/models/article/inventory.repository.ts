import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { instanceToPlain, plainToInstance } from 'class-transformer';
import { ClassTransformOptions } from '@nestjs/common/interfaces/external/class-transform-options.interface';
import { ModelRepository } from '../model.repository';
import { Inventory } from './entities/inventory.entity';
import { allInventoryForSerializing, InventoryEntity, extendedInventoryForSerializing } from './serializers/inventory.serializer';

@Injectable()
export class InventoryRepository extends ModelRepository<Inventory, InventoryEntity> {
  constructor(private dataSource: DataSource) {
    super(Inventory, dataSource.createEntityManager());
  }

  transform(model: Inventory): InventoryEntity {
    const tranformOptions: ClassTransformOptions = {
      groups: extendedInventoryForSerializing,
    };
    return plainToInstance(
      InventoryEntity,
      instanceToPlain(model, tranformOptions),
      tranformOptions,
    );
  }

  transformMany(models: Inventory[]): InventoryEntity[] {
    return models.map((model) => this.transform(model));
  }
}
