import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { User } from '../models';

@Injectable({
    providedIn: 'root'
})

@Injectable({ providedIn: 'root' })
export class AuthenticationService {
    private currentUserSubject: BehaviorSubject<User>;
    public currentUser: Observable<User>;

    constructor(private http: HttpClient) {
        this.currentUserSubject = new BehaviorSubject<User>(JSON.parse(localStorage.getItem('currentUser')));
        this.currentUser = this.currentUserSubject.asObservable();
    }

    public get currentUserValue(): User {
        return this.currentUserSubject.value;
    }

    login(login, password) {
        return this.http.post<any>('users/login', { login, password })
            .pipe(map(user => {
                // store user details and jwt token in local storage to keep user logged in between page refreshes
                if (user.success === true) {
                    localStorage.setItem('currentUser', JSON.stringify(user.user));
                }
                this.currentUserSubject.next(user.user);
                return user;
            }));
    }

    logout() {
        // remove user from local storage and set current user to null
        localStorage.removeItem('currentUser');
        this.currentUserSubject.next(null);
    }


    refresh() {
        return this.http.get<any>('users/me/refresh')
            .pipe(map(user => {
                // store user details and jwt token in local storage to keep user logged in between page refreshes
                if (user.success === true) {
                    localStorage.setItem('currentUser', JSON.stringify(user.user));
                }
                this.currentUserSubject.next(user.user);
                return user;
            }));
    }

    hasPermission() {
            return true;
    }
}
