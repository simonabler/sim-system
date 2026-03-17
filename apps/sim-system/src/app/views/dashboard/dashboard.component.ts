import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { DashboardService, DashboardSummary } from '../../services/dashboard.service';
import { ArticleGroupService } from '../../services/article-group.service';
import { ArticleGroup } from '../../models/article.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit, OnDestroy {
  loading = false;
  error = '';
  summary: DashboardSummary | null = null;
  articleGroups: ArticleGroup[] = [];
  days = 30;
  threshold = 10;
  articleGroupId: number | null = null;
  autoRefreshSeconds = 0;
  private refreshHandle: any = null;

  constructor(
    private router: Router,
    private dashboardService: DashboardService,
    private articleGroupService: ArticleGroupService,
  ) {}

  ngOnInit() {
    this.articleGroupService.getAll().subscribe(g => this.articleGroups = g || []);
    this.loadSummary();
  }

  ngOnDestroy() { this.stopAutoRefresh(); }

  loadSummary(showLoading = true) {
    if (showLoading) this.loading = true;
    this.error = '';
    this.dashboardService.getSummary({ days: this.days, threshold: this.threshold, articleGroupId: this.articleGroupId ?? undefined }).subscribe({
      next: data => { this.summary = data; this.loading = false; this.configureAutoRefresh(); },
      error: () => { this.loading = false; this.error = 'Dashboard konnte nicht geladen werden.'; }
    });
  }

  onApplyFilters() { this.loadSummary(); }
  refreshNow() { this.loadSummary(false); }

  goToArticle(code?: string) {
    code ? this.router.navigate(['/articles'], { queryParams: { code } }) : this.router.navigate(['/articles']);
  }
  goToBills() { this.router.navigate(['/bills']); }
  goToSlipsheets() { this.router.navigate(['/slipsheets']); }
  goToInventory() { this.router.navigate(['/inventory']); }
  goToCustomer(id?: number) {
    id ? this.router.navigate([`/customers/${id}`]) : this.router.navigate(['/customers']);
  }

  get trendPoints() {
    const t = this.summary?.stockTrend || [];
    return t.slice(Math.max(0, t.length - 14));
  }

  get maxOutgoing() { return Math.max(1, ...this.trendPoints.map(x => Number(x.outgoing || 0))); }
  get maxAdjustmentAbs() { return Math.max(1, ...this.trendPoints.map(x => Math.abs(Number(x.adjustmentDelta || 0)))); }

  getOutgoingH(v: number) { return Math.max(2, Math.round((v / this.maxOutgoing) * 72)); }
  getAdjustmentH(v: number) { return Math.max(2, Math.round((Math.abs(v) / this.maxAdjustmentAbs) * 72)); }

  private configureAutoRefresh() {
    this.stopAutoRefresh();
    if (this.autoRefreshSeconds > 0) {
      this.refreshHandle = setInterval(() => this.loadSummary(false), this.autoRefreshSeconds * 1000);
    }
  }
  private stopAutoRefresh() {
    if (this.refreshHandle) { clearInterval(this.refreshHandle); this.refreshHandle = null; }
  }
}
