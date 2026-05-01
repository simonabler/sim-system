import { ChangeDetectionStrategy, Component, HostListener, computed, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { switchMap, map, catchError, of, filter } from 'rxjs';
import { ArticleService } from '../../services/article.service';
import { ArticleGroupService } from '../../services/article-group.service';
import { Article, ArticleGroup } from '../../models/article.model';

@Component({
  selector: 'app-article-detail',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './article-detail.component.html',
  styleUrl: './article-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArticleDetailComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private articleService = inject(ArticleService);
  private articleGroupService = inject(ArticleGroupService);

  readonly form = new FormGroup({
    id:            new FormControl<number | null>(null),
    name:          new FormControl('', [Validators.required]),
    code:          new FormControl('', [Validators.required]),
    artNumber:     new FormControl(''),
    description:   new FormControl(''),
    supplier:      new FormControl('', [Validators.required]),
    type:          new FormControl('', [Validators.required]),
    price:         new FormControl<number>(0, [Validators.required, Validators.min(0)]),
    unit:          new FormControl('', [Validators.required]),
    singlePos:     new FormControl(false),
    trackStock:    new FormControl(true),
    noDiscount:    new FormControl(false),
    articleGroup:  new FormControl<number | null>(null),
  });

  readonly saving = signal(false);
  readonly error = signal('');

  readonly articleGroups = toSignal(this.articleGroupService.getAll(), { initialValue: [] as ArticleGroup[] });

  private readonly routeId = toSignal(
    this.route.paramMap.pipe(map(p => p.get('id'))),
    { initialValue: null }
  );

  readonly isNew = computed(() => this.routeId() === 'new');

  private readonly loadedArticle = toSignal(
    this.route.paramMap.pipe(
      map(p => p.get('id')),
      filter(id => id !== 'new' && id !== null),
      switchMap(id =>
        this.articleService.getById(+id!).pipe(
          map((data: any) => Array.isArray(data) ? data[0] : data),
          catchError(() => { this.error.set('Artikel konnte nicht geladen werden.'); return of(null); })
        )
      )
    )
  );

  readonly loading = computed(() => !this.isNew() && this.loadedArticle() === undefined && !this.error());
  readonly inventoryArticle = computed(() => this.loadedArticle());
  readonly canGoToInventory = computed(() => !!this.inventoryArticle()?.code && !!this.inventoryArticle()?.trackStock);

  constructor() {
    effect(() => {
      const article = this.loadedArticle();
      if (article) {
        this.form.patchValue({ ...article, articleGroup: article.articleGroup?.id ?? null });
      }
    });
  }

  @HostListener('document:onbarcodescaned', ['$event'])
  onBarcodeReaderInput(event: Event) {
    this.form.controls.code.setValue((event as CustomEvent<string>).detail);
  }

  save() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving.set(true);
    const val = this.form.getRawValue();
    const article = new Article({ ...val, articleGroup: val.articleGroup ? { id: +val.articleGroup } : undefined } as any);
    const op = val.id ? this.articleService.update(article) : this.articleService.create(article);
    op.subscribe({
      next: () => { this.saving.set(false); this.router.navigate(['/articles']); },
      error: err => { this.saving.set(false); this.error.set(err.message || 'Fehler beim Speichern'); }
    });
  }

  delete() {
    if (!this.form.value.id) return;
    if (!confirm('Artikel wirklich löschen?')) return;
    const article = new Article(this.form.getRawValue() as any);
    this.articleService.delete(article).subscribe({
      next: () => this.router.navigate(['/articles']),
      error: err => this.error.set(err.message || 'Fehler beim Löschen')
    });
  }

  goToInventory() {
    const code = this.form.controls.code.value || this.inventoryArticle()?.code || '';
    if (!code) return;
    this.router.navigate(['/inventory'], { queryParams: { code } });
  }

  back() { this.router.navigate(['/articles']); }
}
