import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Bill, Slipsheet } from '../models/bill.model';

@Injectable({ providedIn: 'root' })
export class BillService {
  constructor(private http: HttpClient) {}

  getById(id: number): Observable<Bill> {
    return this.http.get<any>(`bills/${id}`).pipe(
      map(o => {
        if (o.success) return new Bill(o.data);
        throw new Error(o.message);
      })
    );
  }

  getAll(): Observable<Bill[]> {
    return this.http.get<any>('bills').pipe(
      map(o => o.success ? o.data.map((b: any) => new Bill(b)) : [])
    );
  }

  getByState(state: string): Observable<Bill[]> {
    const params = new HttpParams().set('state', state);
    return this.http.get<any>('bills', { params }).pipe(
      map(o => o.success ? o.data.map((b: any) => new Bill(b)) : [])
    );
  }

  generate(slipsheetIds: number[]): Observable<Bill> {
    return this.http.post<any>('bills/generate', slipsheetIds).pipe(
      map(o => {
        if (o.success) return new Bill(o.data);
        throw new Error(o.message);
      })
    );
  }

  recreate(bill: Bill): Observable<Bill> {
    return this.http.post<any>(`bills/${bill.id}`, bill).pipe(
      map(o => {
        if (o.success) return new Bill(o.data);
        throw new Error(o.message);
      })
    );
  }

  update(bill: Partial<Bill>): Observable<Bill> {
    return this.http.put<any>(`bills/${bill.id}`, bill).pipe(
      map(o => {
        if (o.success) return new Bill(o.data);
        throw new Error(o.message);
      })
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<any>(`bills/${id}`).pipe(
      map(o => {
        if (o.success) return;
        throw new Error(o.message);
      })
    );
  }

  // GET /bills/:id/pdf – read-only, does NOT regenerate
  getPdf(id: number): Observable<Blob> {
    return this.http.get(`bills/${id}/pdf`, { responseType: 'blob' });
  }
}
