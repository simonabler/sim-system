import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Observable, Subject, merge } from 'rxjs';
import { debounceTime, map } from 'rxjs/operators';
import { Customer } from '../../../models';
import { CustomerService } from '../../../services/customer.service';

@Component({
  selector: 'app-customer',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './customer.component.html',
  styleUrls: ['./customer.component.css'],
})
export class CustomerComponent implements OnInit {
  SearchForm = new FormGroup({ search: new FormControl('') });
  Customers$!: Observable<Customer[]>;
  private reloadSubject = new Subject<Customer[]>();
  private customers: Customer[] = [];
  submitted = false;

  get f() { return this.SearchForm.controls; }

  constructor(private customerService: CustomerService) {
    const searchChange = this.SearchForm.get('search')!.valueChanges.pipe(
      debounceTime(250), map(o => this.findName(this.customers, o ?? '')),
    );
    const reload = this.reloadSubject.pipe(map(o => this.findName(o, this.SearchForm.get('search')!.value ?? '')));
    this.Customers$ = merge(searchChange, reload);
  }

  ngOnInit() {
    this.customerService.getAll().subscribe(data => {
      this.customers = data;
      this.reloadSubject.next(data);
    });
  }

  findName(arr: Customer[], term: string): Customer[] {
    const t = term.toLocaleLowerCase();
    return arr?.filter(c =>
      c.companyName?.toLocaleLowerCase().startsWith(t) ||
      c.firstName?.toLocaleLowerCase().startsWith(t) ||
      c.lastName?.toLocaleLowerCase().startsWith(t),
    ) ?? [];
  }
}
