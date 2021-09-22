import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { map, switchMap, withLatestFrom } from 'rxjs/operators';
import { Ingredient } from 'src/app/shared/ingredient.model';
import * as fromApp from '../../store/app.reducer';
import * as ShoppingListActions from './shopping-list.actions';

@Injectable()
export class ShoppingListEffects {
    constructor(private action$: Actions, private http: HttpClient, private store: Store<fromApp.AppState>) { }
    authStateSub = new Subscription();
    /**
     * Send an http-request to select the shopping-list from the database whenever the action Fetch_Recipes is triggered.
     */
    fetchSL = createEffect(() => {
        return this.action$.pipe(
            ofType(ShoppingListActions.FETCH_SHOPPINGLIST),
            withLatestFrom(this.store.select('authentification')),
            switchMap((state) => {
                return this.http.get<Ingredient[]>(
                    `https://recipe-manager-seraphim-default-rtdb.europe-west1.firebasedatabase.app/${state[1].user.id}/ShoppingList/db.json`
                );
            }),
            map(ingredients => {
                // Passes the array of ingredients to the action SetIngredients to update the current ShoppingList-state
                return new ShoppingListActions.SetIngredients(ingredients ? ingredients : []);
            }),
        );
    });

    /**
     * Stores the ingredients of the current shopping-list-state to the database whenever the action StoreRecipes is triggered.
     */
    storeSL = createEffect(() => {
        
        return this.action$.pipe(
            ofType(
                ShoppingListActions.ADD_INGREDIENT,
                ShoppingListActions.ADD_INGREDIENTS,
                ShoppingListActions.UPDATE_INGREDIENT,
                ShoppingListActions.DELETE_INGREDIENTS
                ),
            withLatestFrom(this.store.select('shoppingList'),this.store.select('authentification')),
            switchMap((state) => {

                return this.http.put(
                    `https://recipe-manager-seraphim-default-rtdb.europe-west1.firebasedatabase.app/${state[2].user.id}/ShoppingList/db.json`,
                    state[1].ingredients  
                );
            })
        );
    }, { dispatch: false });
}
