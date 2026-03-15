import { Injectable } from '@angular/core';
import { Bill } from '../models/bill.model';
import { HttpParams, HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Shoppingcart } from '../models';
import { BillWithShop } from '../models/billWithShop';

@Injectable({
  providedIn: 'root'
})
export class BillService {
 

  constructor(private http: HttpClient) { }

  get() {
    return this.http.get<BillWithShop[]>(`bills`)
      .pipe(
        map((o: any) => {
          if (o.success) {
            return o.data.map(bill => new BillWithShop(bill));
          } else {
            return new Array<BillWithShop>();
          }
        })
      );
  }


  getByState(state: string) {
    const params = new HttpParams()
      .set('state', state);

    return this.http.get<Bill[]>(`bills`, { params: params })
      .pipe(
        map((o: any) => {
          if (o.success) {
            return o.data.map(bill => new Bill(bill));
          } else {
            return new Array<Bill>();
          }
        })
      );
  }

  post(shoppingcarts: Shoppingcart[]) {


    return this.http.post<Bill[]>(`bills`,  shoppingcarts )
      .pipe(
        map((o: any) => {
          if (o.success) {
            return new Bill(o.data);
          } else {
            return new Bill();
          }
        })
      );
  }


  generate(carts: number[]) {
    return this.http.post<Bill[]>(`bills/generate`,  carts )
    .pipe(
      map((o: any) => {
        if (o.success) {
          return new Bill(o.data);
        } else {
          return new Bill();
        }
      })
    );  }

  recreate(bill: Bill) {
    return this.http.post(`bills/${bill.id}`,  bill )
      .pipe(
        map((o: any) => {
          if (o.success) {
            const cart = new BillWithShop(o.data);
            return cart;
          } else {
            return null;
          }
        })

      );
  }

  update(bill: Bill) {
    return this.http.put(`bills/${bill.id}`,  bill )
      .pipe(
        map((o: any) => {
          if (o.success) {
            const cart = new Bill(o.data);
            return cart;
          } else {
            return null;
          }
        })

      );
  }

}
