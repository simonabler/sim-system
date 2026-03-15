import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';

import { AuthenticationService } from '../services';
import { environment } from '../../environments/environment';

import { JwtHelperService } from '@auth0/angular-jwt';
@Injectable()
export class BackendInterceptor implements HttpInterceptor {

    isRefreshing: boolean = false;

    constructor(
        private authenticationService: AuthenticationService
    ) { }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        // add authorization header with jwt token if available
        const currentUser = this.authenticationService.currentUserValue;
        if (currentUser && currentUser.token) {
            request = request.clone({
                setHeaders: {
                    Authorization: `${currentUser.token}`
                }
            });

            const helper = new JwtHelperService();
            const expirationDate = helper.getTokenExpirationDate(currentUser.token);
            const timeValid = new Date();
            timeValid.setHours(timeValid.getHours() + 12);

            if (expirationDate.getTime() < timeValid.getTime() && !this.isRefreshing) {
            }

        }
        let apiReq;
        if (location.protocol !== 'https:') {
            apiReq = request.clone({ url: `${environment.apiUrlHTTP}/${request.url}` });
        } else {
            apiReq = request.clone({ url: `${environment.apiUrlHTTPS}/${request.url}` });
        }
        return next.handle(apiReq);
    }
}
