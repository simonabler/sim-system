import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { createReadStream } from 'fs';
import { CsvParser } from 'nest-csv-parser';
import { Readable } from 'stream';
import { MoreThan, SelectQueryBuilder } from 'typeorm';
import { BaseService } from '../../common/base.service';
import { OrderEntry } from '../bills/entities/order-entry.entity';
import { InventoryRepository } from './inventory.repository';
import { Inventory } from './entities/inventory.entity';
import { InventoryEntity } from './serializers/inventory.serializer';

@Injectable()
export class InventoryService extends BaseService<Inventory, InventoryEntity> {
  constructor(
    @InjectRepository(InventoryRepository)
    private readonly inventoryRepository: InventoryRepository,
    private readonly csvParser: CsvParser
  ) {
    super(inventoryRepository);
  }

}
