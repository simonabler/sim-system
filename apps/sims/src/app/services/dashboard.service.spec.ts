import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';

import { DashboardService } from './dashboard.service';

describe('DashboardService', () => {
  let service: DashboardService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(DashboardService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should request dashboard summary with filters', () => {
    let responseData: any;

    service
      .getSummary({
        days: 14,
        threshold: 5,
        articleGroupId: 2,
      })
      .subscribe((data) => {
        responseData = data;
      });

    const req = httpMock.expectOne(
      (request) =>
        request.url === 'dashboard/summary' &&
        request.params.get('days') === '14' &&
        request.params.get('threshold') === '5' &&
        request.params.get('articleGroupId') === '2',
    );
    expect(req.request.method).toBe('GET');
    req.flush({
      success: true,
      data: {
        kpis: { lowStockCount: 3 },
        stockTrend: [],
      },
    });

    expect(responseData.kpis.lowStockCount).toBe(3);
  });
});
