import { ChangeDetectionStrategy, Component, HostListener, computed, effect, ElementRef, inject, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { debounceTime, switchMap, catchError, of, filter, map } from 'rxjs';
import { ArticleService } from '../../services/article.service';

interface LogEntry {
  articleName: string;
  code: string;
  isVal: number;
  diff: number;
  unit: string;
}

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './inventory.component.html',
  styleUrl: './inventory.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InventoryComponent {
  @ViewChild('codeInput') codeInputRef!: ElementRef<HTMLInputElement>;

  private articleService = inject(ArticleService);
  private route = inject(ActivatedRoute);

  readonly codeCtrl = new FormControl('');
  readonly isVal = signal(0);
  readonly submitting = signal(false);
  readonly recentLog = signal<LogEntry[]>([]);
  private readonly routeCode = toSignal(
    this.route.queryParamMap.pipe(map(params => params.get('code') ?? '')),
    { initialValue: '' }
  );

  readonly article = toSignal(
    this.codeCtrl.valueChanges.pipe(
      debounceTime(300),
      filter(code => !!code),
      switchMap(code =>
        this.articleService.getByCode(code!).pipe(catchError(() => of(null)))
      )
    ),
    { initialValue: null }
  );

  readonly shouldVal = computed(() => this.article()?.stock ?? 0);
  readonly canBookInventory = computed(() => !!this.article()?.trackStock);
  readonly diff = computed(() => this.isVal() - this.shouldVal());
  readonly diffClass = computed(() => {
    const d = this.diff();
    if (d < 0) return 'negative';
    if (d > 0) return 'positive';
    return 'zero';
  });

  constructor() {
    effect(() => {
      const code = this.routeCode();
      if (this.codeCtrl.value !== code) {
        this.codeCtrl.setValue(code, { emitEvent: true });
        setTimeout(() => this.codeInputRef?.nativeElement?.focus(), 50);
      }
    });

    // Wenn Artikel wechselt: isVal auf Soll vorbelegen
    effect(() => {
      const stock = this.shouldVal();
      this.isVal.set(stock);
    });
  }

  @HostListener('document:onbarcodescaned', ['$event'])
  onBarcodeReaderInput(event: Event) {
    this.codeCtrl.setValue((event as CustomEvent<string>).detail, { emitEvent: true });
    setTimeout(() => this.codeInputRef?.nativeElement?.focus(), 50);
  }

  stepIs(delta: number) { this.isVal.update(v => Math.max(0, v + delta)); }

  onIsInput(event: Event) {
    const val = +(event.target as HTMLInputElement).value;
    this.isVal.set(isNaN(val) ? 0 : val);
  }

  onSubmit() {
    const art = this.article();
    if (!art || !art.trackStock) return;
    this.submitting.set(true);
    this.articleService.createInventory(art, this.isVal()).subscribe({
      next: () => {
        this.submitting.set(false);
        const entry: LogEntry = {
          articleName: art.name,
          code: art.code,
          isVal: this.isVal(),
          diff: this.diff(),
          unit: art.unit,
        };
        this.recentLog.update(log => [entry, ...log].slice(0, 5));
        this.codeCtrl.setValue('', { emitEvent: false });
        this.isVal.set(0);
        setTimeout(() => this.codeInputRef?.nativeElement?.focus(), 50);
      },
      error: () => { this.submitting.set(false); }
    });
  }

  logDiffClass(diff: number): string {
    if (diff < 0) return 'neg';
    if (diff > 0) return 'pos';
    return 'ok';
  }
}
