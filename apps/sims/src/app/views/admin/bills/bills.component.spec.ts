import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';
import { BillService } from '../../../services/bill.service';
import { ShoppingcartService } from '../../../services/shoppingcart.service';

import { BillsComponent } from './bills.component';

describe('BillsComponent', () => {
  let component: BillsComponent;
  let fixture: ComponentFixture<BillsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [BillsComponent],
      providers: [
        {
          provide: BillService,
          useValue: {
            get: () => of([]),
            recreate: () => of({}),
          },
        },
        {
          provide: ShoppingcartService,
          useValue: {
            getAll: () => of([]),
          },
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BillsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
