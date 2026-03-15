import { EntityRepository } from 'typeorm';
import { ModelRepository } from '../model.repository';
import { classToPlain, plainToClass } from 'class-transformer';
import { ClassTransformOptions } from '@nestjs/common/interfaces/external/class-transform-options.interface';
import { Inventory } from './entities/inventory.entity';
import { allInventoryForSerializing, InventoryEntity, extendedInventoryForSerializing } from './serializers/inventory.serializer';

@EntityRepository(Inventory)
export class InventoryRepository extends ModelRepository<
  Inventory,
  InventoryEntity
> {
  transform(model: Inventory): InventoryEntity {
    const tranformOptions: ClassTransformOptions = {
      groups: extendedInventoryForSerializing,
      //  excludeExtraneousValues: true,
    };
    return plainToClass(
      InventoryEntity,
      classToPlain(model, tranformOptions),
      tranformOptions,
    );
  }
  transformMany(models: Inventory[]): InventoryEntity[] {
    return models.map((model) => this.transform(model));
  }
}
