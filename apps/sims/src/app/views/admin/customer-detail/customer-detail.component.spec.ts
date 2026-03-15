import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ModalModule } from 'ngx-bootstrap/modal';
import { CustomerService } from '../../../services/customer.service';
import { BillService } from '../../../services/bill.service';
import { ArticleGroupService } from '../../../services/article-group.service';

import { CustomerDetailComponent } from './customer-detail.component';

describe('CustomerDetailComponent', () => {
  let component: CustomerDetailComponent;
  let fixture: ComponentFixture<CustomerDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ModalModule.forRoot()],
      declarations: [CustomerDetailComponent],
      providers: [
        {
          provide: CustomerService,
          useValue: {
            getById: () => of({ id: 1, discounts: [] }),
            getShoppingcarts: () => of([]),
            getBills: () => of([]),
            create: () => of({}),
            update: () => of({}),
          },
        },
        {
          provide: BillService,
          useValue: {
            update: () => of({}),
            post: () => of({}),
            recreate: () => of({}),
          },
        },
        {
          provide: ArticleGroupService,
          useValue: {
            getAll: () => of([]),
          },
        },
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of(convertToParamMap({ id: '1' })),
          },
        },
        {
          provide: Router,
          useValue: {
            url: '/admin/customer/detail/1',
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
    fixture = TestBed.createComponent(CustomerDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
