import { Component, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

import { Observable } from 'rxjs';
import { Article, ArticleGroup } from '../../../models';
import { ArticleGroupService } from '../../../services/article-group.service';
import { ArticleService } from '../../../services/article.service';

@Component({
  selector: 'app-article-edit',
  templateUrl: './article-edit.component.html',
  styleUrls: ['./article-edit.component.css']
})
export class ArticleEditComponent implements OnInit {

  ArticleGroups$: Observable<ArticleGroup[]>;
  ArticelForm: FormGroup;
  ArticelFormInitValues;
  get f() { return this.ArticelForm.controls; }
  get farticlegroup() { return this.ArticelForm.get('articleGroup').get('name'); }
  submitted;

  _article: Article;

  @Input()
  set article(value) {
    this._article = value;
    this.openModal(this._article);
  }

  get article(): Article {
    return this._article;
  }

  @Output() articleChange: EventEmitter<Article> = new EventEmitter<Article>();


  @Output()
  added: EventEmitter<Article> = new EventEmitter<Article>();

  @Output()
  deleted: EventEmitter<Article> = new EventEmitter<Article>();

  @Output()
  closed: EventEmitter<Article> = new EventEmitter<Article>();

  constructor(
    private articleService: ArticleService,
    private articlegroupService: ArticleGroupService,
    private toastr: ToastrService
  ) {


    this.ArticelForm = new FormGroup({
      id: new FormControl(
        null, []),
      name: new FormControl(
        '', [
        Validators.required
      ]),
      code: new FormControl(
        '', [
        Validators.required
      ]),
      description: new FormControl(
        '', []),
      artNumber: new FormControl(
        '', []),
      supplier: new FormControl(
        '', [
        Validators.required
      ]),
      type: new FormControl(
        '', [
        Validators.required
      ]),
      price: new FormControl(
        '', [
        Validators.required,
        Validators.min(0)
      ]),

      singlePos: new FormControl(
        false, [Validators.required
      ]),
      trackStock: new FormControl(
        true, [Validators.required
      ]),
      noDiscount: new FormControl(
        false, [Validators.required
      ]),
      articleGroup: new FormControl({
        id: new FormControl(),
        name: new FormControl(
          '', [
          Validators.required,
          Validators.min(0)
        ])
      }),
      unit: new FormControl(
        '', [
        Validators.required
      ]),

    });

    this.ArticelFormInitValues = this.ArticelForm.value;
    this.ArticleGroups$ = this.articlegroupService.getAll();


  }

  ngOnInit(): void {
  }


  @HostListener('document:onbarcodescaned', ['$event'])
  onBarcodeReaderInput(e: CustomEvent) {
    this.ArticelForm.get('code').setValue(e.detail);
  }

  openModal(article) {
    this.resetForm();
    if (article) {
      this.loadFormValues(article);
    }
  }

  save() {
    const article = new Article(this.ArticelForm.getRawValue());
    console.log(article)
    console.log(this.ArticelForm.getRawValue())

    if (article.id) {
      this.update(article);
    } else {
      this.newArticle(article);
    }
  }

  update(article) {
    this.articleService.update(article)
      .subscribe(data => {
        if (!data) {
          throw new Error('Fehler beim Updaten');
        }
        Object.assign(article, data);
        this.article = article;
        this.articleChange.emit(this.article);
        this.toastr.success('Artikel erfolgreich aktualisiert', 'Erfolgreich');
        this.close();
      }, error => {
        console.error(error);
        this.toastr.error(error);
      });
  }

  newArticle(article) {
    console.log(article)
    this.articleService.create(article)
      .subscribe(data => {
        if (!data) {
          throw new Error('Fehler beim Erstellen');
        }
        this.added.next(data);
        this.close();
        this.toastr.success('Artikel erfolgreich erstellt', 'Erfolgreich');
      }, error => {
        console.error(error);
        this.toastr.error('Fehler beim Erstellen', error);
      });
  }

  delete() {

    const articleToDel = new Article(this.ArticelForm.getRawValue());
    if (this.f.id.value) {
      this.articleService.delete(articleToDel)
        .subscribe(data => {
          if (!data) {
            throw new Error('Fehler beim Löschen');
          }
          this.deleted.next(data)
        }, error => {
          console.error(error);
        });
    }
  }

  close() {
    this.closed.emit(null);
  }

  resetForm() {
    this.submitted = false;
    this.ArticelForm.patchValue(this.ArticelFormInitValues);
  }

  loadFormValues(article) {
    this.ArticelForm.patchValue(article);
  }

}
