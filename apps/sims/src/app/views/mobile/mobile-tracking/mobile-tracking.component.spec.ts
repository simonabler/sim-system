import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { CustomerService } from '../../../services/customer.service';
import { ArticleService } from '../../../services/article.service';
import { ShoppingcartService } from '../../../services/shoppingcart.service';

import { MobileTrackingComponent } from './mobile-tracking.component';

describe('MobileTrackingComponent', () => {
  let component: MobileTrackingComponent;
  let fixture: ComponentFixture<MobileTrackingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [MobileTrackingComponent],
      providers: [
        {
          provide: CustomerService,
          useValue: {
            currentCustomer: null,
            getAll: () => of([]),
            selectCustomer: () => undefined,
          },
        },
        {
          provide: ArticleService,
          useValue: {
            getByCode: () => of(null),
          },
        },
        {
          provide: ShoppingcartService,
          useValue: {
            post: () => of({}),
          },
        },
        {
          provide: ToastrService,
          useValue: {
            success: () => undefined,
            error: () => undefined,
          },
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MobileTrackingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
