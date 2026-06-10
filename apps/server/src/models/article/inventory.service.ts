import { Injectable } from '@nestjs/common';
import { BaseService } from '../../common/base.service';
import { InventoryRepository } from './inventory.repository';
import { Inventory } from './entities/inventory.entity';
import { InventoryEntity } from './serializers/inventory.serializer';

@Injectable()
export class InventoryService extends BaseService<Inventory, InventoryEntity> {
  constructor(
    private readonly inventoryRepository: InventoryRepository,
  ) {
    super(inventoryRepository);
  }
}
