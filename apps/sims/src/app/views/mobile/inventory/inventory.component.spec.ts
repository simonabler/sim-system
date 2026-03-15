import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { ArticleService } from '../../../services/article.service';

import { InventoryComponent } from './inventory.component';

describe('InventoryComponent', () => {
  let component: InventoryComponent;
  let fixture: ComponentFixture<InventoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [InventoryComponent],
      providers: [
        {
          provide: ArticleService,
          useValue: {
            getByCode: () => of(null),
            createInventory: () => of({ stock: 0, unit: '' }),
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
    fixture = TestBed.createComponent(InventoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
