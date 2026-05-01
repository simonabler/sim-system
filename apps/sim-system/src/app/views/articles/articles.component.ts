import { ChangeDetectionStrategy, Component, HostListener, computed, effect, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { debounceTime, startWith } from 'rxjs/operators';
import { ArticleService } from '../../services/article.service';
import { Article } from '../../models/article.model';
import { ArticleImportDialogComponent } from './import-dialog/article-import-dialog.component';

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
    return (this.allArticles()).filter(a =>
      a.name.toLowerCase().includes(name) &&
      a.code.toLowerCase().includes(code)
    );
  });

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

  goToArticle(id: number) { this.router.navigate(['/articles', id]); }
  newArticle() { this.router.navigate(['/articles', 'new']); }
}
