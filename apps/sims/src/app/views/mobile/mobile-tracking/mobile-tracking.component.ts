import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { ToastrService } from 'ngx-toastr';
import { Customer, Article } from '../../../models';
import { CustomerService } from '../../../services/customer.service';
import { ArticleService } from '../../../services/article.service';
import { ShoppingcartService } from '../../../services/shoppingcart.service';
import { debounceTime } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-mobile-tracking',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgSelectModule],
  templateUrl: './mobile-tracking.component.html',
  styleUrls: ['./mobile-tracking.component.css'],
})
export class MobileTrackingComponent implements OnInit {
  InputForm!: FormGroup;
  Customers$!: Observable<Customer[]>;
  Article: Article | null = null;
  submitted = false;
  isMobile = navigator.userAgent.match(/Android/i) !== null;

  get f() { return this.InputForm.controls; }

  constructor(
    private customerService: CustomerService,
    private articleService: ArticleService,
    private shoppingcartService: ShoppingcartService,
    private toastr: ToastrService,
  ) {}

  ngOnInit() {
    this.Customers$ = this.customerService.getAll();
    this.createForm();
    if (this.customerService.currentCustomer)
      this.customerService.selectCustomer(this.customerService.currentCustomer);
  }

  createForm() {
    this.InputForm = new FormGroup({
      customer: new FormControl(this.customerService.currentCustomer, [Validators.required]),
      code: new FormControl('', [Validators.required]),
      amount: new FormControl(0, [Validators.required, Validators.min(0.00000001)]),
    });
    this.InputForm.get('code')!.valueChanges.pipe(debounceTime(250)).subscribe(v => this.findCode(v));
    this.InputForm.get('customer')!.valueChanges.subscribe(v => this.customerService.selectCustomer(v));
  }

  findCode(code: string) {
    this.articleService.getByCode(code).subscribe({
      next: data => this.Article = Object.assign(new Article(), data),
      error: () => this.Article = null,
    });
  }

  reset() { this.InputForm.reset(); this.submitted = false; }

  onSubmit() {
    this.submitted = true;
    this.InputForm.updateValueAndValidity();
    if (this.InputForm.invalid || !this.Article) return;
    const formData = this.InputForm.getRawValue();
    this.shoppingcartService.post(formData, this.Article).subscribe({
      next: () => {
        this.submitted = false;
        this.toastr.success(`${this.Article!.artNumber || this.Article!.name}: ${formData.amount}`, '', { timeOut: 1000 });
        this.Article!.stock = (this.Article!.stock as number) - formData.amount;
      },
      error: e => this.toastr.error(e),
    });
  }

  customSearchFn(term: string, item: Customer) {
    term = term.toLocaleLowerCase();
    return (item.companyName?.toLocaleLowerCase().startsWith(term) ||
            item.firstName?.toLocaleLowerCase().startsWith(term) ||
            item.lastName?.toLocaleLowerCase().startsWith(term)) ?? false;
  }

  @HostListener('document:onbarcodescaned', ['$event'])
  onBarcodeReaderInput(e: CustomEvent) {
    this.InputForm.get('code')!.setValue(e.detail);
  }
}
