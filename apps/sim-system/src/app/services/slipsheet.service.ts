import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { Slipsheet, Order } from '../models/bill.model';

@Injectable({ providedIn: 'root' })
export class SlipsheetService {
  private currentSlipsheetSubject = new BehaviorSubject<Slipsheet | undefined>(undefined);

  constructor(private http: HttpClient) {}

  getCurrentSlipsheet(): Observable<Slipsheet | undefined> {
    return this.currentSlipsheetSubject.asObservable();
  }

  getAll(): Observable<Slipsheet[]> {
    return this.http.get<any>('slipsheets').pipe(
      map(o => o.success ? o.data.map((s: any) => new Slipsheet(s)) : [])
    );
  }

  getByState(state: string): Observable<Slipsheet[]> {
    const params = new HttpParams().set('state', state);
    return this.http.get<any>('slipsheets', { params }).pipe(
      map(o => o.success ? o.data.map((s: any) => new Slipsheet(s)) : [])
    );
  }

  getByCustomer(customerId: number): Observable<Slipsheet[]> {
    const params = new HttpParams().set('customerId', String(customerId));
    return this.http.get<any>('slipsheets', { params }).pipe(
      map(o => o.success ? o.data.map((s: any) => new Slipsheet(s)) : [])
    );
  }

  getById(id: number): Observable<Slipsheet> {
    return this.http.get<any>(`slipsheets/${id}`).pipe(
      map(o => {
        if (o.success) return new Slipsheet(o.data);
        throw new Error(o.message || 'Fehler beim Laden');
      })
    );
  }

  /** POST /slipsheets — GetOrCreate: findet offenen LS für Kunden oder erstellt neuen, fügt direkt erste Position hinzu */
  getOrCreate(data: { article: any; amount: number; customer: any }): Observable<Slipsheet> {
    return this.http.post<any>('slipsheets', data).pipe(
      map(o => {
        if (o.success) {
          const slip = new Slipsheet(o.data);
          this.currentSlipsheetSubject.next(slip);
          return slip;
        }
        throw new Error(o.message);
      })
    );
  }

  /** @deprecated use getOrCreate */
  create(data: { article: any; amount: number; customer: any }): Observable<Slipsheet> {
    return this.getOrCreate(data);
  }

  addOrder(slipsheet: Slipsheet, order: Order): Observable<Slipsheet> {
    return this.http.post<any>(`slipsheets/${slipsheet.id}`, order).pipe(
      map(o => {
        if (o.success) return new Slipsheet(o.data);
        throw new Error(o.message);
      })
    );
  }

  updateOrder(slipsheet: Slipsheet, order: Order): Observable<Slipsheet> {
    return this.http.put<any>(`order-entries/${order.id}`, order).pipe(
      map(o => {
        if (o.success) {
          const newEntries = order.amount !== 0
            ? slipsheet.orderEntries.map(m => m.id === order.id ? new Order(o.data) : m)
            : slipsheet.orderEntries.filter(m => m.id !== order.id);
          return new Slipsheet({
            ...slipsheet,
            orderEntries: newEntries,
            state: o.data?.slipsheet?.state || 'changed',
          });
        }
        throw new Error(o.message);
      })
    );
  }

  addAnnotation(slipsheet: Slipsheet, text: string): Observable<Slipsheet> {
    return this.http.post<any>(`slipsheets/${slipsheet.id}/annotation`, { text }).pipe(
      switchMap(() => this.getById(slipsheet.id))
    );
  }

  print(id: number): Observable<boolean> {
    return this.http.post<any>(`slipsheets/${id}/print`, {}).pipe(
      map(o => {
        if (o.success) return true;
        throw new Error(o.message);
      })
    );
  }

  getPdf(id: number): Observable<Blob> {
    return this.http.get(`slipsheets/${id}/pdf`, { responseType: 'blob' });
  }
}
