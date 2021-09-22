import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { map, switchMap, take } from 'rxjs/operators';
import { Ingredient } from '../shared/ingredient.model';
import * as fromApp from '../store/app.reducer';
import * as ShoppingListActions from './store/shopping-list.actions';

/**
 * This resolver gets executed every time before a /shopping-list route is loaded.
 * It checks if there were already any ingredients fetched. If not, it fetches the recipes from the database.
 */
@Injectable({ providedIn: 'root' })
export class ShoppingListResolverService implements Resolve<Ingredient[]>{

    constructor(private store: Store<fromApp.AppState>, private action$: Actions) { }

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        return this.store.select('shoppingList')
            .pipe(take(1), map(shoppingListState => shoppingListState.ingredients),
                switchMap(ingredients => {
                    // If there are no ingredients in the current state
                    if (ingredients.length === 0) {
                        // Dispatch the action FetchShoppingList which sends a http-request to fetch the ShoppingList from the database
                        this.store.dispatch(new ShoppingListActions.FetchShoppingList());
                        // returns the action SetIngredients to update the current shoppingList-state
                        return this.action$.pipe(ofType(ShoppingListActions.SET_INGREDIENTS), take(1));
                    }
                    else {
                        // return the existing ingredients of the current state
                        return of(ingredients);
                    }
                })
            );
    }
}
