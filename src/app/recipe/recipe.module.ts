import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../shared/shared.module';
import { RecipeDetailComponent } from './recipe-detail/recipe-detail.component';
import { RecipeEditComponent } from './recipe-edit/recipe-edit.component';
import { RecipeListComponent } from './recipe-list/recipe-list.component';
import { RecipeStartComponent } from './recipe-start/recipe-start.component';
import { RecipeComponent } from './recipe.component';
import { RecipesRoutingModule } from './recipes-routing.module';
import { CarouselModule } from 'ngx-bootstrap/carousel';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
    declarations: [
        RecipeComponent,
        RecipeDetailComponent,
        RecipeListComponent,
        RecipeEditComponent,
        RecipeStartComponent
    ],
    imports: [
        SharedModule,
        RouterModule,
        ReactiveFormsModule,
        RecipesRoutingModule,
        CarouselModule.forRoot(),
        MatCheckboxModule,
        FontAwesomeModule,
        MatButtonModule,
    ],
    bootstrap: [RecipeComponent]
})
export class RecipeModule { }
