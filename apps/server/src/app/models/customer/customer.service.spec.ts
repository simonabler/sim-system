import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { repositoryMockFactory } from '../../utils/mocks/repositoryMockFactory';
import { CustomerRepository } from './customer.repository';
import { CustomerService } from './customer.service';

describe('CustomerService', () => {
  let service: CustomerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomerService,
        {
          provide: getRepositoryToken(CustomerRepository),
          useFactory: repositoryMockFactory,
        },
      ],
    }).compile();

    service = module.get<CustomerService>(CustomerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should calculate available ', async () => {

   
  });
});
