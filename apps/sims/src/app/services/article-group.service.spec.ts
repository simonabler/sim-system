import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { ArticleGroupService } from './article-group.service';

describe('ArticleGroupService', () => {
  let service: ArticleGroupService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(ArticleGroupService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
