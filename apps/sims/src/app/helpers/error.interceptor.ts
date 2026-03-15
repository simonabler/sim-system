import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthenticationService } from '../services/authentication.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthenticationService);
  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      let error = '';
      if (err.error instanceof ErrorEvent) {
        error = 'Backend nicht vorhanden';
      } else if (err.status === 401) {
        authService.logout();
        location.reload();
      } else if (err.status === 0) {
        error = 'Backend nicht vorhanden';
      } else {
        error = err.error?.message || err.statusText;
      }
      return throwError(() => error);
    }),
  );
};
