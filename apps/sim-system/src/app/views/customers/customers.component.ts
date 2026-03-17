import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { debounceTime } from 'rxjs/operators';
import { CustomerService } from '../../services/customer.service';
import { Customer } from '../../models/customer.model';

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './customers.component.html',
  styleUrl: './customers.component.scss',
})
export class CustomersComponent implements OnInit {
  customers: Customer[] = [];
  filtered: Customer[] = [];
  loading = true;
  searchCtrl = new FormControl('');

  constructor(private customerService: CustomerService, private router: Router) {}

  ngOnInit() {
    this.customerService.getAll().subscribe(data => {
      this.customers = data;
      this.applyFilter();
      this.loading = false;
    });
    this.searchCtrl.valueChanges.pipe(debounceTime(200)).subscribe(() => this.applyFilter());
  }

  applyFilter() {
    const q = (this.searchCtrl.value || '').toLowerCase();
    this.filtered = this.customers.filter(c =>
      c.companyName?.toLowerCase().startsWith(q) ||
      c.firstName?.toLowerCase().startsWith(q) ||
      c.lastName?.toLowerCase().startsWith(q)
    );
  }

  goToCustomer(id: number) { this.router.navigate(['/customers', id]); }
  newCustomer() { this.router.navigate(['/customers', 'new']); }
}
