import {
  ChangeDetectionStrategy, Component, computed, effect,
  ElementRef, inject, signal, ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { debounceTime, switchMap, catchError, of, filter, startWith } from 'rxjs';
import { CustomerService } from '../../services/customer.service';
import { ArticleService } from '../../services/article.service';
import { SlipsheetService } from '../../services/slipsheet.service';
import { Customer } from '../../models/customer.model';
import { Article } from '../../models/article.model';
import { Slipsheet, Order } from '../../models/bill.model';

@Component({
  selector: 'app-order-new',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './order-new.component.html',
  styleUrl: './order-new.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderNewComponent {
  @ViewChild('codeInput') codeInputRef!: ElementRef<HTMLInputElement>;

  private router = inject(Router);
  private customerService = inject(CustomerService);
  private articleService = inject(ArticleService);
  private slipsheetService = inject(SlipsheetService);

  // ── Suche / Scan ──────────────────────────────────────────────────
  readonly codeCtrl = new FormControl('');
  readonly customerSearchCtrl = new FormControl('');

  readonly pendingAmount = signal(1);
  readonly submitting = signal(false);
  readonly error = signal('');

  // ── Modi ──────────────────────────────────────────────────────────
  readonly showAnnotationInput = signal(false);
  readonly annotationText = signal('');
  readonly editingOrder = signal<Order | null>(null);   // inline-edit aktiv
  readonly editAmount = signal(1);                      // Menge im Inline-Edit
  readonly showTextInput = signal(false);
  readonly textPositionText = signal('');
  readonly textPositionPrice = signal(0);

  // ── Kunden ────────────────────────────────────────────────────────
  readonly allCustomers = toSignal(this.customerService.getAll(), { initialValue: [] as Customer[] });
  private readonly customerSearch = toSignal(
    this.customerSearchCtrl.valueChanges.pipe(debounceTime(150), startWith('')),
    { initialValue: '' }
  );
  readonly filteredCustomers = computed(() => {
    const q = (this.customerSearch() ?? '').toLowerCase();
    if (!q) return this.allCustomers();
    return this.allCustomers().filter(c =>
      c.companyName?.toLowerCase().startsWith(q) ||
      c.firstName?.toLowerCase().startsWith(q) ||
      c.lastName?.toLowerCase().startsWith(q)
    );
  });

  // Zuletzt gewählter Kunde aus Service vorbelegen
  readonly selectedCustomer = signal<Customer | null>(
    this.customerService.currentCustomer ?? null
  );

  constructor() {
    // Offenen Lieferschein für vorausgewählten Kunden nachladen
    const preselected = this.selectedCustomer();
    if (preselected) {
      this.loadOpenSlipsheet(preselected.id);
    }
  }

  // ── Artikel per Barcode ───────────────────────────────────────────
  readonly pendingArticle = toSignal(
    this.codeCtrl.valueChanges.pipe(
      debounceTime(300),
      filter(v => !!v && v.length > 1),
      switchMap(code =>
        this.articleService.getByCode(code!).pipe(catchError(() => of(null)))
      )
    ),
    { initialValue: null as Article | null }
  );

  // ── Aktueller Lieferschein (Server als Source of Truth) ───────────
  readonly slipsheet = signal<Slipsheet | null>(null);

  readonly total = computed(() =>
    (this.slipsheet()?.orderEntries ?? []).reduce((s, o) => s + o.getPrice(), 0)
  );

  // ── Kunden-Auswahl ────────────────────────────────────────────────
  private loadOpenSlipsheet(customerId: number) {
    // GET /slipsheets?customerId=X — liefert nur bestehende offene LS, legt keinen an
    this.slipsheetService.getByCustomer(customerId).subscribe({
      next: slips => this.slipsheet.set(slips[0] ?? null)
    });
  }

  selectCustomer(c: Customer) {
    this.selectedCustomer.set(c);
    this.customerService.selectCustomer(c);
    this.customerSearchCtrl.setValue('', { emitEvent: false });
    this.loadOpenSlipsheet(c.id);
    // Fokus zurück auf Barcode
    setTimeout(() => this.codeInputRef?.nativeElement?.focus(), 50);
  }

  clearCustomer() {
    this.selectedCustomer.set(null);
    this.slipsheet.set(null);
  }

  // ── Artikel hinzufügen ────────────────────────────────────────────
  addPending() {
    const article = this.pendingArticle();
    const customer = this.selectedCustomer();
    if (!article || !customer) return;

    this.submitting.set(true);
    this.error.set('');

    const existing = this.slipsheet();

    const op$ = existing
      ? this.slipsheetService.addOrder(existing, new Order({ article, amount: this.pendingAmount(), price: article.price }))
      : this.slipsheetService.getOrCreate({ article, amount: this.pendingAmount(), customer });

    op$.subscribe({
      next: slip => {
        this.slipsheet.set(slip);
        this.submitting.set(false);
        this.pendingAmount.set(1);
        this.codeCtrl.setValue('', { emitEvent: false });
        setTimeout(() => this.codeInputRef?.nativeElement?.focus(), 50);
      },
      error: err => {
        this.error.set(err.message || 'Fehler beim Hinzufügen');
        this.submitting.set(false);
      }
    });
  }

  stepPending(delta: number) { this.pendingAmount.update(v => Math.max(1, v + delta)); }

  // ── Textposition ──────────────────────────────────────────────────
  addTextPosition() {
    const text = this.textPositionText().trim();
    const slip = this.slipsheet();
    const customer = this.selectedCustomer();
    if (!text || !customer) return;

    this.submitting.set(true);
    const order = new Order({ text, amount: 1, price: this.textPositionPrice() });

    const op$ = slip
      ? this.slipsheetService.addOrder(slip, order)
      : this.slipsheetService.getOrCreate({ article: null, amount: 1, customer } as any);

    op$.subscribe({
      next: updated => {
        this.slipsheet.set(updated);
        this.submitting.set(false);
        this.showTextInput.set(false);
        this.textPositionText.set('');
        this.textPositionPrice.set(0);
      },
      error: err => { this.error.set(err.message || 'Fehler'); this.submitting.set(false); }
    });
  }

  // ── Positionen bearbeiten ─────────────────────────────────────────
  startEdit(order: Order) {
    this.editingOrder.set(order);
    this.editAmount.set(order.amount);
  }

  cancelEdit() { this.editingOrder.set(null); }

  stepEdit(delta: number) { this.editAmount.update(v => Math.max(1, v + delta)); }

  saveEdit() {
    const slip = this.slipsheet();
    const order = this.editingOrder();
    if (!slip || !order) return;
    this.submitting.set(true);
    const updated = new Order({ ...order, amount: this.editAmount() });
    this.slipsheetService.updateOrder(slip, updated).subscribe({
      next: newSlip => {
        this.slipsheet.set(newSlip);
        this.submitting.set(false);
        this.editingOrder.set(null);
      },
      error: err => { this.error.set(err.message || 'Fehler'); this.submitting.set(false); }
    });
  }

  deleteOrder(order: Order) {
    const slip = this.slipsheet();
    if (!slip) return;
    const zeroed = new Order({ ...order, amount: 0 });
    this.slipsheetService.updateOrder(slip, zeroed).subscribe({
      next: newSlip => this.slipsheet.set(newSlip),
      error: err => this.error.set(err.message || 'Fehler beim Löschen')
    });
  }

  // ── Annotation ────────────────────────────────────────────────────
  submitAnnotation() {
    const slip = this.slipsheet();
    const text = this.annotationText().trim();
    if (!slip || !text) return;
    this.slipsheetService.addAnnotation(slip, text).subscribe({
      next: updated => {
        this.slipsheet.set(updated);
        this.annotationText.set('');
        this.showAnnotationInput.set(false);
      },
      error: err => this.error.set(err.message || 'Fehler')
    });
  }

  // ── PDF/Drucken ───────────────────────────────────────────────────
  downloadPdf() {
    const slip = this.slipsheet();
    if (!slip) return;
    this.slipsheetService.getPdf(slip.id).subscribe(blob => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `lieferschein-${slip.slipsheetnumber || slip.id}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    });
  }

  back() { this.router.navigate(['/slipsheets']); }
}
