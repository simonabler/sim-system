import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Customer, Discount } from '../models/customer.model';
import { Slipsheet, Bill } from '../models/bill.model';

@Injectable({ providedIn: 'root' })
export class CustomerService {
  private currentCustomerSubject = new BehaviorSubject<Customer | undefined>(undefined);

  get currentCustomer(): Customer | undefined {
    return this.currentCustomerSubject.value;
  }

  constructor(private http: HttpClient) {}

  selectCustomer(customer: Customer) {
    this.currentCustomerSubject.next(customer);
  }

  getCustomer(): Observable<Customer | undefined> {
    return this.currentCustomerSubject.asObservable();
  }

  getAll(): Observable<Customer[]> {
    return this.http.get<any>('customers').pipe(
      map(o => o.success ? o.data.map((x: any) => new Customer(x)) : [])
    );
  }

  getById(id: number): Observable<Customer> {
    return this.http.get<any>(`customers/${id}`).pipe(
      map(o => {
        if (o.success) return new Customer(o.data);
        throw new Error(o.message || 'Fehler beim Laden');
      })
    );
  }

  getSlipsheets(customer: Customer): Observable<Slipsheet[]> {
    return this.http.get<any>(`customers/${customer.id}/slipsheets`).pipe(
      map(o => o.success ? o.data.map((s: any) => new Slipsheet(s)) : [])
    );
  }

  getBills(customer: Customer): Observable<Bill[]> {
    return this.http.get<any>(`customers/${customer.id}/bills`).pipe(
      map(o => o.success ? o.data.map((b: any) => new Bill(b)) : [])
    );
  }

  create(customer: Partial<Customer>): Observable<any> {
    return this.http.post<any>('customers/', customer);
  }

  update(customer: Customer): Observable<any> {
    return this.http.patch<any>(`customers/${customer.id}`, customer).pipe(
      map(o => {
        if (o.success) return o.data;
        throw new Error(o.message || 'Fehler beim Speichern');
      })
    );
  }

  delete(customer: Customer): Observable<boolean> {
    return this.http.delete<any>(`customers/${customer.id}`).pipe(
      map(o => {
        if (o.success) return true;
        throw new Error(o.message || 'Fehler beim Löschen');
      })
    );
  }

  updateOrCreateDiscount(customer: Customer, discount: Discount): Observable<any> {
    return this.http.put<any>(`customers/${customer.id}/discounts`, discount).pipe(
      map(o => {
        if (o.success) return o.data;
        throw new Error(o.message || 'Fehler');
      })
    );
  }

  deleteDiscount(customer: Customer, discount: Discount): Observable<any> {
    return this.http.delete<any>(`customers/${customer.id}/discounts/${discount.id}`);
  }
}
