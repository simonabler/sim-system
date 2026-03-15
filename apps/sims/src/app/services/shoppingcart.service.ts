import { Injectable } from '@angular/core';
import { Article, Shoppingcart, Customer, Order } from '../models';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Subject, Observable } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ShoppingcartService {


  private currentShoppingcartSubject = new Subject<Shoppingcart>();
  private currentShoppingcart = new Shoppingcart();

  constructor(
    private http: HttpClient) {
  }

  getShoppingcart(): Observable<Shoppingcart> {
    return this.currentShoppingcartSubject.asObservable();
  }

  loadShoppingcart(customer: Customer) {
    this.get(customer).subscribe(
      shoppingcartData => {

      },
      error => {
        console.error(error);
      });
  }

  get(customer: Customer) {
    const params = new HttpParams()
      .set('customerId', customer.id.toString());

    return this.http.get<Shoppingcart>(`slipsheets`, { params: params })
      .pipe(
        map((o: any) => {
          if (o.success) {
            const cart = this.parseShoppingcart(o.data[0]);
            return this.nextShoppingcart(cart);
          } else {
            return new Shoppingcart();
          }
        })
      );
  }

  getAll() {
    return this.http.get<Shoppingcart[]>(`slipsheets`)
      .pipe(
        map((o: any) => {
          if (o.success) {
            return o.data.map(c => new Shoppingcart(c));
          } else {
            return new Array<Shoppingcart>();
          }
        })
      );
  }

  getByState(state: string) {
    const params = new HttpParams()
      .set('state', state);

    return this.http.get<Shoppingcart[]>(`slipsheets`, { params: params })
      .pipe(
        map((o: any) => {
          if (o.success) {
            return o.data.map((s: Partial<Shoppingcart>) => new Shoppingcart(s));
          } else {
            return new Array<Shoppingcart>();
          }
        })
      );
  }



  getById(id) {

    return this.http.get<Shoppingcart>(`slipsheets/${id}`)
      .pipe(
        map((o: any) => {
          if (o.success) {
            const cart = this.parseShoppingcart(o.data);
            return cart;
          } else {
            return new Shoppingcart();
          }
        })
      );
  }

  print(id: any) {
    return this.http.post(`slipsheets/${id}/print`, {})
      .pipe(
        map((o: any) => {
          if (o.success) {
            return o.success;
          } else {
            throw new Error(o.message);
          }
        }),
      );
  }

  post(formData: any, article: Article) {
    const data = {
      article,
      amount: formData.amount,
      customer: formData.customer
    };

    return this.http.post(`slipsheets`, data)
      .pipe(
        map((o: any) => {
          if (o.success) {
            const cart = this.parseShoppingcart(o.data);
            return this.nextShoppingcart(cart);
          } else {
            return null;
          }
        }),
        tap((receivedData: Shoppingcart) => console.log(receivedData)),

      );
  }

  addOrder(shoppingcart: Shoppingcart, order: Order) {
    return this.http.post(`slipsheets/${shoppingcart.id}`, order)
      .pipe(
        map((o: any) => {
          if (o.success) {
            return this.parseShoppingcart(o.data);
          } else {
            return null;
          }
        })
      );
  }


  update(shoppingcart: Shoppingcart) {
    return this.http.put(`slipsheets/${shoppingcart.id}`, { shoppingcart })
      .pipe(
        map((o: any) => {
          if (o.success) {
            const cart = this.parseShoppingcart(o.data);
            return cart;
          } else {
            return null;
          }
        }),
        tap((receivedData: Shoppingcart) => console.log(receivedData)),

      );
  }

  updateOrder(shoppingcart: Shoppingcart, order: Order) {
    return this.http.put(`order-entries/${order.id}`, order)
      .pipe(
        map((o: any) => {
          if (o.success) {
            if (shoppingcart && order.amount !== 0) {
              shoppingcart.orderEntries = shoppingcart.orderEntries.map(m => m.id === order.id ? new Order(o.data) : m);
            } else if (shoppingcart && order.amount === 0) {
              shoppingcart.orderEntries = shoppingcart.orderEntries.filter(m => m.id !== order.id);
            }
            shoppingcart.state = o.data?.slipsheet.state || 'changed';

            return shoppingcart;
          } else {
            return null;
          }
        }),
        tap((receivedData: Shoppingcart) => console.log(receivedData)),

      );
  }

  addAnnotation(shoppingcart: Shoppingcart, text: string): Observable<Shoppingcart> {
    return this.http.post(`slipsheets/${shoppingcart.id}/annotation`, { text }).pipe(
      switchMap(() => this.getById(shoppingcart.id)),
      map((updatedCart: Shoppingcart) => this.nextShoppingcart(updatedCart)),
    );
  }

  /* getBill(shoppingcart: Shoppingcart) {
     return this.http.get(`shoppingcarts/${shoppingcart.id}/bill`)
       .pipe(
         map((o: any) => {
           if (o.success) {
             return o;
           } else {
             return null;
           }
         }),
         tap((receivedData: Shoppingcart) => console.log(receivedData)),
 
       );
   }
 */



  // getDeliverySlip(shoppingcart: Shoppingcart) {
  //   return this.http.get(`shoppingcarts/${shoppingcart.id}/deliverySlip`)
  //     .pipe(
  //       map((o: any) => {
  //         if (o.success) {
  //           return o;
  //         } else {
  //           return null;
  //         }
  //       }),
  //       tap((receivedData: Shoppingcart) => console.log(receivedData)),
  //     );
  // }

  private parseShoppingcart(data: any): Shoppingcart {
    const cart = new Shoppingcart(data);
    return cart;
  }

  private nextShoppingcart(cart: Shoppingcart): Shoppingcart {
    this.currentShoppingcart = cart;
    this.currentShoppingcartSubject.next(this.currentShoppingcart);
    return this.currentShoppingcart;
  }




}
