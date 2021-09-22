import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import * as fromApp from '../store/app.reducer';
import * as AuthActions from './store/authentification.actions';

@Injectable({ providedIn: 'root' })
export class AuthentificationGuard implements CanActivate {

    constructor(private router: Router, private store: Store<fromApp.AppState>) { }
    /**
     * Prevents visiting the pages if the user is not logged in by redirecting to the /auth page
     */
    canActivate(
        route: ActivatedRouteSnapshot,
        router: RouterStateSnapshot
    ): boolean | Promise<boolean> | Observable<boolean | UrlTree> {
        // Check if there´s an active logged session. If yes, login automatically
        this.store.dispatch(new AuthActions.AutoLogin());

        return this.store.select('authentification').pipe(
            take(1),
            map(authstate => {
                return authstate.user;
            }),
            map(user => {
                const isAuth = !!user;
                if (isAuth) {
                    return true;
                }
                // If no user is logged in, redirect to the /auth page
                return this.router.createUrlTree(['/auth']);
            }));
    }
}
