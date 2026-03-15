import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { EMPTY } from 'rxjs';
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
            getAll: () => EMPTY,
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
