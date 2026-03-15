import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from '../../common/base.service';
import { CustomerRepository } from './customer.repository';
import { Customer } from './entities/customer.entity';
import { CustomerEntity } from './serializers/customer.serializer';

@Injectable()
export class CustomerService extends BaseService<Customer, CustomerEntity> {

  constructor(
    @InjectRepository(CustomerRepository)
    private readonly customerRepository: CustomerRepository,
  ) { super(customerRepository) }
}
