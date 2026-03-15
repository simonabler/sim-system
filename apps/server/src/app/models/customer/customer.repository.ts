import { EntityRepository } from 'typeorm';
import { ModelRepository } from '../model.repository';
import { classToPlain, plainToClass } from 'class-transformer';
import { ClassTransformOptions } from '@nestjs/common/interfaces/external/class-transform-options.interface';
import { Customer } from './entities/customer.entity';
import { allCustomerForSerializing, CustomerEntity } from './serializers/customer.serializer';

@EntityRepository(Customer)
export class CustomerRepository extends ModelRepository<
  Customer,
  CustomerEntity
> {
  transform(model: Customer): CustomerEntity {
    const tranformOptions: ClassTransformOptions = {
      groups: allCustomerForSerializing,
    //  excludeExtraneousValues: true,
    };
    return plainToClass(
      CustomerEntity,
      classToPlain(model, tranformOptions),
      tranformOptions,
    );
  }
  transformMany(models: Customer[]): CustomerEntity[] {
    return models.map((model) => this.transform(model));
  }
}
