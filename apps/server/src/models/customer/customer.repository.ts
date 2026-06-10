import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { instanceToPlain, plainToInstance } from 'class-transformer';
import { ClassTransformOptions } from '@nestjs/common/interfaces/external/class-transform-options.interface';
import { ModelRepository } from '../model.repository';
import { Customer } from './entities/customer.entity';
import { allCustomerForSerializing, CustomerEntity } from './serializers/customer.serializer';

@Injectable()
export class CustomerRepository extends ModelRepository<Customer, CustomerEntity> {
  constructor(private dataSource: DataSource) {
    super(Customer, dataSource.createEntityManager());
  }

  transform(model: Customer): CustomerEntity {
    const tranformOptions: ClassTransformOptions = {
      groups: allCustomerForSerializing,
    };
    return plainToInstance(
      CustomerEntity,
      instanceToPlain(model, tranformOptions),
      tranformOptions,
    );
  }

  transformMany(models: Customer[]): CustomerEntity[] {
    return models.map((model) => this.transform(model));
  }
}
