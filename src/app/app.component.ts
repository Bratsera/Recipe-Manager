import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import * as fromApp from './store/app.reducer';
import * as AuthActions from './authentification/store/authentification.actions';
import { Store } from '@ngrx/store';
import { isPlatformBrowser } from '@angular/common';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  constructor(
    private store: Store<fromApp.AppState>,
    @Inject(PLATFORM_ID) private platformId) { }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.store.dispatch(new AuthActions.AutoLogin());
    }


  }

}
