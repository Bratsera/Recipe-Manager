import { HttpHandler, HttpInterceptor, HttpParams, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { exhaustMap, map, take } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import * as fromApp from '../store/app.reducer';

@Injectable()
export class AuthentificationInterceptorService implements HttpInterceptor {

  constructor(private store: Store<fromApp.AppState>) { }
  intercept(req: HttpRequest<any>, next: HttpHandler) {
    return this.store.select('authentification')
      .pipe(take(1),
        map(authstate => {
          return authstate.user;
        })
        , exhaustMap(user => {
          if (!user) return next.handle(req);
          const modifiedRequest = req.clone({
            params: new HttpParams().set('auth', user.token)
          });
          return next.handle(modifiedRequest);
        })
      );
  }
}
