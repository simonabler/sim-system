import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideToastr } from 'ngx-toastr';
import { routes } from './app.routes';
import { backendInterceptor } from './helpers/backend.interceptor';
import { errorInterceptor } from './helpers/error.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptors([backendInterceptor, errorInterceptor])),
    provideAnimations(),
    provideToastr({ positionClass: 'toast-top-right', timeOut: 3000 }),
  ],
};
