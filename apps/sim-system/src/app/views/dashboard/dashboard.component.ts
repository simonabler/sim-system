import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { toSignal, toObservable } from '@angular/core/rxjs-interop';
import { switchMap, catchError, of } from 'rxjs';
import { DashboardService } from '../../services/dashboard.service';
import { ArticleGroupService } from '../../services/article-group.service';
import { ArticleGroup } from '../../models/article.model';
import { ariaSort, nextSortState, sortIcon, sortItems, SortState } from '../../shared/table-sort';

type InventoryActivitySortKey = 'article' | 'date' | 'amountNew' | 'diff';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent {
  private router = inject(Router);
  private dashboardService = inject(DashboardService);
  private articleGroupService = inject(ArticleGroupService);

  // Filter-Signale
  readonly days = signal(30);
  readonly threshold = signal(10);
  readonly articleGroupId = signal<number | null>(null);
  readonly autoRefreshSeconds = signal(0);
  readonly error = signal('');
  readonly inventorySortState = signal<SortState<InventoryActivitySortKey>>({ key: null, direction: null });

  readonly articleGroups = toSignal(this.articleGroupService.getAll(), { initialValue: [] as ArticleGroup[] });

  // Refresh-Tick erzwingt neuen API-Call ohne Filter-Änderung
  private readonly _refreshTick = signal(0);

  // Reaktive Parameter → automatisch neu laden wenn Filter oder Tick sich ändern
  private readonly params = computed(() => ({
    days: this.days(),
    threshold: this.threshold(),
    articleGroupId: this.articleGroupId() ?? undefined,
    _tick: this._refreshTick(),          // nur für Reaktivität, wird nicht ans Backend geschickt
  }));

  readonly summary = toSignal(
    toObservable(this.params).pipe(
      switchMap(p =>
        this.dashboardService.getSummary(p).pipe(
          catchError(() => { this.error.set('Dashboard konnte nicht geladen werden.'); return of(null); })
        )
      )
    )
  );

  readonly loading = computed(() => this.summary() === undefined && !this.error());
  readonly sortedRecentInventoryActivities = computed(() =>
    sortItems(this.summary()?.recentInventoryActivities ?? [], this.inventorySortState(), {
      article: inv => inv.article?.name,
      date: inv => inv.createdAt,
      amountNew: inv => inv.amountNew,
      diff: inv => inv.diff,
    })
  );

  // Auto-Refresh via effect + onCleanup
  constructor() {
    effect((onCleanup) => {
      const secs = this.autoRefreshSeconds();
      if (secs <= 0) return;
      const handle = setInterval(() => this.triggerRefresh(), secs * 1000);
      onCleanup(() => clearInterval(handle));
    });
  }

  triggerRefresh() { this._refreshTick.update(n => n + 1); }
  refreshNow() { this.triggerRefresh(); }

  sortInventoryBy(key: InventoryActivitySortKey) {
    this.inventorySortState.update(state => nextSortState(state, key));
  }

  inventorySortIcon(key: InventoryActivitySortKey): string {
    return sortIcon(this.inventorySortState(), key);
  }

  inventoryAriaSort(key: InventoryActivitySortKey): 'none' | 'ascending' | 'descending' {
    return ariaSort(this.inventorySortState(), key);
  }

  // Trend-Ableitungen
  readonly trendPoints = computed(() => {
    const t = this.summary()?.stockTrend ?? [];
    return t.slice(Math.max(0, t.length - 14));
  });
  readonly maxOutgoing = computed(() =>
    Math.max(1, ...this.trendPoints().map(x => Number(x.outgoing || 0)))
  );
  readonly maxAdjustmentAbs = computed(() =>
    Math.max(1, ...this.trendPoints().map(x => Math.abs(Number(x.adjustmentDelta || 0))))
  );

  getOutgoingH(v: number) { return Math.max(2, Math.round((v / this.maxOutgoing()) * 72)); }
  getAdjustmentH(v: number) { return Math.max(2, Math.round((Math.abs(v) / this.maxAdjustmentAbs()) * 72)); }

  goToArticle(code?: string) {
    code ? this.router.navigate(['/articles'], { queryParams: { code } }) : this.router.navigate(['/articles']);
  }
  goToBills() { this.router.navigate(['/bills']); }
  goToSlipsheets() { this.router.navigate(['/slipsheets']); }
  goToInventory() { this.router.navigate(['/inventory']); }
  goToCustomer(id?: number) {
    id ? this.router.navigate([`/customers/${id}`]) : this.router.navigate(['/customers']);
  }
}
