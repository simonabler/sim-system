import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Customer } from '../../../models';
import { CustomerService } from '../../../services/customer.service';

@Component({
  selector: 'app-customer-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgSelectModule, RouterLink],
  templateUrl: './customer-edit.component.html',
  styleUrls: ['./customer-edit.component.css'],
})
export class CustomerEditComponent implements OnInit {
  customer = new Customer();
  submitted = false;
  isLoading = false;
  CustomerForm!: FormGroup;

  get f() { return this.CustomerForm.controls; }

  constructor(
    private customerService: CustomerService,
    private route: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService,
  ) {}

  ngOnInit() {
    this.CustomerForm = new FormGroup({
      id: new FormControl(null),
      email: new FormControl('', [Validators.email]),
      customerNumber: new FormControl(''),
      firstName: new FormControl(''),
      lastName: new FormControl(''),
      companyName: new FormControl(''),
      phoneCompany: new FormControl(''),
      phonePrivate: new FormControl(''),
      address: new FormControl(''),
      postcode: new FormControl(''),
      country: new FormControl(''),
      uid: new FormControl(''),
      customerDiscount: new FormControl(0),
    });

    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id && id !== 'new') {
        this.customerService.getById(+id).subscribe({
          next: data => { this.customer = data; this.CustomerForm.patchValue(data); },
        });
      }
    });
  }

  save() {
    this.submitted = true;
    if (this.CustomerForm.invalid) return;
    const customer = new Customer(this.CustomerForm.getRawValue());
    if (customer.id) {
      this.customerService.update(customer).subscribe({
        next: () => { this.toastr.success('Gespeichert'); this.router.navigate(['/admin/customer']); },
        error: e => this.toastr.error(e),
      });
    } else {
      this.customerService.create(customer).subscribe({
        next: () => { this.toastr.success('Erstellt'); this.router.navigate(['/admin/customer']); },
        error: e => this.toastr.error(e),
      });
    }
  }

  back() { this.router.navigate(['/admin/customer']); }
}
