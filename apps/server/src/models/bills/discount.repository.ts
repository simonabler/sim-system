import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { instanceToPlain, plainToInstance } from 'class-transformer';
import { ModelRepository } from '../model.repository';
import { Discount } from './entities/discount.entity';
import { allDiscountForSerializing, DiscountEntity } from './serializers/discount.serializer';

@Injectable()
export class DiscountRepository extends ModelRepository<Discount, DiscountEntity> {
  constructor(private dataSource: DataSource) {
    super(Discount, dataSource.createEntityManager());
  }

  transform(model: Discount): DiscountEntity {
    const tranformOptions = {
      groups: allDiscountForSerializing,
    };
    return plainToInstance(
      DiscountEntity,
      instanceToPlain(model, tranformOptions),
      tranformOptions,
    );
  }

  transformMany(models: Discount[]): DiscountEntity[] {
    return models.map((model) => this.transform(model));
  }
}
