import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { SlipsheetEditorComponent } from '../../components/slipsheet-editor/slipsheet-editor.component';
import { toSignal, toObservable, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  switchMap, map, catchError, of, filter,
  Subject, combineLatest, startWith, debounceTime,
} from 'rxjs';
import { CustomerService } from '../../services/customer.service';
import { BillService } from '../../services/bill.service';
import { SlipsheetService } from '../../services/slipsheet.service';
import { Customer } from '../../models/customer.model';
import { Slipsheet, Bill } from '../../models/bill.model';
import { ariaSort, nextSortState, sortIcon, sortItems, SortState } from '../../shared/table-sort';

type CustomerSlipSortKey = 'number' | 'date' | 'amount' | 'status';
type CustomerBillSortKey = 'number' | 'slipsheets' | 'state' | 'total';

@Component({
  selector: 'app-customer-detail',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, SlipsheetEditorComponent],
  templateUrl: './customer-detail.component.html',
  styleUrl: './customer-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomerDetailComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private customerService = inject(CustomerService);
  private billService = inject(BillService);
  private slipsheetService = inject(SlipsheetService);
  private destroyRef = inject(DestroyRef);

  // ── Customer ─────────────────────────────────────────────────
  readonly loadError = signal('');

  readonly customer = toSignal(
    this.route.paramMap.pipe(
      map(p => p.get('id')),
      filter((id): id is string => id !== null),
      switchMap(id =>
        this.customerService.getById(+id).pipe(
          catchError(() => { this.loadError.set('Kunde konnte nicht geladen werden.'); return of(null); })
        )
      )
    )
  );

  readonly loading = computed(() => this.customer() === undefined && !this.loadError());

  // ── Slipsheets + Bills (refreshable) ─────────────────────────
  readonly slipsheets = signal<Slipsheet[]>([]);
  readonly bills = signal<Bill[]>([]);
  private readonly refresh$ = new Subject<void>();

  // ── UI State ─────────────────────────────────────────────────
  readonly activeSlipId    = signal<number | null>(null);
  readonly editingSlipId   = signal<number | null>(null);
  readonly selectedSlipIds = signal<Set<number>>(new Set());
  readonly showOnlyOpen    = signal(true);
  readonly queryCtrl = new FormControl('');
  readonly generatingBill = signal(false);
  readonly toast = signal<{ type: 'success' | 'error'; msg: string } | null>(null);
  readonly slipSortState = signal<SortState<CustomerSlipSortKey>>({ key: null, direction: null });
  readonly billSortState = signal<SortState<CustomerBillSortKey>>({ key: null, direction: null });

  private readonly preselectId = toSignal(
    this.route.queryParamMap.pipe(map(p => p.get('preselect'))),
    { initialValue: null }
  );
  private preselectApplied = false;

  private readonly query = toSignal(
    this.queryCtrl.valueChanges.pipe(debounceTime(150), startWith('')),
    { initialValue: '' }
  );

  // ── Computed ─────────────────────────────────────────────────
  readonly openSlips = computed(() => this.slipsheets().filter(s => s.isOpen()));
  readonly openCount = computed(() => this.openSlips().length);
  readonly openTotal = computed(() => this.openSlips().reduce((s, x) => s + x.getPrice(), 0));
  readonly billedCount = computed(() => this.slipsheets().filter(s => !s.isOpen()).length);

  readonly filteredSlips = computed(() => {
    const q = (this.query() ?? '').toLowerCase();
    const filtered = this.slipsheets()
      .filter(s => this.showOnlyOpen() ? s.isOpen() : true)
      .filter(s => !q || (s.slipsheetnumber ?? '').toLowerCase().includes(q));

    return sortItems(filtered, this.slipSortState(), {
      number: slip => slip.slipsheetnumber,
      date: slip => slip.createdAt,
      amount: slip => slip.getPrice(),
      status: slip => this.slipBillLabel(slip),
    });
  });

  readonly sortedBills = computed(() =>
    sortItems(this.bills(), this.billSortState(), {
      number: bill => bill.getNumber(),
      slipsheets: bill => bill.slipsheets.map(s => s.slipsheetnumber).join(', '),
      state: bill => bill.state,
      total: bill => bill.getTotal(),
    })
  );

  readonly activeSlip = computed(() => {
    const id = this.activeSlipId();
    return id ? (this.slipsheets().find(s => s.id === id) ?? null) : null;
  });

  readonly selectedSlips = computed(() =>
    this.slipsheets().filter(s => this.selectedSlipIds().has(s.id) && this.isBillableSlip(s))
  );
  readonly selectedTotal = computed(() =>
    this.selectedSlips().reduce((s, x) => s + x.getPrice(), 0)
  );
  readonly selectedCount = computed(() => this.selectedSlipIds().size);
  readonly canGenerate = computed(() => this.selectedCount() > 0 && !this.generatingBill());

  constructor() {
    // Slipsheets laden
    combineLatest([
      this.refresh$.pipe(startWith(null as null)),
      toObservable(this.customer),
    ]).pipe(
      map(([, c]) => c),
      filter((c): c is Customer => c != null),
      switchMap(c =>
        this.customerService.getSlipsheets(c).pipe(catchError(() => of([] as Slipsheet[])))
      ),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(ss => {
      this.slipsheets.set(ss);
      this.syncSelectedSlipIds(ss);

      // Preselect-Logik: einmalig nach erstem Laden
      if (!this.preselectApplied) {
        const preId = this.preselectId();
        if (preId) {
          this.preselectApplied = true;
          const found = ss.find(s => s.id === +preId && s.isOpen());
          if (found) {
            this.activeSlipId.set(found.id);
            if (this.isBillableSlip(found)) {
              this.selectedSlipIds.set(new Set([found.id]));
            }
            return;
          }
        }
      }

      // Default: ersten offenen Lieferschein als aktiv setzen (wenn noch keiner gesetzt)
      if (!this.activeSlipId()) {
        const first = ss.find(s => s.isOpen()) ?? ss[0];
        if (first) this.activeSlipId.set(first.id);
      }
    });

    // Bills laden
    combineLatest([
      this.refresh$.pipe(startWith(null as null)),
      toObservable(this.customer),
    ]).pipe(
      map(([, c]) => c),
      filter((c): c is Customer => c != null),
      switchMap(c =>
        this.customerService.getBills(c).pipe(catchError(() => of([] as Bill[])))
      ),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(bs => this.bills.set(bs));
  }

  // ── Actions ──────────────────────────────────────────────────
  /** Klick auf Zeile: zeigt Dokument + togglet Selection für offene Lieferscheine */
  setActive(slip: Slipsheet) {
    this.activeSlipId.set(slip.id);
    if (!this.isBillableSlip(slip)) return;
    const next = new Set(this.selectedSlipIds());
    if (next.has(slip.id)) next.delete(slip.id);
    else next.add(slip.id);
    this.selectedSlipIds.set(next);
  }

  isSelected(id: number): boolean {
    return this.selectedSlipIds().has(id);
  }

  makeBill() {
    const ids = [...this.selectedSlipIds()];
    if (!ids.length) return;
    this.generatingBill.set(true);
    this.billService.generate(ids).subscribe({
      next: bill => {
        this.showToast('success', `${bill.getNumber()} wurde erfolgreich erstellt.`);
        this.selectedSlipIds.set(new Set());
        this.generatingBill.set(false);
        this.preselectApplied = true;
        this.refresh$.next();
      },
      error: (err: { message?: string }) => {
        this.showToast('error', err?.message || 'Fehler beim Erstellen der Rechnung.');
        this.generatingBill.set(false);
      },
    });
  }

  editCustomer() {
    const c = this.customer();
    if (c) this.router.navigate(['/customers', c.id, 'edit']);
  }

  toggleOpenFilter() { this.showOnlyOpen.update(v => !v); }

  sortSlipsBy(key: CustomerSlipSortKey) {
    this.slipSortState.update(state => nextSortState(state, key));
  }

  slipSortIcon(key: CustomerSlipSortKey): string {
    return sortIcon(this.slipSortState(), key);
  }

  slipAriaSort(key: CustomerSlipSortKey): 'none' | 'ascending' | 'descending' {
    return ariaSort(this.slipSortState(), key);
  }

  sortBillsBy(key: CustomerBillSortKey) {
    this.billSortState.update(state => nextSortState(state, key));
  }

  billSortIcon(key: CustomerBillSortKey): string {
    return sortIcon(this.billSortState(), key);
  }

  billAriaSort(key: CustomerBillSortKey): 'none' | 'ascending' | 'descending' {
    return ariaSort(this.billSortState(), key);
  }

  back() { this.router.navigate(['/customers']); }

  editSlip(id: number) { this.editingSlipId.set(id); }

  closeEditor() { this.editingSlipId.set(null); }

  onSlipDeleted() {
    this.activeSlipId.set(null);
    this.editingSlipId.set(null);
    this.selectedSlipIds.set(new Set());
    this.preselectApplied = true;
    this.refresh$.next();
    this.showToast('success', 'Lieferschein wurde gelöscht.');
  }

  onSlipUpdated(updated: Slipsheet) {
    // Update local slipsheets array so changes are immediately visible
    this.slipsheets.update(list => list.map(s => s.id === updated.id ? updated : s));
    // Remove the slip from the selection if it is no longer billable.
    if (!this.isBillableSlip(updated)) {
      const next = new Set(this.selectedSlipIds());
      next.delete(updated.id);
      this.selectedSlipIds.set(next);
    }
  }

  readonly pdfLoadingId     = signal<number | null>(null);
  readonly billPdfLoadingId = signal<number | null>(null);

  openSlipPdf(slip: Slipsheet, event: Event) {
    event.stopPropagation();
    if (this.pdfLoadingId() === slip.id) return;
    this.pdfLoadingId.set(slip.id);
    this.slipsheetService.getPdf(slip.id).subscribe({
      next: blob => {
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
        setTimeout(() => URL.revokeObjectURL(url), 10000);
        this.slipsheetService.getById(slip.id).subscribe({
          next: updated => {
            this.onSlipUpdated(updated);
            this.pdfLoadingId.set(null);
          },
          error: () => {
            this.pdfLoadingId.set(null);
            this.showToast('error', 'Lieferschein konnte nach PDF-Erzeugung nicht aktualisiert werden.');
          },
        });
      },
      error: () => {
        this.pdfLoadingId.set(null);
        this.showToast('error', 'PDF konnte nicht geladen werden.');
      },
    });
  }

  openBillPdf(bill: Bill, event: Event) {
    event.stopPropagation();
    if (this.billPdfLoadingId() === bill.id) return;
    this.billPdfLoadingId.set(bill.id);
    this.billService.getPdf(bill.id).subscribe({
      next: blob => {
        this.billPdfLoadingId.set(null);
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
        setTimeout(() => URL.revokeObjectURL(url), 10000);
      },
      error: () => {
        this.billPdfLoadingId.set(null);
        this.showToast('error', 'Rechnung PDF konnte nicht geladen werden.');
      },
    });
  }

  navigateToBill(b: Bill) {
    this.router.navigate(['/bills', b.id]);
  }

  billStateLabel(state: string): string {
    switch (state) {
      case 'open':   return 'Offen';
      case 'closed': return 'Abgeschlossen';
      case 'payed':  return 'Bezahlt';
      default:       return state;
    }
  }

  private showToast(type: 'success' | 'error', msg: string) {
    this.toast.set({ type, msg });
    setTimeout(() => this.toast.set(null), 5000);
  }

  // ── Badge helpers ─────────────────────────────────────────────
  isBillableSlip(s: Slipsheet): boolean {
    return s.state === 'closed' && !s.hasBill();
  }

  slipNeedsGeneration(s: Slipsheet): boolean {
    return !s.hasBill() && s.state !== 'closed';
  }

  slipBillLabel(s: Slipsheet): string {
    if (s.isCompleted()) return 'Verrechnet';
    if (this.isBillableSlip(s)) return 'Bereit';
    if (s.hasBill()) return 'Bearbeitet';
    return 'Noch nicht erzeugt';
  }

  slipBillBadge(s: Slipsheet): string {
    if (s.isCompleted()) return 'sims-badge sims-badge-ok';
    if (this.isBillableSlip(s)) return 'sims-badge sims-badge-accent';
    if (s.hasBill()) return 'sims-badge sims-badge-warning';
    return 'sims-badge sims-badge-low';
  }

  billStateBadge(state: string): string {
    if (state === 'open') return 'sims-badge sims-badge-low';
    if (state === 'closed' || state === 'payed') return 'sims-badge sims-badge-ok';
    return 'sims-badge sims-badge-neutral';
  }

  // ── Formatter ────────────────────────────────────────────────
  fmt(value: number): string {
    return new Intl.NumberFormat('de-AT', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
  }

  private syncSelectedSlipIds(slips: Slipsheet[]) {
    const billableIds = new Set(slips.filter(s => this.isBillableSlip(s)).map(s => s.id));
    const next = new Set([...this.selectedSlipIds()].filter(id => billableIds.has(id)));
    if (next.size !== this.selectedSlipIds().size) {
      this.selectedSlipIds.set(next);
    }
  }
}
