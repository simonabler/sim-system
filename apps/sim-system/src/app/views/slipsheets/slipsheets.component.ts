import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { SlipsheetService } from '../../services/slipsheet.service';
import { Slipsheet } from '../../models/bill.model';
import { ariaSort, nextSortState, sortIcon, sortItems, SortState } from '../../shared/table-sort';

type SlipsheetSortKey = 'number' | 'customer' | 'date' | 'billing' | 'state' | 'positions';

@Component({
  selector: 'app-slipsheets',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './slipsheets.component.html',
  styleUrl: './slipsheets.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SlipsheetsComponent {
  private slipsheetService = inject(SlipsheetService);
  private router = inject(Router);

  readonly slipsheets = toSignal(this.slipsheetService.getAll(), { initialValue: [] as Slipsheet[] });
  readonly loading = computed(() => this.slipsheets() === undefined);

  readonly showOnlyOpen = signal(false);
  readonly sortState = signal<SortState<SlipsheetSortKey>>({ key: null, direction: null });

  readonly openCount = computed(() => this.slipsheets().filter(s => s.isOpen()).length);

  readonly filteredSlipsheets = computed(() => {
    const all = this.slipsheets();
    const filtered = this.showOnlyOpen() ? all.filter(s => s.isOpen()) : all;

    return sortItems(filtered, this.sortState(), {
      number: slip => slip.slipsheetnumber,
      customer: slip => this.customerName(slip),
      date: slip => slip.createdAt,
      billing: slip => slip.isOpen() ? 0 : 1,
      state: slip => slip.state,
      positions: slip => slip.orderEntries.length,
    });
  });

  sortBy(key: SlipsheetSortKey) {
    this.sortState.update(state => nextSortState(state, key));
  }

  sortIcon(key: SlipsheetSortKey): string {
    return sortIcon(this.sortState(), key);
  }

  ariaSort(key: SlipsheetSortKey): 'none' | 'ascending' | 'descending' {
    return ariaSort(this.sortState(), key);
  }

  toggleFilter() { this.showOnlyOpen.update(v => !v); }

  goTo(s: Slipsheet) {
    if (s.customer?.id) {
      const extras = s.isOpen() ? { queryParams: { preselect: s.id } } : {};
      this.router.navigate(['/customers', s.customer.id], extras);
    } else {
      this.router.navigate(['/slipsheets', s.id]);
    }
  }

  newOrder() { this.router.navigate(['/order/new']); }

  stateBadgeClass(state: string): string {
    if (state === 'open')    return 'sims-badge sims-badge-warning';
    if (state === 'changed') return 'sims-badge sims-badge-accent';
    if (state === 'closed' || state === 'payed') return 'sims-badge sims-badge-success';
    return 'sims-badge sims-badge-neutral';
  }

  billBadgeClass(s: Slipsheet): string {
    return s.isOpen()
      ? 'sims-badge slip-badge-open'
      : 'sims-badge slip-badge-billed';
  }

  customerName(s: Slipsheet): string {
    return s.customer?.companyName || s.customer?.lastName || '';
  }
}
