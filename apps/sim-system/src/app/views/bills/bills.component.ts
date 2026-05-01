import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { BillService } from '../../services/bill.service';
import { Bill } from '../../models/bill.model';
import { ariaSort, nextSortState, sortIcon, sortItems, SortState } from '../../shared/table-sort';

type BillSortKey = 'number' | 'date' | 'customer' | 'slipsheets' | 'state';

@Component({
  selector: 'app-bills',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './bills.component.html',
  styleUrl: './bills.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BillsComponent {
  private billService = inject(BillService);
  private router = inject(Router);

  readonly bills = toSignal(this.billService.getAll(), { initialValue: [] as Bill[] });
  readonly sortState = signal<SortState<BillSortKey>>({ key: null, direction: null });
  readonly loading = computed(() => this.bills() === undefined);
  readonly sortedBills = computed(() =>
    sortItems(this.bills(), this.sortState(), {
      number: bill => bill.getNumber(),
      date: bill => bill.billDate,
      customer: bill => this.customerName(bill),
      slipsheets: bill => bill.slipsheets.length,
      state: bill => bill.state,
    })
  );

  goTo(id: number) { this.router.navigate(['/bills', id]); }

  sortBy(key: BillSortKey) {
    this.sortState.update(state => nextSortState(state, key));
  }

  sortIcon(key: BillSortKey): string {
    return sortIcon(this.sortState(), key);
  }

  ariaSort(key: BillSortKey): 'none' | 'ascending' | 'descending' {
    return ariaSort(this.sortState(), key);
  }

  badgeClass(state: string): string {
    if (state === 'open')   return 'sims-badge sims-badge-warning';
    if (state === 'closed') return 'sims-badge sims-badge-success';
    if (state === 'payed')  return 'sims-badge sims-badge-success';
    return 'sims-badge sims-badge-neutral';
  }

  badgeLabel(state: string): string {
    if (state === 'open')   return 'offen';
    if (state === 'closed') return 'erstellt';
    if (state === 'payed')  return 'bezahlt';
    return state;
  }

  customerName(bill: Bill): string {
    return bill.customer?.companyName || bill.customer?.lastName || '';
  }
}
