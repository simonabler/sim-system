import { EntityRepository } from 'typeorm';
import { ModelRepository } from '../model.repository';
import { classToPlain, plainToClass } from 'class-transformer';
import { Discount } from './entities/discount.entity';
import { allDiscountForSerializing, DiscountEntity } from './serializers/discount.serializer';
@EntityRepository(Discount)
export class DiscountRepository extends ModelRepository<Discount, DiscountEntity> {
  transform(model: Discount): DiscountEntity {
    const tranformOptions = {
      groups: allDiscountForSerializing,
    };
    return plainToClass(
      DiscountEntity,
      classToPlain(model, tranformOptions),
      tranformOptions,
    );
  }
  transformMany(models: Discount[]): DiscountEntity[] {
    return models.map((model) => this.transform(model));
  }
}
