import { Component, OnInit, ViewChild, HostListener } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { debounceTime, startWith, switchMap, map, tap, catchError } from 'rxjs/operators';
import { Observable, merge, of, Subject } from 'rxjs';
import { Article, ArticleGroup } from '../../../models';
import { ArticleService } from '../../../services/article.service';
import { ModalDirective } from 'ngx-bootstrap';
import { updateLocale } from 'moment';
import { ArticleGroupService } from '../../../services/article-group.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-article',
  templateUrl: './article.component.html',
  styleUrls: ['./article.component.css']
})
export class ArticleComponent implements OnInit {

  SearchForm: FormGroup;
  Articles$: Observable<Article[]>;
  ArticleGroups$: Observable<ArticleGroup[]>;
  private reloadFilterSubject: Subject<Article[]> = new Subject<Article[]>();
  private articles: Article[];
  submitted;
  isLoading: boolean = true;

  selectedArticle

  @ViewChild('exampleModal', { static: false }) public editModal: ModalDirective;
  get f() { return this.SearchForm.controls; }

  constructor(
    private articleService: ArticleService,
    private articlegroupService: ArticleGroupService,
    private route: ActivatedRoute,
  ) {

    this.SearchForm = new FormGroup({
      search: new FormControl(
        '', []),
      code: new FormControl(
        '', [])
    });

    /*
      id: number;
  name: string;
  description: string;
  type: string;
  artNumber: string;
  code: string;
  supplier: string;
  imgPath: string;
  price: number;
  stock: number;
  unit: string;
    */

    this.ArticleGroups$ = this.articlegroupService.getAll();


    const codeChange = this.SearchForm.get('code').valueChanges.pipe(
      debounceTime(250),
      map(o => this.findCode(this.articles, o)),
      map(o => this.findName(o, this.SearchForm.get('search').value))
    );
    const searchChange = this.SearchForm.get('search').valueChanges.pipe(
      debounceTime(250),
      map(o => this.findName(this.articles, o)),
      map(o => this.findCode(o, this.SearchForm.get('code').value))
    );

    const reloadFilter = this.reloadFilterSubject.asObservable().pipe(
      map(o => this.findCode(o, this.SearchForm.get('code').value)),
      map(o => this.findName(o, this.SearchForm.get('search').value)),
    );

    this.Articles$ = merge(searchChange, codeChange, reloadFilter).pipe(
      map((value: any) => { this.isLoading = false; return value; }),
      catchError(error => { this.isLoading = false; return error; })
    );

  }

  @HostListener('document:onbarcodescaned', ['$event'])
  onBarcodeReaderInput(e: CustomEvent) {
    this.SearchForm.get('code').setValue(e.detail);
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      const code = params?.code || '';
      if (code) {
        this.SearchForm.get('code').setValue(code);
      }
    });

    this.articleService.getAll().subscribe(data => {
      this.articles = data;
      this.reloadFilterSubject.next(data);
    });
  }

  findCode(array: Article[], data: string) {
    this.isLoading = true;
    return array
      ?.filter((value: Article) => value.code.toLocaleLowerCase().indexOf(data.toLocaleLowerCase()) !== -1);
  }

  findName(array: Article[], data: string) {
    this.isLoading = true;
    return array
      ?.filter((value: Article) => value.name.toLocaleLowerCase().indexOf(data.toLocaleLowerCase()) !== -1);
  }

  openModal(article) {
    this.selectedArticle = article;

    this.editModal.show();
  }


  onFileSelected(event, preview) {
    const file: File = event.target.files[0];
    if (file) {
      let fileName = file.name;
      const formData = new FormData();
      formData.append("file", file);
      const upload$ = this.articleService.importArticle(preview, formData)
      upload$.subscribe((data) => console.log(data));
    }

  }

  onAdded($event) {
    this.articles.push($event);
    this.reloadFilterSubject.next(this.articles);
  }

  onDeleted($event) {
    const index = this.articles.findIndex(a => a.id === $event.id, 0);
    if (index > -1) {
      this.articles.splice(index, 1);
    }
    this.reloadFilterSubject.next(this.articles);
  }

  onClose() {
    const index = this.articles.findIndex(a => a.id === this.selectedArticle?.id, 0);
    if (index > -1) {
      Object.assign(this.articles[index], this.selectedArticle);
    }

    this.reloadFilterSubject.next(this.articles);
    this.editModal.hide();
  }
}
