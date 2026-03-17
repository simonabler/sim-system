import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ArticleService } from '../../services/article.service';
import { ArticleGroupService } from '../../services/article-group.service';
import { Article, ArticleGroup } from '../../models/article.model';

@Component({
  selector: 'app-article-detail',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './article-detail.component.html',
  styleUrl: './article-detail.component.scss',
})
export class ArticleDetailComponent implements OnInit {
  form = new FormGroup({
    id:          new FormControl<number | null>(null),
    name:        new FormControl('', [Validators.required]),
    code:        new FormControl('', [Validators.required]),
    artNumber:   new FormControl(''),
    description: new FormControl(''),
    supplier:    new FormControl('', [Validators.required]),
    type:        new FormControl('', [Validators.required]),
    price:       new FormControl<number>(0, [Validators.required, Validators.min(0)]),
    unit:        new FormControl('', [Validators.required]),
    stock:       new FormControl<number>(0),
    inventoryDate: new FormControl(''),
    singlePos:   new FormControl(false),
    trackStock:  new FormControl(true),
    noDiscount:  new FormControl(false),
    articleGroup: new FormControl<number | null>(null),
  });

  articleGroups: ArticleGroup[] = [];
  loading = false;
  saving = false;
  error = '';
  isNew = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private articleService: ArticleService,
    private articleGroupService: ArticleGroupService,
  ) {}

  ngOnInit() {
    this.articleGroupService.getAll().subscribe(g => this.articleGroups = g);
    const id = this.route.snapshot.paramMap.get('id');
    if (id === 'new') {
      this.isNew = true;
    } else {
      this.loading = true;
      this.articleService.getById(+id!).subscribe({
        next: (data: any) => {
          const article = Array.isArray(data) ? data[0] : data;
          if (article) this.form.patchValue({ ...article, articleGroup: article.articleGroup?.id });
          this.loading = false;
        },
        error: () => { this.loading = false; this.error = 'Artikel konnte nicht geladen werden.'; }
      });
    }
  }

  save() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving = true;
    const val = this.form.getRawValue();
    const article = new Article({ ...val, articleGroup: val.articleGroup ? { id: +val.articleGroup } : undefined } as any);

    const op = val.id ? this.articleService.update(article) : this.articleService.create(article);
    op.subscribe({
      next: () => { this.saving = false; this.router.navigate(['/articles']); },
      error: err => { this.saving = false; this.error = err.message || 'Fehler beim Speichern'; }
    });
  }

  delete() {
    if (!this.form.value.id) return;
    if (!confirm('Artikel wirklich löschen?')) return;
    const article = new Article(this.form.getRawValue() as any);
    this.articleService.delete(article).subscribe({
      next: () => this.router.navigate(['/articles']),
      error: err => this.error = err.message || 'Fehler beim Löschen'
    });
  }

  back() { this.router.navigate(['/articles']); }
}
