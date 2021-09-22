import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthentificationGuard } from '../authentification/authentication.guard';
import { ShoppingListResolverService } from './shopping-list-resolver.service';
import { ShoppingListComponent } from './shopping-list.component';

const router: Routes = [
    {
        path: '',
        component: ShoppingListComponent,
        canActivate: [AuthentificationGuard],
        resolve: [ShoppingListResolverService]
    }
];

@NgModule({
    imports: [RouterModule.forChild(router)],
    exports: [RouterModule]
})
export class ShoppingListRoutingModule { }
