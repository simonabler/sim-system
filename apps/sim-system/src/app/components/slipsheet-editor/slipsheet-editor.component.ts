import {
  ChangeDetectionStrategy, Component, ElementRef, HostListener, ViewChild,
  inject, signal, computed, input, output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { debounceTime, switchMap, catchError, of, filter } from 'rxjs';
import { ArticleService } from '../../services/article.service';
import { SlipsheetService } from '../../services/slipsheet.service';
import { Article } from '../../models/article.model';
import { Customer } from '../../models/customer.model';
import { Slipsheet, Order } from '../../models/bill.model';

@Component({
  selector: 'app-slipsheet-editor',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './slipsheet-editor.component.html',
  styleUrl: './slipsheet-editor.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SlipsheetEditorComponent {
  @ViewChild('codeInput') codeInputRef!: ElementRef<HTMLInputElement>;

  private articleService = inject(ArticleService);
  private slipsheetService = inject(SlipsheetService);

  // ── Inputs ────────────────────────────────────────────────────
  readonly slipsheet = input.required<Slipsheet | null>();
  readonly customer  = input.required<Customer | null>();

  // ── Output ────────────────────────────────────────────────────
  /** Emitted after every successful mutation with the updated Slipsheet */
  readonly updated = output<Slipsheet>();
  /** Emitted when the slipsheet was deleted */
  readonly deleted = output<void>();

  // ── UI State ──────────────────────────────────────────────────
  readonly codeCtrl           = new FormControl('');
  readonly pendingAmount      = signal(1);
  readonly submitting         = signal(false);
  readonly error              = signal('');
  readonly editingOrder       = signal<Order | null>(null);
  readonly editAmount         = signal(1);
  readonly showTextInput        = signal(false);
  readonly textPositionText     = signal('');
  readonly textPositionAmount   = signal(1);
  readonly textPositionPrice    = signal(0);
  readonly showAnnotationInput = signal(false);
  readonly deleting            = signal(false);
  readonly printing            = signal(false);
  readonly annotationText     = signal('');

  // ── Computed ──────────────────────────────────────────────────
  /** True when the slipsheet is already linked to a bill */
  readonly isBilled = computed(() => {
    const s = this.slipsheet();
    return s != null && !s.isOpen();
  });

  /** True: offener LS ohne Positionen → Löschen erlaubt */
  readonly canDelete = computed(() => {
    const s = this.slipsheet();
    return s != null && s.isOpen() && (s.orderEntries?.length ?? 0) === 0;
  });

  readonly total = computed(() =>
    (this.slipsheet()?.orderEntries ?? []).reduce((s, o) => s + o.getPrice(), 0)
  );

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

  // ── Artikel hinzufügen ────────────────────────────────────────
  @HostListener('document:onbarcodescaned', ['$event'])
  onBarcodeReaderInput(event: Event) {
    this.codeCtrl.setValue((event as CustomEvent<string>).detail, { emitEvent: true });
    setTimeout(() => this.codeInputRef?.nativeElement?.focus(), 50);
  }

  addPending() {
    const article  = this.pendingArticle();
    const customer = this.customer();
    const slip     = this.slipsheet();
    if (!article || !customer) return;

    this.submitting.set(true);
    this.error.set('');

    const op$ = slip
      ? this.slipsheetService.addOrder(slip, new Order({ article, amount: this.pendingAmount(), price: article.price }))
      : this.slipsheetService.getOrCreate({ article, amount: this.pendingAmount(), customer });

    op$.subscribe({
      next: updated => {
        this.updated.emit(updated);
        this.submitting.set(false);
        this.pendingAmount.set(1);
        this.codeCtrl.setValue('', { emitEvent: false });
        setTimeout(() => this.codeInputRef?.nativeElement?.focus(), 50);
      },
      error: (err: { message?: string }) => {
        this.error.set(err?.message || 'Fehler beim Hinzufügen');
        this.submitting.set(false);
      },
    });
  }


  // ── Textposition ──────────────────────────────────────────────
  addTextPosition() {
    const text     = this.textPositionText().trim();
    const slip     = this.slipsheet();
    const customer = this.customer();
    if (!text || !customer) return;

    this.submitting.set(true);
    const order = new Order({ text, amount: this.textPositionAmount(), price: this.textPositionPrice() });

    const op$ = slip
      ? this.slipsheetService.addOrder(slip, order)
      : this.slipsheetService.getOrCreateWithText(order, customer);

    op$.subscribe({
      next: updated => {
        this.updated.emit(updated);
        this.submitting.set(false);
        this.closeTextInput();
      },
      error: (err: { message?: string }) => { this.error.set(err?.message || 'Fehler'); this.submitting.set(false); },
    });
  }

  closeTextInput() {
    this.showTextInput.set(false);
    this.textPositionText.set('');
    this.textPositionAmount.set(1);
    this.textPositionPrice.set(0);
  }


  // ── Positionen bearbeiten ─────────────────────────────────────
  startEdit(order: Order) {
    this.editingOrder.set(order);
    this.editAmount.set(order.amount);
  }

  cancelEdit() { this.editingOrder.set(null); }

  saveEdit() {
    const slip  = this.slipsheet();
    const order = this.editingOrder();
    if (!slip || !order) return;
    this.submitting.set(true);
    this.slipsheetService.updateOrder(slip, new Order({ ...order, amount: this.editAmount() })).subscribe({
      next: updated => {
        this.updated.emit(updated);
        this.submitting.set(false);
        this.editingOrder.set(null);
      },
      error: (err: { message?: string }) => { this.error.set(err?.message || 'Fehler'); this.submitting.set(false); },
    });
  }

  deleteOrder(order: Order) {
    const slip = this.slipsheet();
    if (!slip) return;
    this.slipsheetService.updateOrder(slip, new Order({ ...order, amount: 0 })).subscribe({
      next: updated => this.updated.emit(updated),
      error: (err: { message?: string }) => this.error.set(err?.message || 'Fehler beim Löschen'),
    });
  }

  // ── Annotation ────────────────────────────────────────────────
  submitAnnotation() {
    const slip = this.slipsheet();
    const text = this.annotationText().trim();
    if (!slip || !text) return;
    this.slipsheetService.addAnnotation(slip, text).subscribe({
      next: updated => {
        this.updated.emit(updated);
        this.annotationText.set('');
        this.showAnnotationInput.set(false);
      },
      error: (err: { message?: string }) => this.error.set(err?.message || 'Fehler'),
    });
  }

  // ── PDF ───────────────────────────────────────────────────────
  downloadPdf() {
    const slip = this.slipsheet();
    if (!slip) return;
    this.slipsheetService.getPdf(slip.id).subscribe({
      next: blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `lieferschein-${slip.slipsheetnumber || slip.id}.pdf`;
        a.click();
        URL.revokeObjectURL(url);

        this.slipsheetService.getById(slip.id).subscribe({
          next: updated => this.updated.emit(updated),
          error: () => this.error.set('Lieferschein konnte nach PDF-Erzeugung nicht aktualisiert werden.'),
        });
      },
      error: () => this.error.set('PDF konnte nicht geladen werden.'),
    });
  }

  // ── Löschen ───────────────────────────────────────────────────
  printPdf() {
    const slip = this.slipsheet();
    if (!slip || this.printing()) return;

    this.printing.set(true);
    this.error.set('');

    this.slipsheetService.print(slip.id).subscribe({
      next: () => {
        this.printing.set(false);
        this.slipsheetService.getById(slip.id).subscribe({
          next: updated => this.updated.emit(updated),
          error: () => this.error.set('Lieferschein konnte nach dem Drucken nicht aktualisiert werden.'),
        });
      },
      error: (err: { message?: string }) => {
        this.error.set(err?.message || 'Drucken fehlgeschlagen');
        this.printing.set(false);
      },
    });
  }

  deleteSlipsheet() {
    const slip = this.slipsheet();
    if (!slip || !this.canDelete()) return;
    this.deleting.set(true);
    this.slipsheetService.delete(slip.id).subscribe({
      next: () => { this.deleting.set(false); this.deleted.emit(); },
      error: (err: { message?: string }) => {
        this.error.set(err?.message || 'Fehler beim Löschen');
        this.deleting.set(false);
      },
    });
  }

  // ── Template helpers (no arrow functions in bindings) ─────────
  toggleTextInput()       { this.showTextInput.update(v => !v); }
  toggleAnnotationInput() { this.showAnnotationInput.update(v => !v); }

  fmt(value: number): string {
    return new Intl.NumberFormat('de-AT', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
  }
}
