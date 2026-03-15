import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Observable, merge, Subject } from 'rxjs';
import { debounceTime, map, catchError } from 'rxjs/operators';
import { Article, ArticleGroup } from '../../../models';
import { ArticleService } from '../../../services/article.service';
import { ArticleGroupService } from '../../../services/article-group.service';
import { ArticleEditComponent } from '../article-edit/article-edit.component';

@Component({
  selector: 'app-article',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ArticleEditComponent],
  templateUrl: './article.component.html',
  styleUrls: ['./article.component.css'],
})
export class ArticleComponent implements OnInit {
  SearchForm: FormGroup;
  Articles$!: Observable<Article[]>;
  ArticleGroups$!: Observable<ArticleGroup[]>;
  private reloadFilterSubject = new Subject<Article[]>();
  private articles: Article[] = [];
  submitted = false;
  isLoading = true;
  selectedArticle: Article | null = null;
  editModalOpen = false;

  get f() { return this.SearchForm.controls; }

  constructor(
    private articleService: ArticleService,
    private articlegroupService: ArticleGroupService,
    private route: ActivatedRoute,
  ) {
    this.SearchForm = new FormGroup({
      search: new FormControl(''),
      code: new FormControl(''),
    });

    this.ArticleGroups$ = this.articlegroupService.getAll();

    const codeChange = this.SearchForm.get('code')!.valueChanges.pipe(
      debounceTime(250),
      map(o => this.findCode(this.articles, o)),
      map(o => this.findName(o, this.SearchForm.get('search')!.value)),
    );
    const searchChange = this.SearchForm.get('search')!.valueChanges.pipe(
      debounceTime(250),
      map(o => this.findName(this.articles, o)),
      map(o => this.findCode(o, this.SearchForm.get('code')!.value)),
    );
    const reloadFilter = this.reloadFilterSubject.asObservable().pipe(
      map(o => this.findCode(o, this.SearchForm.get('code')!.value)),
      map(o => this.findName(o, this.SearchForm.get('search')!.value)),
    );

    this.Articles$ = merge(searchChange, codeChange, reloadFilter).pipe(
      map((value: any) => { this.isLoading = false; return value; }),
      catchError(error => { this.isLoading = false; return error; }),
    );
  }

  @HostListener('document:onbarcodescaned', ['$event'])
  onBarcodeReaderInput(e: CustomEvent) {
    this.SearchForm.get('code')!.setValue(e.detail);
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params?.['code']) this.SearchForm.get('code')!.setValue(params['code']);
    });
    this.articleService.getAll().subscribe(data => {
      this.articles = data;
      this.reloadFilterSubject.next(data);
    });
  }

  findCode(array: Article[], data: string): Article[] {
    this.isLoading = true;
    return array?.filter(v => v.code?.toLocaleLowerCase().includes(data?.toLocaleLowerCase() ?? '')) ?? [];
  }
  findName(array: Article[], data: string): Article[] {
    this.isLoading = true;
    return array?.filter(v => v.name?.toLocaleLowerCase().includes(data?.toLocaleLowerCase() ?? '')) ?? [];
  }

  openModal(article: Article | null) {
    this.selectedArticle = article;
    this.editModalOpen = true;
  }
  closeModal() { this.editModalOpen = false; }

  onFileSelected(event: Event, preview: boolean) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      const formData = new FormData();
      formData.append('file', file);
      this.articleService.importArticle(preview, formData).subscribe(data => console.log(data));
    }
  }

  onAdded($event: Article) {
    this.articles.push($event);
    this.reloadFilterSubject.next(this.articles);
    this.closeModal();
  }
  onDeleted($event: Article) {
    const idx = this.articles.findIndex(a => a.id === $event.id);
    if (idx > -1) this.articles.splice(idx, 1);
    this.reloadFilterSubject.next(this.articles);
    this.closeModal();
  }
  onClose() {
    const idx = this.articles.findIndex(a => a.id === this.selectedArticle?.id);
    if (idx > -1) Object.assign(this.articles[idx], this.selectedArticle);
    this.reloadFilterSubject.next(this.articles);
    this.closeModal();
  }
}
