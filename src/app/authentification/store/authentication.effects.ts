import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { AuthentificationService } from '../authentification.service';
import { User } from '../user.model';
import * as AuthActions from './authentification.actions';


export interface AuthResponseData {
    idToken: string;
    email: string;
    expiresIn: string;
    localId: string;
}
/**
 * Creates an Object of type User with the params passed.
 * Stores the userData in the browser localStorage for autoLogin
 * and then passes the params to the Login-Action from AuthActions.
 * @param expiresIn The expirationtime of the server-token in milliseconds
 * @param email The email-address to login
 * @param userId
 * @param token
 * @returns Returns a Login-Action from AuthActions
 */
const handleAuthentification = (
    expiresIn: number,
    email: string,
    userId: string,
    token: string) => {
    const expirationDate = new Date(new Date().getTime() + +expiresIn * 1000);
    const user = new User(email, userId, token, expirationDate);

    localStorage.setItem('userData', JSON.stringify(user));

    return new AuthActions.Login({
        userId,
        email,
        token,
        expirationDate,
        redirect: true
    });
};

/**
 * Handles and returns the right error-message if the http-request fails
 * @returns Returns a Login-fail action with the error-message which gets displaed in the template
 */
const handleError = (errorRes) => {
    let errorMessage = 'An unknown error occurred!';
    if (!errorRes.error || !errorRes.error.error) {
        return of(new AuthActions.LoginFail(errorMessage));
    }
    switch (errorRes.error.error.message) {
        case 'EMAIL_EXISTS':
            errorMessage = 'This Email already exists.';
            break;
        case 'EMAIL_NOT_FOUND':
            errorMessage = 'There is no user record corresponding to this identifier. The user may have been deleted.';
            break;
        case 'INVALID_PASSWORD':
            errorMessage = 'The password is invalid';
            break;
        case 'TOO_MANY_ATTEMPTS_TRY_LATER':
            errorMessage = 'We have blocked all requests from this device due to unusual activity. Try again later.';
            break;
    }
    return of(new AuthActions.LoginFail(errorMessage));
};

@Injectable()
export class AuthentificationEffects {

    /**
     * Sends a http-post-request to the backend whenever a signup-action is triggered to handle the authentification
     */
    authSignup = createEffect(() => {
        return this.actions$.pipe(
            ofType(AuthActions.SIGNUP_START), switchMap((authData: AuthActions.SignupStart) => {

                return this.http.post<AuthResponseData>(

                    'https://identitytoolkit.googleapis.com/v1/accounts:signUp?key='
                    + environment.firebaseApiKey,
                    {
                        email: authData.payload.email,
                        password: authData.payload.password,
                        returnSecureToken: true
                    }).pipe(
                        tap(resData => {
                            // Transform the token expiration time from milliseconds to seconds
                            this.authService.setLogoutTimer(+resData.expiresIn * 1000);
                        }),
                        map(resData => {
                            return handleAuthentification(
                                +resData.expiresIn,
                                resData.email,
                                resData.localId,
                                resData.idToken
                            );
                        })
                        ,
                        catchError(errorRes => {
                            return handleError(errorRes);
                        })
                    );
            }

            ));
    });

    /**
     * Sends a http-post-request to the backend whenever a login-action is triggered to handle the authentification
     */
    authLogin = createEffect(() => {
        return this.actions$.pipe(
            ofType(AuthActions.LOGIN_START), switchMap((authData: AuthActions.LoginStart) => {
                return this.http.post<AuthResponseData>(
                    'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=' + environment.firebaseApiKey, {
                    email: authData.payload.email,
                    password: authData.payload.password,
                    returnSecureToken: true
                }).pipe(
                    tap(resData => {
                        // Transform the token expiration time from milliseconds to seconds
                        this.authService.setLogoutTimer(+resData.expiresIn * 1000);
                    }),
                    map(resData => {
                        return handleAuthentification(
                            +resData.expiresIn,
                            resData.email,
                            resData.localId,
                            resData.idToken
                        );
                    }),
                    catchError(errorRes => {
                        return handleError(errorRes);
                    })
                );
            })
        );
    });

    /**
     * Checks if there´s already a user logged in on page reload. If there´s userdata in the localstorage,
     * the session expiration time is updated and the user gets logged in automatically.
     */
    authAutoLogin = createEffect(() => {
        // Get existing userdata from localStorage
        return this.actions$.pipe(ofType(AuthActions.AUTO_LOGIN), map(() => {
            const userData: {
                email: string;
                id: string;
                _token: string;
                _tokenExpirationDate: string;
            } = JSON.parse(localStorage.getItem('userData'));
            // If no data available, do nothing
            if (!userData) return { type: 'DUMMY' };

            const loadedUser = new User(
                userData.email,
                userData.id,
                userData._token,
                new Date(userData._tokenExpirationDate)
            );
            if (loadedUser.token) {
                // Update the session expiration timer
                const expirationDuration = new Date(userData._tokenExpirationDate).getTime() - new Date().getTime();
                this.authService.setLogoutTimer(expirationDuration);
                // Login the user
                return new AuthActions.Login({
                    email: loadedUser.email,
                    userId: loadedUser.id,
                    token: loadedUser.token,
                    expirationDate: new Date(userData._tokenExpirationDate),
                    redirect: false
                });
            }
            return { type: 'DUMMY' };
        }));
    });

    /**
     * Effect for redirecting the user to the /recipes page after successful login/signup
     */
    authRedirect = createEffect(() => {
        return this.actions$.pipe(ofType(AuthActions.LOGIN), tap((authAction: AuthActions.Login) => {
            if (authAction.payload.redirect) this.router.navigate(['/recipes']);
        }));
    }, { dispatch: false });

    /**
     * Removes the userdata from the localStorage and redirects to the /auth page on logout
     */
    authLogout = createEffect(() => {
        return this.actions$.pipe(ofType(AuthActions.LOGOUT), tap(() => {
            this.authService.clearLogoutTimer();
            localStorage.removeItem('userData');
            this.router.navigate(['/auth']);
        }));
    }, { dispatch: false });
    constructor(
        private actions$: Actions,
        private http: HttpClient,
        private router: Router,
        private authService: AuthentificationService
    ) { }
}
