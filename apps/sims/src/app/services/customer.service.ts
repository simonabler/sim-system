import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Customer } from '../models/customer.model';
import { map } from 'rxjs/operators';
import { Observable, Subject, throwError } from 'rxjs';
import { Shoppingcart, Discount } from '../models';
import { Bill } from '../models/bill.model';
import { BillWithShop } from '../models/billWithShop';

@Injectable({
  providedIn: 'root'
})
export class CustomerService {


  private currentCustomerSubject: Subject<Customer> = new Subject<Customer>();
  public currentCustomer: Customer = undefined;

  constructor(
    private http: HttpClient) {
  }


  selectCustomer(customer: Customer) {
    this.currentCustomer = customer;
    this.currentCustomerSubject.next(this.currentCustomer);
  }

  getCustomer(): Observable<Customer> {
    return this.currentCustomerSubject.asObservable();
  }


  getAll(): Observable<Customer[]> {
    return this.http.get<Customer[]>('customers')
      .pipe(
        map((o: any) => {
          if (o.success) {
            return o.data.map(x => new Customer(x));
          } else {
            return new Array<Customer>();
          }
        })
      );
  }

  getById(id): Observable<Customer> {
    return this.http.get<Customer>(`customers/${id}`)
      .pipe(
        map((o: any) => {
          if (o.success) {
            return new Customer(o.data);
          } else {
            throwError(o.message || 'Fehler beim lades der Kundens');
          }
        })
      );
  }


  getShoppingcarts(customer: Customer): Observable<Shoppingcart[]> {
    return this.http.get<Shoppingcart[]>(`customers/${customer.id}/slipsheets`)
      .pipe(
        map((o: any) => {
          if (o.success) {
            return o.data.map(carts => new Shoppingcart(carts));
          } else {
            throwError(o.message || 'Fehler beim lades der Kundens');
          }
        })
      );
  }

  getBills(customer: Customer): Observable<BillWithShop[]> {
    return this.http.get<BillWithShop[]>(`customers/${customer.id}/bills`)
      .pipe(
        map((o: any) => {
          if (o.success) {
            return o.data.map(carts => new BillWithShop(carts));
          } else {
            throwError(o.message || 'Fehler beim lades der Kundens');
          }
        })
      );
  }

  update(customer: Customer) {
    return this.http.patch(`customers/${customer.id}`, customer).pipe(
      map((o: any) => {
        if (o.success) {
          return o.data;
        } else {
          return throwError(o.message || 'Fehler beim Anlegen');
        }
      })
    );
  }


  updateOrCreateDiscount(customer: Customer, discount: Discount) {
    return this.http.put(`customers/${customer.id}/discounts`, discount).pipe(
      map((o: any) => {
        if (o.success) {
          return o.data;
        } else {
          return throwError(o.message || 'Fehler beim Anlegen');
        }
      })
    );
  }

  deleteDiscount(customer: Customer, discount: Discount) {
    return this.http.delete(`customers/${customer.id}/discounts/${discount.id}`);
  }


  create(customer: Customer) {
    return this.http.post('customers/', customer);
  }

  delete(customer: Customer): Observable<any> {
    return this.http.delete<any>(`customers/${customer.id}`)
      .pipe(
        map((o: any) => {
          if (o.success) {
            return o.success;
          } else {
            return throwError(o.message || 'Fehler beim Löschen');
          }
        })
      );
  }
}
