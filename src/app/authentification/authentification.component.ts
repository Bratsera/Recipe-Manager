
import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Subscription } from 'rxjs';
import * as AuthActions from './store/authentification.actions';
import * as fromApp from '../store/app.reducer';
import { Store } from '@ngrx/store';

@Component({
  selector: 'app-authentification',
  templateUrl: './authentification.component.html',
  styleUrls: ['./authentification.component.scss']
})
export class AuthentificationComponent implements OnInit, OnDestroy {

  loginMode = true;
  isLoading = false;
  errorMessage: string = null;
  storeSub: Subscription;

  constructor(private store: Store<fromApp.AppState>) { }

  ngOnInit(): void {
    // subscribe to the authentificationState
    this.storeSub = this.store.select('authentification').subscribe(authstate => {
      // Show the loadingSpinner in the template if the Auth-http-request is not finished
      this.isLoading = authstate.isLoading;
      // show the errormessage in the template if there is one
      this.errorMessage = authstate.authError;
    });
  }

  onSubmit(ngForm: NgForm, isLoginMode: boolean): void {
    this.loginMode = isLoginMode;
    const email = ngForm.value.email;
    const password = ngForm.value.password;

    if (this.loginMode) {
      // Start login action and send an http request to the backend
      this.store.dispatch(new AuthActions.LoginStart({ email, password }));
    } else {
      // Start signup action and send an http request to the backend
      this.store.dispatch(new AuthActions.SignupStart({ email, password }));
    }
    ngForm.reset();
  }
  // Switch from login to signup mode in the template
  onSwitchMode(): void {
    this.loginMode = !this.loginMode;
  }
  ngOnDestroy(): void {
    if (this.storeSub) this.storeSub.unsubscribe();
  }
}
