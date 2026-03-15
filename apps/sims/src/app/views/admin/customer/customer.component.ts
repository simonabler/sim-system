import { Component, OnInit } from '@angular/core';
import { Customer } from '../../../models';
import { Subject, Observable, merge } from 'rxjs';
import { FormGroup, FormControl } from '@angular/forms';
import { CustomerService } from '../../../services/customer.service';
import { debounceTime, map } from 'rxjs/operators';

@Component({
  selector: 'app-customer',
  templateUrl: './customer.component.html',
  styleUrls: ['./customer.component.css']
})
export class CustomerComponent implements OnInit {

  SearchForm: FormGroup;
  Customers$: Observable<Customer[]>;
  submitted;

  private reloadFilterSubject: Subject<Customer[]> = new Subject<Customer[]>();
  private customers: Customer[];

  get f() { return this.SearchForm.controls; }


  constructor(
    private customerService: CustomerService
  ) {



    this.SearchForm = new FormGroup({
      search: new FormControl(
        '', [])
    });

    const searchChange = this.SearchForm.get('search').valueChanges.pipe(
      debounceTime(250),
      map(o => this.findName(this.customers, o)),
    );

    const reloadFilter = this.reloadFilterSubject.asObservable().pipe(
      map(o => this.findName(o, this.SearchForm.get('search').value)),
    );

    this.Customers$ = merge(searchChange,  reloadFilter);

  }

  ngOnInit(): void {
    this.customerService.getAll().subscribe(data => {
      this.customers = data;
      this.reloadFilterSubject.next(data);
    });
  }


  findName(array: Customer[], data: string) {
    return array
      ?.filter((value: Customer) => value.companyName.toLocaleLowerCase().lastIndexOf(data, 0) === 0 ||
        value.firstName.toLocaleLowerCase().lastIndexOf(data, 0) === 0 ||
        value.lastName.toLocaleLowerCase().lastIndexOf(data, 0) === 0);
  }

}
