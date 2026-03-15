import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { of } from 'rxjs';

import { DashboardComponent } from './dashboard.component';
import { DashboardService } from '../../services/dashboard.service';
import { ArticleGroupService } from '../../services/article-group.service';
import { Router } from '@angular/router';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let dashboardServiceSpy: jasmine.SpyObj<DashboardService>;

  const summaryMock: any = {
    generatedAt: new Date().toISOString(),
    filters: {
      from: new Date().toISOString(),
      to: new Date().toISOString(),
      days: 30,
      threshold: 10,
      articleGroupId: null,
    },
    kpis: {
      totalArticles: 100,
      trackedArticles: 80,
      lowStockCount: 4,
      outOfStockCount: 2,
      inventoryAdjustmentsTodayCount: 1,
      inventoryAdjustmentsTodayDelta: -3,
      openSlipsheets: 5,
      changedSlipsheets: 2,
      openBills: 3,
    },
    lowStockItems: [],
    recentInventoryActivities: [],
    documentQueue: {
      openSlipsheets: [],
      changedSlipsheets: [],
      openBills: [],
    },
    topMovingArticles7: [],
    topMovingArticles30: [],
    stockTrend: [],
  };

  beforeEach(async () => {
    dashboardServiceSpy = jasmine.createSpyObj('DashboardService', ['getSummary']);
    dashboardServiceSpy.getSummary.and.returnValue(of(summaryMock));

    await TestBed.configureTestingModule({
      imports: [CommonModule, FormsModule],
      declarations: [DashboardComponent],
      providers: [
        { provide: DashboardService, useValue: dashboardServiceSpy },
        {
          provide: ArticleGroupService,
          useValue: jasmine.createSpyObj('ArticleGroupService', {
            getAll: of([]),
          }),
        },
        {
          provide: Router,
          useValue: jasmine.createSpyObj('Router', ['navigate']),
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load dashboard summary on init', () => {
    expect(dashboardServiceSpy.getSummary).toHaveBeenCalledWith(
      jasmine.objectContaining({
        days: 30,
        threshold: 10,
        articleGroupId: null,
      }),
    );
    expect(component.summary.kpis.lowStockCount).toBe(4);
  });

  it('should render KPI card values', () => {
    const kpiValues = Array.from(
      fixture.nativeElement.querySelectorAll('.kpi-value'),
    ).map((node: any) => node.textContent.trim());
    expect(kpiValues).toContain('4');
    expect(kpiValues).toContain('3');
  });
});
