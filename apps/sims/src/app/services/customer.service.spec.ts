import { TestBed } from '@angular/core/testing';

import { CustomerService } from './customer.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { HttpClientModule } from '@angular/common/http';

describe('CustomerService', () => {
  beforeEach(() => TestBed.configureTestingModule(
    {
      imports: [
        HttpClientModule,
        HttpClientTestingModule
      ]
    }));

  it('should be created', () => {
    const service: CustomerService = TestBed.inject(CustomerService);
    expect(service).toBeTruthy();
  });
});
