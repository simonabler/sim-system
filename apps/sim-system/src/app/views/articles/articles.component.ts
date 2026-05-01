import { ChangeDetectionStrategy, Component, HostListener, computed, effect, inject, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { debounceTime, startWith } from 'rxjs/operators';
import { ArticleService } from '../../services/article.service';
import { Article } from '../../models/article.model';
import { ArticleImportDialogComponent } from './import-dialog/article-import-dialog.component';
import { ariaSort, nextSortState, sortIcon, sortItems, SortState } from '../../shared/table-sort';

type ArticleSortKey = 'name' | 'artNumber' | 'code' | 'stock' | 'unit' | 'status' | 'inventoryDate';

@Component({
  selector: 'app-articles',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ArticleImportDialogComponent],
  templateUrl: './articles.component.html',
  styleUrl: './articles.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArticlesComponent {
  private articleService = inject(ArticleService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  @ViewChild(ArticleImportDialogComponent) importDialog!: ArticleImportDialogComponent;
  openImport() { this.importDialog.open(); }

  readonly searchCtrl = new FormControl('');
  readonly codeCtrl = new FormControl('');
  readonly sortState = signal<SortState<ArticleSortKey>>({ key: null, direction: null });

  private readonly allArticles = toSignal(this.articleService.getAll(), { initialValue: [] as Article[] });
  private readonly routeCode = toSignal(
    this.route.queryParamMap.pipe(map(params => params.get('code') ?? '')),
    { initialValue: '' }
  );
  private readonly searchTerm = toSignal(
    this.searchCtrl.valueChanges.pipe(debounceTime(200), startWith('')),
    { initialValue: '' }
  );
  private readonly codeTerm = toSignal(
    this.codeCtrl.valueChanges.pipe(debounceTime(200), startWith('')),
    { initialValue: '' }
  );

  readonly loading = computed(() => this.allArticles() === undefined);

  constructor() {
    effect(() => {
      const code = this.routeCode();
      if (this.codeCtrl.value !== code) {
        this.codeCtrl.setValue(code, { emitEvent: true });
      }
    });
  }

  @HostListener('document:onbarcodescaned', ['$event'])
  onBarcodeReaderInput(event: Event) {
    this.codeCtrl.setValue((event as CustomEvent<string>).detail, { emitEvent: true });
  }

  readonly filtered = computed(() => {
    const name = (this.searchTerm() ?? '').toLowerCase();
    const code = (this.codeTerm() ?? '').toLowerCase();
    const filtered = (this.allArticles()).filter(a =>
      a.name.toLowerCase().includes(name) &&
      a.code.toLowerCase().includes(code)
    );

    return sortItems(filtered, this.sortState(), {
      name: article => article.name,
      artNumber: article => article.artNumber,
      code: article => article.code,
      stock: article => article.stock,
      unit: article => article.unit,
      status: article => this.stockRank(article.stock),
      inventoryDate: article => article.inventoryDate,
    });
  });

  sortBy(key: ArticleSortKey) {
    this.sortState.update(state => nextSortState(state, key));
  }

  sortIcon(key: ArticleSortKey): string {
    return sortIcon(this.sortState(), key);
  }

  ariaSort(key: ArticleSortKey): 'none' | 'ascending' | 'descending' {
    return ariaSort(this.sortState(), key);
  }

  getBadgeClass(stock: number): string {
    if (stock <= 0)  return 'sims-badge sims-badge-error';
    if (stock < 10)  return 'sims-badge sims-badge-warning';
    return 'sims-badge sims-badge-success';
  }

  getBadgeLabel(stock: number): string {
    if (stock <= 0)  return 'Kein Bestand';
    if (stock < 10)  return 'Niedrig';
    return 'Verfügbar';
  }

  private stockRank(stock: number): number {
    if (stock <= 0) return 0;
    if (stock < 10) return 1;
    return 2;
  }

  goToArticle(id: number) { this.router.navigate(['/articles', id]); }
  newArticle() { this.router.navigate(['/articles', 'new']); }
}
