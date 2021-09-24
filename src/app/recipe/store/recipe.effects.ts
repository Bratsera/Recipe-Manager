import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { map, switchMap, withLatestFrom } from 'rxjs/operators';
import { Recipe } from '../recipe.model';
import * as RecipeActions from './recipe.actions';
import * as fromApp from '../../store/app.reducer';


@Injectable()
export class RecipesEffects {
    /**
     * Send an http-request to select the Recipes from the database whenever the action Fetch_Recipes is triggered.
     */
    fetchRecipes = createEffect(() => {
        return this.actions$.pipe(
            ofType(RecipeActions.FETCH_RECIPES),
            switchMap(() => {
                // Get the recipes from the database
                return this.http.get<Recipe[]>(
                    `https://recipe-manager-seraphim-default-rtdb.europe-west1.firebasedatabase.app/Recipes/db.json`
                );
            }),
            map(recipes => {
                if (recipes == null) {
                    return [];
                }
                return recipes.map(recipe => {
                    // If a recipe has no ingredients, pass an empty array for the property ingredients instead
                    return { ...recipe, ingredients: recipe.ingredients ? recipe.ingredients : [] };
                });
            }),
            map((recipes: Recipe[]) => {
                // Passes the recipes to the action SetRecipes to update the current recipes-state
                return new RecipeActions.SetRecipes(recipes);
            })
        );
    });

    /**
     * Stores the recipes of the current recipes-state in the database whenever the action StoreRecipes is triggered.
     */
    storeRecipes = createEffect(() => {
        return this.actions$.pipe(
            ofType(RecipeActions.STORE_RECIPES),
            withLatestFrom(this.store.select('recipes')),
            switchMap(([actionData, recipesState]) => {
                return this.http.put(
                    `https://recipe-manager-seraphim-default-rtdb.europe-west1.firebasedatabase.app/Recipes/db.json`,
                    recipesState.recipes);
            }));
    }, { dispatch: false });

    constructor(
        private actions$: Actions,
        private http: HttpClient,
        private store: Store<fromApp.AppState>) { }
}
