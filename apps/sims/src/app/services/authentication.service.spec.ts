import { TestBed } from '@angular/core/testing';

import { AuthenticationService } from './authentication.service';
import { HttpClientModule } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';


describe('AuthenticationService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientModule,
        HttpClientTestingModule
      ], providers: [AuthenticationService],
    });
  });


  it('should be created', () => {
    const service: AuthenticationService = TestBed.inject(AuthenticationService);
    // expect(service).toBeTruthy();
  });
});
