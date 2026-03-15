import { Component, OnInit, HostListener } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Customer, Article } from '../../../models';

import { CustomerService } from '../../../services/customer.service';
import { Observable } from 'rxjs';
import { ArticleService } from '../../../services/article.service';
import { debounceTime, startWith } from 'rxjs/operators';
import { ShoppingcartService } from '../../../services/shoppingcart.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-mobile-tracking',
  templateUrl: './mobile-tracking.component.html',
  styleUrls: ['./mobile-tracking.component.css']
})
export class MobileTrackingComponent implements OnInit {

  InputForm: FormGroup;
  Customers$: Observable<Customer[]>;
  Articles$: Observable<any[]>;
  Article: Article;
  submitted = false;
  isMobile: Boolean = true;
  constructor(
    private customerService: CustomerService,
    private articleService: ArticleService,
    private shoppingcartService: ShoppingcartService,
    private toastr: ToastrService
  ) {

    this.isMobile = navigator.userAgent.match(/Android/i) !== null;

    this.Customers$ = this.customerService.getAll();

    this.createDefaultForm();
    if (this.customerService.currentCustomer)
      this.customerService.selectCustomer(this.customerService.currentCustomer);
  }

  ngOnInit(): void {
  }

  get f() { return this.InputForm.controls; }



  createDefaultForm() {
    this.InputForm = new FormGroup({

      customer: new FormControl(
        this.customerService.currentCustomer, [
        Validators.required,
      ]),
      code: new FormControl(
        '', [
        Validators.required,
      ]),
      amount: new FormControl(
        0, [
        Validators.required,
        Validators.min(0.00000001)
      ])
    });


    this.InputForm.get('code').valueChanges.pipe(
      debounceTime(250)
    ).subscribe(data => this.findCode(data));

    this.InputForm.get('customer').valueChanges.pipe(
    ).subscribe(data => {
      console.log(document.getElementsByClassName('ng-input')[0]);

      // this.hideKeyboard(document.getElementsByClassName('ng-input')[0].children[0]);
      this.customerService.selectCustomer(data);
    });


  }

  findCode(code) {
    this.articleService.getByCode(code).subscribe(
      articleData => {
        this.Article = Object.assign(new Article(), articleData);
      },
      error => {
        this.Article = new Article();
      });
  }


  reset() {
    this.InputForm.reset();
    this.submitted = false;
  }

  onSubmit() {

    this.InputForm.updateValueAndValidity();

    this.submitted = true;

    if (this.InputForm.invalid || !this.Article) {
      return;
    }

    const formData = this.InputForm.getRawValue();

    this.shoppingcartService.post(formData, this.Article)
      .subscribe(data => {
        //  this.reset();
        this.submitted = false;
        this.toastr.success(`${this.Article.artNumber || this.Article.name}: ${formData.amount}`, '', { timeOut: 1000 });
        this.Article.stock = this.Article.stock - formData.amount;
      },
        (error) => {
          console.error(error);
          this.toastr.error(error);

        });
  }

  customSearchFn(term: string, item: any) {
    term = term.toLocaleLowerCase();
    return item.companyName.toLocaleLowerCase().lastIndexOf(term, 0) === 0 ||
      item.firstName.toLocaleLowerCase().lastIndexOf(term, 0) === 0 ||
      item.lastName.toLocaleLowerCase().lastIndexOf(term, 0) === 0;
  }


  @HostListener('document:onbarcodescaned', ['$event'])
  onBarcodeReaderInput(e: CustomEvent) {
    this.InputForm.get('code').setValue(e.detail);
  }


  hideKeyboard(element) {
    element.attr('readonly', 'readonly'); // Force keyboard to hide on input field.
    element.attr('disabled', 'true'); // Force keyboard to hide on textarea field.
    setTimeout(function () {
      element.blur();  // actually close the keyboard
      // Remove readonly attribute after keyboard is hidden.
      element.removeAttr('readonly');
      element.removeAttr('disabled');
    }, 100);
  }

}
