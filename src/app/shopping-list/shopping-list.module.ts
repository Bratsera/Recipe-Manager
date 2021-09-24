import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../shared/shared.module';
import { ShoppingListRoutingModule } from './shopping-list-routing.module';
import { ShoppingListComponent } from './shopping-list.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
    declarations: [
        ShoppingListComponent
    ],
    imports: [
        RouterModule,
        SharedModule,
        ReactiveFormsModule,
        ShoppingListRoutingModule,
        DragDropModule,
        MatTableModule,
        MatCheckboxModule,
        FontAwesomeModule,
        MatButtonModule
    ],
    bootstrap: [ShoppingListComponent]
})
export class ShoppingListModule { }
