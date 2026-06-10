import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, map, of, switchMap } from 'rxjs';
import { Bill } from '../../models/bill.model';
import { BillService } from '../../services/bill.service';
import { ariaSort, nextSortState, sortIcon, sortItems, SortState } from '../../shared/table-sort';

type BillSlipSortKey = 'number' | 'date' | 'state';

@Component({
  selector: 'app-bill-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './bill-detail.component.html',
  styleUrl: './bill-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BillDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly billService = inject(BillService);
  private readonly destroyRef = inject(DestroyRef);

  readonly bill = signal<Bill | null>(null);
  readonly loading = signal(true);
  readonly error = signal('');
  readonly downloading = signal(false);
  readonly recreating = signal(false);
  readonly savingDate = signal(false);
  readonly deleting = signal(false);
  readonly editingDate = signal(false);
  readonly billDateDraft = signal('');
  readonly slipSortState = signal<SortState<BillSlipSortKey>>({ key: null, direction: null });

  readonly busy = computed(
    () =>
      this.downloading() ||
      this.recreating() ||
      this.savingDate() ||
      this.deleting(),
  );

  readonly hasDateChanges = computed(() => {
    const bill = this.bill();
    if (!bill) {
      return false;
    }

    return this.billDateDraft() !== this.toDateInputValue(bill.billDate);
  });
  readonly sortedSlipsheets = computed(() => {
    const slipsheets = this.bill()?.slipsheets ?? [];
    return sortItems(slipsheets, this.slipSortState(), {
      number: slip => slip.slipsheetnumber,
      date: slip => slip.createdAt,
      state: slip => slip.state,
    });
  });

  constructor() {
    this.route.paramMap
      .pipe(
        map((params) => +(params.get('id') || '0')),
        switchMap((id) => {
          if (!Number.isFinite(id) || id <= 0) {
            this.error.set('Rechnung nicht gefunden.');
            this.loading.set(false);
            return of(null);
          }

          this.loading.set(true);
          this.error.set('');

          return this.billService.getById(id).pipe(
            catchError(() => {
              this.error.set('Rechnung konnte nicht geladen werden.');
              return of(null);
            }),
          );
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((bill) => {
        this.setBill(bill);
        this.loading.set(false);
      });
  }

  downloadPdf() {
    const bill = this.bill();
    if (!bill) {
      return;
    }

    this.downloading.set(true);
    this.error.set('');

    this.billService.getPdf(bill.id).subscribe({
      next: (blob) => {
        this.downloading.set(false);
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `rechnung-${bill.getNumber()}.pdf`;
        link.click();
        URL.revokeObjectURL(url);
      },
      error: () => {
        this.downloading.set(false);
        this.error.set('PDF nicht gefunden. Bitte neu erzeugen.');
      },
    });
  }

  recreatePdf() {
    const bill = this.bill();
    if (!bill) {
      return;
    }

    this.recreating.set(true);
    this.error.set('');

    this.billService.recreate(bill).subscribe({
      next: (updatedBill) => {
        this.setBill(updatedBill);
        this.recreating.set(false);
        this.downloadPdf();
      },
      error: () => {
        this.recreating.set(false);
        this.error.set('PDF konnte nicht neu erzeugt werden.');
      },
    });
  }

  saveBillDate() {
    const bill = this.bill();
    const billDate = this.billDateDraft();
    if (!bill || !billDate || !this.hasDateChanges()) {
      return;
    }

    this.savingDate.set(true);
    this.error.set('');

    this.billService
      .update({
        id: bill.id,
        billNumber: bill.billNumber,
        billDate,
      })
      .subscribe({
        next: (updatedBill) => {
          this.setBill(updatedBill);
          this.editingDate.set(false);
          this.savingDate.set(false);
        },
        error: () => {
          this.savingDate.set(false);
          this.error.set('Rechnungsdatum konnte nicht gespeichert werden.');
        },
      });
  }

  releaseBill() {
    const bill = this.bill();
    if (!bill) {
      return;
    }

    const confirmed = window.confirm(
      'Rechnung wirklich zurückholen? Die Rechnung wird gelöscht und alle Lieferscheine werden wieder freigegeben.',
    );
    if (!confirmed) {
      return;
    }

    this.deleting.set(true);
    this.error.set('');

    this.billService.delete(bill.id).subscribe({
      next: () => {
        this.deleting.set(false);
        this.router.navigate(['/bills']);
      },
      error: () => {
        this.deleting.set(false);
        this.error.set('Rechnung konnte nicht zurückgeholt werden.');
      },
    });
  }

  back() {
    this.router.navigate(['/bills']);
  }

  sortSlipsBy(key: BillSlipSortKey) {
    this.slipSortState.update(state => nextSortState(state, key));
  }

  slipSortIcon(key: BillSlipSortKey): string {
    return sortIcon(this.slipSortState(), key);
  }

  slipAriaSort(key: BillSlipSortKey): 'none' | 'ascending' | 'descending' {
    return ariaSort(this.slipSortState(), key);
  }

  startEditBillDate() {
    const bill = this.bill();
    if (!bill) {
      return;
    }

    this.billDateDraft.set(this.toDateInputValue(bill.billDate));
    this.editingDate.set(true);
  }

  cancelEditBillDate() {
    const bill = this.bill();
    this.billDateDraft.set(this.toDateInputValue(bill?.billDate));
    this.editingDate.set(false);
  }

  badgeClass(state: string): string {
    if (state === 'open') {
      return 'sims-badge sims-badge-warning';
    }
    if (state === 'closed' || state === 'payed') {
      return 'sims-badge sims-badge-success';
    }
    return 'sims-badge sims-badge-neutral';
  }

  badgeLabel(state: string): string {
    if (state === 'open') {
      return 'offen';
    }
    if (state === 'closed') {
      return 'abgeschlossen';
    }
    if (state === 'payed') {
      return 'bezahlt';
    }
    return state;
  }

  private setBill(bill: Bill | null) {
    this.bill.set(bill);
    this.billDateDraft.set(this.toDateInputValue(bill?.billDate));
  }

  private toDateInputValue(value?: string | Date | null): string {
    if (!value) {
      return '';
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return '';
    }

    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
