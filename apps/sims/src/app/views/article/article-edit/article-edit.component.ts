import { Component, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs';
import { Article, ArticleGroup } from '../../../models';
import { ArticleGroupService } from '../../../services/article-group.service';
import { ArticleService } from '../../../services/article.service';

@Component({
  selector: 'app-article-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgSelectModule],
  templateUrl: './article-edit.component.html',
  styleUrls: ['./article-edit.component.css'],
})
export class ArticleEditComponent implements OnInit {
  ArticleGroups$!: Observable<ArticleGroup[]>;
  ArticelForm!: FormGroup;
  private initValues: any;
  submitted = false;
  private _article: Article | null = null;

  @Input() set article(value: Article | null) {
    this._article = value;
    if (this.ArticelForm) this.openModal(value);
  }
  get article() { return this._article; }

  @Output() articleChange = new EventEmitter<Article>();
  @Output() added = new EventEmitter<Article>();
  @Output() deleted = new EventEmitter<Article>();
  @Output() closed = new EventEmitter<void>();

  get f() { return this.ArticelForm.controls; }

  constructor(
    private articleService: ArticleService,
    private articlegroupService: ArticleGroupService,
    private toastr: ToastrService,
  ) {}

  ngOnInit() {
    this.ArticelForm = new FormGroup({
      id: new FormControl(null),
      name: new FormControl('', [Validators.required]),
      code: new FormControl('', [Validators.required]),
      description: new FormControl(''),
      artNumber: new FormControl(''),
      supplier: new FormControl('', [Validators.required]),
      type: new FormControl('', [Validators.required]),
      price: new FormControl('', [Validators.required, Validators.min(0)]),
      singlePos: new FormControl(false),
      trackStock: new FormControl(true),
      noDiscount: new FormControl(false),
      articleGroup: new FormControl(null),
      unit: new FormControl('', [Validators.required]),
    });
    this.initValues = this.ArticelForm.value;
    this.ArticleGroups$ = this.articlegroupService.getAll();
    if (this._article) this.openModal(this._article);
  }

  @HostListener('document:onbarcodescaned', ['$event'])
  onBarcodeReaderInput(e: CustomEvent) {
    this.ArticelForm.get('code')!.setValue(e.detail);
  }

  openModal(article: Article | null) {
    this.resetForm();
    if (article) this.ArticelForm.patchValue(article);
  }

  save() {
    this.submitted = true;
    if (this.ArticelForm.invalid) return;
    const article = new Article(this.ArticelForm.getRawValue());
    if (article.id) this.update(article);
    else this.newArticle(article);
  }

  update(article: Article) {
    this.articleService.update(article).subscribe({
      next: data => {
        Object.assign(article, data);
        this.articleChange.emit(article);
        this.toastr.success('Artikel aktualisiert');
        this.close();
      },
      error: e => this.toastr.error(e),
    });
  }

  newArticle(article: Article) {
    this.articleService.create(article).subscribe({
      next: data => {
        this.added.emit(data);
        this.toastr.success('Artikel erstellt');
        this.close();
      },
      error: e => this.toastr.error(e),
    });
  }

  delete() {
    if (!this.f['id'].value) return;
    const article = new Article(this.ArticelForm.getRawValue());
    this.articleService.delete(article).subscribe({
      next: data => this.deleted.emit(data),
      error: e => console.error(e),
    });
  }

  close() { this.closed.emit(); }
  resetForm() { this.submitted = false; if (this.initValues) this.ArticelForm.patchValue(this.initValues); }
}
