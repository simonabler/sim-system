import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { User } from '../models/bill.model';

@Injectable({ providedIn: 'root' })
export class AuthenticationService {
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser: Observable<User | null>;

  constructor(private http: HttpClient) {
    const stored = localStorage.getItem('currentUser');
    this.currentUserSubject = new BehaviorSubject<User | null>(stored ? JSON.parse(stored) : null);
    this.currentUser = this.currentUserSubject.asObservable();
  }

  get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  login(login: string, password: string) {
    return this.http.post<any>('users/login', { login, password }).pipe(
      map(res => {
        if (res.success === true) {
          localStorage.setItem('currentUser', JSON.stringify(res.user));
          this.currentUserSubject.next(res.user);
        }
        return res;
      })
    );
  }

  logout() {
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }

  refresh() {
    return this.http.get<any>('users/me/refresh').pipe(
      map(res => {
        if (res.success === true) {
          localStorage.setItem('currentUser', JSON.stringify(res.user));
          this.currentUserSubject.next(res.user);
        }
        return res;
      })
    );
  }
}
