import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { AppComponent } from './app.component';
import { HeaderComponentComponent } from './header-component/header-component.component';
import { AppRoutingModule } from './app-routing.module';
import { AuthentificationInterceptorService } from './authentification/authentification-interceptor.service';
import { SharedModule } from './shared/shared.module';
import { StoreModule } from '@ngrx/store';
import * as fromApp from './store/app.reducer';
import { EffectsModule } from '@ngrx/effects';
import { AuthentificationEffects } from './authentification/store/authentication.effects';
import { RecipesEffects } from './recipe/store/recipe.effects';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { ShoppingListEffects } from './shopping-list/store/shopping-list.effects';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatAutocompleteModule } from '@angular/material/autocomplete';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponentComponent,
  ],
  imports: [
    BrowserModule.withServerTransition({ appId: 'serverApp' }),
    FormsModule,
    AppRoutingModule,
    StoreModule.forRoot(fromApp.appReducer),
    EffectsModule.forRoot([AuthentificationEffects, RecipesEffects, ShoppingListEffects]),
    HttpClientModule,
    SharedModule,
    BrowserAnimationsModule,
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: environment.production,
      registrationStrategy: 'registerImmediately'
    }),
    FontAwesomeModule,
    MatToolbarModule,
    MatButtonModule,
    MatAutocompleteModule
  ],
  providers: [{ provide: HTTP_INTERCEPTORS, useClass: AuthentificationInterceptorService, multi: true }],
  bootstrap: [AppComponent]
})
export class AppModule { }
