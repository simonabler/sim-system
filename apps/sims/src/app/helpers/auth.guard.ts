import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, ActivatedRoute } from '@angular/router';
import { AuthenticationService } from '../services';


@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private authenticationService: AuthenticationService
    ) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        const currentUser = this.authenticationService.currentUserValue;
        if (this.hasRequiredPermission()) {
            // authorised so return true
            return true;
        }

        if (this.route.snapshot.queryParams['returnUrl']) {
            // console.log('Loop 2');
            this.router.navigate(['/']);

        } else {
            // not logged in so redirect to login page with the return url
            // console.log('Loop 1', state);
            this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
        }

        return false;
    }

    protected hasRequiredPermission(): boolean {
        // If user’s permissions already retrieved from the API
        if (this.authenticationService.currentUserValue != null) {
           return true;
        } else {
            // Otherwise, must request permissions from the API first
            return false;
        }
    }
}
