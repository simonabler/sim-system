import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CustomerService } from '../../services/customer.service';
import { Customer } from '../../models/customer.model';
import { Slipsheet, Bill } from '../../models/bill.model';

@Component({
  selector: 'app-customer-detail',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './customer-detail.component.html',
  styleUrl: './customer-detail.component.scss',
})
export class CustomerDetailComponent implements OnInit {
  form = new FormGroup({
    id:              new FormControl<number | null>(null),
    firstName:       new FormControl(''),
    lastName:        new FormControl(''),
    companyName:     new FormControl(''),
    email:           new FormControl(''),
    customerNumber:  new FormControl(''),
    phoneCompany:    new FormControl(''),
    phonePrivate:    new FormControl(''),
    address:         new FormControl(''),
    postcode:        new FormControl(''),
    country:         new FormControl(''),
    uid:             new FormControl(''),
    customerDiscount: new FormControl<number>(0),
  });

  customer: Customer | null = null;
  slipsheets: Slipsheet[] = [];
  bills: Bill[] = [];
  loading = false;
  saving = false;
  error = '';
  isNew = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private customerService: CustomerService,
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id === 'new') {
      this.isNew = true;
      this.customer = new Customer();
    } else {
      this.loading = true;
      this.customerService.getById(+id!).subscribe({
        next: c => {
          this.customer = c;
          this.form.patchValue(c as any);
          this.loading = false;
          this.customerService.getSlipsheets(c).subscribe(s => this.slipsheets = s);
          this.customerService.getBills(c).subscribe(b => this.bills = b);
        },
        error: () => { this.loading = false; this.error = 'Kunde konnte nicht geladen werden.'; }
      });
    }
  }

  save() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving = true;
    const val = this.form.getRawValue();
    const customer = new Customer(val as any);
    const op = val.id ? this.customerService.update(customer) : this.customerService.create(customer);
    op.subscribe({
      next: () => { this.saving = false; this.router.navigate(['/customers']); },
      error: err => { this.saving = false; this.error = err.message || 'Fehler beim Speichern'; }
    });
  }

  back() { this.router.navigate(['/customers']); }

  slipsheetBadge(state: string): string {
    if (state === 'open' || state === 'changed') return 'sims-badge sims-badge-warning';
    if (state === 'closed' || state === 'payed') return 'sims-badge sims-badge-success';
    return 'sims-badge sims-badge-neutral';
  }

  billBadge(state: string): string {
    if (state === 'open') return 'sims-badge sims-badge-warning';
    if (state === 'closed' || state === 'payed') return 'sims-badge sims-badge-success';
    return 'sims-badge sims-badge-neutral';
  }
}
