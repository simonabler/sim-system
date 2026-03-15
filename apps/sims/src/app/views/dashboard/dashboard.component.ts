import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ArticleGroup } from '../../models';
import { ArticleGroupService } from '../../services/article-group.service';
import {
  DashboardService,
  DashboardSummary,
} from '../../services/dashboard.service';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: 'dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit, OnDestroy {
  loading = false;
  errorMessage = '';
  summary: DashboardSummary;
  articleGroups: ArticleGroup[] = [];

  days = 30;
  threshold = 10;
  articleGroupId: number = null;
  autoRefreshSeconds = 0;

  maxOutgoing = 1;
  maxAdjustmentAbs = 1;
  trendBarMaxHeightPx = 72;
  private refreshHandle: any = null;

  constructor(
    private readonly router: Router,
    private readonly dashboardService: DashboardService,
    private readonly articleGroupService: ArticleGroupService,
  ) {}

  ngOnInit(): void {
    this.articleGroupService.getAll().subscribe((groups: ArticleGroup[]) => {
      this.articleGroups = groups || [];
    });
    this.loadSummary();
  }

  ngOnDestroy(): void {
    this.stopAutoRefresh();
  }

  get trendPoints() {
    const trend = this.summary?.stockTrend || [];
    return trend.slice(Math.max(0, trend.length - 14));
  }

  onApplyFilters() {
    this.loadSummary();
  }

  onAutoRefreshChange() {
    this.configureAutoRefresh();
  }

  refreshNow() {
    this.loadSummary(false);
  }

  goToInventory() {
    this.router.navigate(['/dashboard/inventory']);
  }

  goToArticle(code?: string) {
    if (code) {
      this.router.navigate(['/article'], { queryParams: { code } });
      return;
    }
    this.router.navigate(['/article']);
  }

  goToBills() {
    this.router.navigate(['/admin/bills']);
  }

  goToCustomer(customerId?: number) {
    if (customerId) {
      this.router.navigate([`/admin/customer/detail/${customerId}`]);
      return;
    }
    this.router.navigate(['/admin/customer']);
  }

  get hasTrendActivity(): boolean {
    return (this.trendPoints || []).some(
      (point: any) =>
        Number(point?.outgoing || 0) !== 0 ||
        Number(point?.adjustmentDelta || 0) !== 0,
    );
  }

  getOutgoingHeightPx(value: number): number {
    if (!value || this.maxOutgoing <= 0) {
      return 0;
    }
    return Math.max(
      2,
      Math.round((Number(value) / this.maxOutgoing) * this.trendBarMaxHeightPx),
    );
  }

  getAdjustmentHeightPx(value: number): number {
    const abs = Math.abs(Number(value || 0));
    if (!abs || this.maxAdjustmentAbs <= 0) {
      return 0;
    }
    return Math.max(
      2,
      Math.round((abs / this.maxAdjustmentAbs) * this.trendBarMaxHeightPx),
    );
  }

  private loadSummary(showLoading = true) {
    if (showLoading) {
      this.loading = true;
    }
    this.errorMessage = '';

    this.dashboardService
      .getSummary({
        days: this.days,
        threshold: this.threshold,
        articleGroupId: this.articleGroupId,
      })
      .subscribe(
        (data: DashboardSummary) => {
          this.summary = data;
          this.recalculateTrendScale();
          this.loading = false;
          this.configureAutoRefresh();
        },
        () => {
          this.loading = false;
          this.errorMessage = 'Dashboard konnte nicht geladen werden.';
        },
      );
  }

  private recalculateTrendScale() {
    const trend = this.trendPoints || [];
    this.maxOutgoing = Math.max(1, ...trend.map((x) => Number(x.outgoing || 0)));
    this.maxAdjustmentAbs = Math.max(
      1,
      ...trend.map((x) => Math.abs(Number(x.adjustmentDelta || 0))),
    );
  }

  private configureAutoRefresh() {
    this.stopAutoRefresh();
    if (!this.autoRefreshSeconds || this.autoRefreshSeconds <= 0) {
      return;
    }
    this.refreshHandle = setInterval(() => {
      this.loadSummary(false);
    }, this.autoRefreshSeconds * 1000);
  }

  private stopAutoRefresh() {
    if (this.refreshHandle) {
      clearInterval(this.refreshHandle);
      this.refreshHandle = null;
    }
  }
}
