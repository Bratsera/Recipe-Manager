import * as fromShoppingList from '../shopping-list/store/shopping-list.reducer';
import * as fromAuthentification from '../authentification/store/authentification.reducer';
import * as fromRecipes from '../recipe/store/recipe.reducer';
import { ActionReducerMap } from '@ngrx/store';

export interface AppState {
    shoppingList: fromShoppingList.State;
    authentification: fromAuthentification.State;
    recipes: fromRecipes.State;
}

export const appReducer: ActionReducerMap<AppState> = {
    shoppingList: fromShoppingList.shoppingListReducer,
    authentification: fromAuthentification.authReducer,
    recipes: fromRecipes.recipesReducer
};
