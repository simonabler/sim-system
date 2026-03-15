import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { ArticleService } from '../../../services/article.service';
import { ArticleGroupService } from '../../../services/article-group.service';

import { ArticleEditComponent } from './article-edit.component';

describe('ArticleEditComponent', () => {
  let component: ArticleEditComponent;
  let fixture: ComponentFixture<ArticleEditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ArticleEditComponent],
      providers: [
        {
          provide: ArticleService,
          useValue: {
            update: () => of({}),
            create: () => of({}),
            delete: () => of(true),
          },
        },
        {
          provide: ArticleGroupService,
          useValue: {
            getAll: () => of([]),
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
    fixture = TestBed.createComponent(ArticleEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
