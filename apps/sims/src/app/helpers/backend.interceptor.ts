import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../environments/environment';

export const backendInterceptor: HttpInterceptorFn = (req, next) => {
  // Prefix relative URLs with the API base URL
  const isAbsolute = req.url.startsWith('http');
  const apiReq = isAbsolute
    ? req
    : req.clone({ url: `${environment.apiUrl}/${req.url}` });
  return next(apiReq);
};
