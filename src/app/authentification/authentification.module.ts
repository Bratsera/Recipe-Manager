import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '../shared/shared.module';
import { AuthentificationRoutes } from './authentification-routes.module';
import { AuthentificationComponent } from './authentification.component';


@NgModule({
    declarations: [
        AuthentificationComponent
    ],
    imports: [
        AuthentificationRoutes,
        SharedModule,
        FormsModule
    ],
    bootstrap: [AuthentificationComponent]
})
export class AuthentificationModule { }
