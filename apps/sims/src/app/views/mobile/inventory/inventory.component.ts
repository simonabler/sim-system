import { Component, OnInit, HostListener } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { Article } from '../../../models';
import { debounceTime } from 'rxjs/operators';
import { ArticleService } from '../../../services/article.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-inventory',
  templateUrl: './inventory.component.html',
  styleUrls: ['./inventory.component.css']
})
export class InventoryComponent implements OnInit {


  InputForm: FormGroup;
  Articles$: Observable<any[]>;
  Article: Article;
  submitted = false;


  constructor(
    private articleService: ArticleService,
    private toastr: ToastrService) {

    this.createDefaultForm();
  }

  get f() { return this.InputForm.controls; }


  ngOnInit(): void {
  }

  @HostListener('document:onbarcodescaned', ['$event'])
  onBarcodeReaderInput(e: CustomEvent) {
    this.InputForm.get('code').setValue(e.detail);
  }

  createDefaultForm() {
    this.InputForm = new FormGroup({

      code: new FormControl(
        '', [
        Validators.required,
      ]),
      should: new FormControl(
        { value: 0, disabled: true }, []),
      is: new FormControl(
        0, [
        Validators.required,
        Validators.min(0)
      ])
    });


    this.InputForm.get('code').valueChanges.pipe(
      debounceTime(250)
    ).subscribe(data => this.findCode(data));
  }

  findCode(code) {
    this.articleService.getByCode(code).subscribe(
      articleData => {
        this.setArticleData(articleData);
      },
      error => {
        console.error(error);
        this.setArticleData(null);
      });
  }

  reset() {
    this.InputForm.reset();
    this.submitted = false;
  }

  setArticleData(article: Article) {

    if (article && article instanceof Article) {
      this.Article = article;
      this.InputForm.get('should').setValue(this.Article.stock);
      this.InputForm.get('is').setValue(this.Article.stock);
    } else {
      this.Article = null;
      this.InputForm.get('should').setValue(0.0);
      this.InputForm.get('is').setValue(0.0);
    }
  }

  onSubmit() {

    this.InputForm.updateValueAndValidity();

    this.submitted = true;

    if (this.InputForm.invalid || !this.Article) {
      return;
    }

    const formData = this.InputForm.getRawValue();

    this.articleService.createInventory(this.Article, formData.is)
      .subscribe(data => {
        this.setArticleData(data);
        this.submitted = false;
        this.toastr.success(`OK: ${data.stock} ${data.unit}`, '', { timeOut: 1000 });
      },
        (error) => {
          console.error(error);
          this.setArticleData(null);
          this.toastr.error(error);
        });
  }


}
