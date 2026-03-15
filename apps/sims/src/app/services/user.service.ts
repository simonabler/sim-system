import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { User } from '../models';
import { map } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private http: HttpClient) { }

  getAll() {
    return this.http.get<User[]>('users');
  }

  getMe() {
    return this.http.get<User[]>('users/me')
      .pipe(
        map((o: any) => {
          if (o.success === true) {
            const user = Object.assign(new User(), o.user);
            return user;
          } else {
            return null;
          }
        })
      );
  }

  create(user: User) {
    return this.http.post('users/', user).pipe(
      map((o: any) => {
        if (o.success === true) {
          return o;
        } else {
          if (o.message) {
            return throwError(o.message);
          }
          return throwError('Allgemeiner Fehler');
        }
      })
    );
  }

  delete(id: number) {
    return this.http.delete(`users/${id}`);
  }

  update(user: User) {
    const id = user.id;
    return this.http.put(`users/${id}`, user)
      .pipe(
        map((o: any) => {
          if (o.success === true) {
            return o.message;
          } else {
            if (o.message) {
              return throwError(o.message);
            }
            return throwError('Allgemeiner Fehler');
          }
        })
      );
  }

  resetPassword(user: User) {
    const id = user.id;
    return this.http.get(`users/reset/${id}`)
      .pipe(
        map((o: any) => {
          if (o.success === true) {
            return true;
          } else {
            if (o.message) {
              return throwError(o.message);
            }
            return throwError('Allgemeiner Fehler');
          }
        })
      );
  }

  updateMe(user: User) {
    const id = user.id;
    return this.http.put(`users/me`, user)
      .pipe(
        map((o: any) => {
          if (o.success === true) {
            return o.message;
          } else {
            if (o.message) {
              return throwError(o.message);
            }
            return throwError('Allgemeiner Fehler');
          }
        })
      );
  }
}
