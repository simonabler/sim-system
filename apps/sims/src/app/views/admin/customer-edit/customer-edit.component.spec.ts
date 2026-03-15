import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ModalModule } from 'ngx-bootstrap/modal';
import { CustomerService } from '../../../services/customer.service';
import { BillService } from '../../../services/bill.service';
import { ArticleGroupService } from '../../../services/article-group.service';
import { ShoppingcartService } from '../../../services/shoppingcart.service';

import { CustomerEditComponent } from './customer-edit.component';

describe('CustomerEditComponent', () => {
  let component: CustomerEditComponent;
  let fixture: ComponentFixture<CustomerEditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ModalModule.forRoot()],
      declarations: [CustomerEditComponent],
      providers: [
        {
          provide: CustomerService,
          useValue: {
            getById: () => of({ discounts: [] }),
            create: () => of({}),
            update: () => of({}),
            deleteDiscount: () => of(true),
            updateOrCreateDiscount: () => of({}),
          },
        },
        {
          provide: BillService,
          useValue: {},
        },
        {
          provide: ArticleGroupService,
          useValue: {
            getAll: () => of([]),
          },
        },
        {
          provide: ShoppingcartService,
          useValue: {},
        },
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of(convertToParamMap({ id: 'new' })),
          },
        },
        {
          provide: Router,
          useValue: {
            url: '/admin/customer/edit/new',
            navigate: () => Promise.resolve(true),
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
    fixture = TestBed.createComponent(CustomerEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
