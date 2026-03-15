import { TestBed } from '@angular/core/testing';

import { UserService } from './user.service';

import { HttpClientModule } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('UserService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientModule,
        HttpClientTestingModule
    ],
    });
  });


  it('should be created', () => {
    const service: UserService = TestBed.inject(UserService);
    expect(service).toBeTruthy();
  });
});
