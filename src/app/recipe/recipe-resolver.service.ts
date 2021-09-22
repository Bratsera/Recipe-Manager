import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { Recipe } from './recipe.model';
import * as RecipeActions from './store/recipe.actions';
import { Store } from '@ngrx/store';
import * as fromApp from '../store/app.reducer';
import { Actions, ofType } from '@ngrx/effects';
import { map, switchMap, take } from 'rxjs/operators';
import { of } from 'rxjs';

/**
 * This resolver gets executed every time before a /recipe route is loaded.
 * It checks if there were already any recipes fetched. If not, it fetches the recipes from the database.
 */
@Injectable({ providedIn: 'root' })
export class RecipeResolverService implements Resolve<Recipe[]>{

    constructor(
        private store: Store<fromApp.AppState>,
        private actions$: Actions
    ) { }


    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        return this.store.select('recipes')
            .pipe(take(1),
                map(recipesState => recipesState.recipes),
                switchMap(recipes => {
                    // If there are no recipies in the current state
                    if (recipes.length === 0) {
                        // Dispatch the action FetchRecipes which sends a http-request to fetch the recipes from the database
                        this.store.dispatch(new RecipeActions.FetchRecipes());
                        // Returns the action SetRecipes to update the current recipes-state
                        return this.actions$.pipe(ofType(RecipeActions.SET_RECIPES), take(1));
                    } else {
                        // Return the existing recipes of the current state
                        return of(recipes);
                    }
                })
            );
    }
}
