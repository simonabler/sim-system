import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { ModalModule } from 'ngx-bootstrap/modal';
import { ArticleService } from '../../../services/article.service';
import { ArticleGroupService } from '../../../services/article-group.service';

import { ArticleComponent } from './article.component';

describe('ArticleComponent', () => {
  let component: ArticleComponent;
  let fixture: ComponentFixture<ArticleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ModalModule.forRoot()],
      declarations: [ArticleComponent],
      providers: [
        {
          provide: ArticleService,
          useValue: {
            getAll: () => of([]),
            importArticle: () => of([]),
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
            queryParams: of({}),
          },
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ArticleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
