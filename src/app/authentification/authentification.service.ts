import { Injectable } from '@angular/core';
import * as fromApp from '../store/app.reducer';
import * as AuthActions from './store/authentification.actions';
import { Store } from '@ngrx/store';

export interface AuthResponseData {
    idToken: string;
    email: string;
    expiresIn: string;
    localId: string;
}
@Injectable({ providedIn: 'root' })
export class AuthentificationService {
    tokenExpirationTimer: any;
    constructor(private store: Store<fromApp.AppState>) { }
    // Clear the logout timer
    clearLogoutTimer(): void {
        if (this.tokenExpirationTimer) {
            clearTimeout(this.tokenExpirationTimer);
            this.tokenExpirationTimer = null;
        }
    }
    /**
     * Set a timer to logout the user when the session expires
     * @param expirationDuration The duration after the session shall expire
     */
    setLogoutTimer(expirationDuration: number): void {
        this.tokenExpirationTimer = setTimeout(() => {
            this.store.dispatch(new AuthActions.Logout());
        }, expirationDuration);
    }
}
