import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthenticationService } from '../services/authentication.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthenticationService);
  const router = inject(Router);

  if (authService.currentUserValue != null) {
    return true;
  }
  router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
  return false;
};
