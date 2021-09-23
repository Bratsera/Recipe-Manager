
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
  // State for the loadingSpinner to show or hide in the template
  isLoading = false;
  // The message to display if an error occurs in the login process
  errorMessage: string = null;

  // Tracks the authentification state of the user
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
  /**
   * Takes the userdata and triggers to login or signup process
   * @param ngForm The template form
   * @param isLoginMode Determine if the user wants to log in (true) or create a new account (false)
   */
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

  ngOnDestroy(): void {
    if (this.storeSub) this.storeSub.unsubscribe();
  }
}
