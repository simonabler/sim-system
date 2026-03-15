import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Subject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Customer, Shoppingcart, ArticleGroup, Discount } from '../../../models';
import { CustomerService } from '../../../services/customer.service';
import { ShoppingcartService } from '../../../services/shoppingcart.service';
import { ArticleGroupService } from '../../../services/article-group.service';
import { BillService } from '../../../services/bill.service';
import { BillWithShop } from '../../../models/billWithShop';
import { Bill } from '../../../models/bill.model';
import { ShoppingcartComponent } from '../../shoppingcart/shoppingcart.component';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-customer-detail',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgSelectModule, RouterLink, ShoppingcartComponent],
  templateUrl: './customer-detail.component.html',
  styleUrls: ['./customer-detail.component.css'],
})
export class CustomerDetailComponent implements OnInit, OnDestroy {
  customer = new Customer();
  shoppingcarts: Shoppingcart[] = [];
  bills: BillWithShop[] = [];
  ArticleGroups$!: Observable<ArticleGroup[]>;
  private articleGroupsSubject = new Subject<ArticleGroup[]>();
  private articleGroups: ArticleGroup[] = [];
  cartIdx: number | null = null;
  selectedSlipIds: number[] = [];

  submitted = false;
  isLoading = false;
  billModalOpen = false;
  apiUrlHTTP = environment.apiUrlHTTP;
  BillForm!: FormGroup;

  get f() { return this.BillForm.controls; }

  constructor(
    private customerService: CustomerService,
    private billService: BillService,
    private articlegroupService: ArticleGroupService,
    private route: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService,
  ) {
    this.ArticleGroups$ = this.articleGroupsSubject.pipe(
      map(o => o.filter(s => !this.customer.discounts.map(i => i.articleGroup.id).includes(s.id))),
    );
    this.articlegroupService.getAll().subscribe(data => {
      this.articleGroups = data;
      this.articleGroupsSubject.next(data);
    });
    this.BillForm = new FormGroup({
      id: new FormControl(null),
      billNumber: new FormControl(''),
      billDate: new FormControl(''),
    });
  }

  ngOnDestroy() {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => this.loadCustomer(params.get('id')!));
  }

  loadCustomer(id: string) {
    if (id !== 'new') {
      this.customerService.getById(+id).subscribe({
        next: (data: Customer) => {
          this.customer = data;
          this.loadShoppingcarts(data);
          this.loadBills(data);
          this.articleGroupsSubject.next(this.articleGroups);
        },
        error: () => this.customer = new Customer(),
      });
    } else {
      this.customer = new Customer();
    }
  }

  loadShoppingcarts(c: Customer) {
    this.customerService.getShoppingcarts(c).subscribe({ next: d => this.shoppingcarts = d });
  }

  loadBills(c: Customer) {
    this.customerService.getBills(c).subscribe({ next: d => this.bills = d });
  }

  back() { this.router.navigate(['/admin/customer']); }

  changeShoppingcarts(event: Shoppingcart) {
    if (this.cartIdx !== null) this.shoppingcarts[this.cartIdx] = event;
  }

  editBill(bill: Bill) {
    this.BillForm.patchValue(bill);
    this.billModalOpen = true;
  }

  saveBill() {
    this.submitted = true;
    if (this.BillForm.invalid) return;
    this.submitted = false;
    const bill = new Bill(this.BillForm.getRawValue());
    if (bill.id) {
      this.billService.update(bill).subscribe({
        next: (data: Bill) => {
          const idx = this.bills.findIndex(o => o.id === data.id);
          if (idx >= 0) { this.bills[idx].billNumber = data.billNumber; this.bills[idx].billDate = data.billDate; }
          this.toastr.success('Rechnung geändert');
          this.billModalOpen = false;
        },
        error: e => this.toastr.error(e),
      });
    }
  }

  makeBill(selectedIds: number[]) {
    this.billService.generate(selectedIds).subscribe({
      next: data => {
        const newBill = new BillWithShop(data);
        this.bills.push(newBill);
        this.toastr.success('Rechnung ' + newBill.getNumber() + ' erstellt');
      },
      error: e => this.toastr.error(e),
    });
  }

  downloadBill(bill: BillWithShop) {
    this.billService.recreate(bill).subscribe(() => {
      window.open(`${this.apiUrlHTTP}/bills/${bill.id}/pdf`, '_blank');
    });
  }

  downloadSlip(slip: Shoppingcart) {
    window.open(`${this.apiUrlHTTP}/slipsheets/${slip.id}/pdf`, '_blank');
  }

  updateDiscount(discount: Discount) {
    this.customerService.updateOrCreateDiscount(this.customer, discount).subscribe({
      next: () => { this.customer.discounts.push(discount); this.articleGroupsSubject.next(this.articleGroups); },
    });
  }

  deleteDiscount(discount: Discount) {
    this.customerService.deleteDiscount(this.customer, discount).subscribe({
      next: () => { this.customer.discounts = this.customer.discounts.filter(d => d.id !== discount.id); },
    });
  }

  isSelected(id: number): boolean { return this.selectedSlipIds.includes(id); }
  toggleSlip(id: number) {
    const idx = this.selectedSlipIds.indexOf(id);
    if (idx > -1) this.selectedSlipIds.splice(idx, 1);
    else this.selectedSlipIds.push(id);
  }
  printSlip(slip: Shoppingcart) {
    window.open(`${this.apiUrlHTTP}/slipsheets/${slip.id}/pdf`, '_blank');
  }

}
