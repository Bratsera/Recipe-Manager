import { Action } from '@ngrx/store';
import { Ingredient } from 'src/app/shared/ingredient.model';

export const ADD_INGREDIENT = '[shopping-list] ADD_INGREDIENT';
export const ADD_INGREDIENTS = '[shopping-list] ADD_INGREDIENTS';
export const UPDATE_INGREDIENT = '[shopping-list] UPDATE_INGREDIENT';
export const DELETE_INGREDIENTS = '[shopping-list] DELETE_INGREDIENTS';
export const FETCH_SHOPPINGLIST = '[shopping-list] Fetch_ShoppingList';
export const SET_INGREDIENTS = '[shopping-list] Set_Ingredients';


export class SetIngredients implements Action {
  readonly type = SET_INGREDIENTS;
  constructor(public payload: Ingredient[]) { }
}

export class AddIngredient implements Action {
  readonly type = ADD_INGREDIENT;

  constructor(public payload: Ingredient) { }
}

export class AddIngredients implements Action {
  readonly type = ADD_INGREDIENTS;

  constructor(public payload: Ingredient[]) { }
}

export class UpdateIngredient implements Action {
  readonly type = UPDATE_INGREDIENT;

  constructor(public payload: {
    ingredient: Ingredient,
    index: number
  }) { }
}

export class DeleteIngredients implements Action {
  readonly type = DELETE_INGREDIENTS;
  constructor(public payload: string[]) { }
}

export class FetchShoppingList implements Action {
  readonly type = FETCH_SHOPPINGLIST;
}
export type ShoppingListActions =
  AddIngredient
  | AddIngredients
  | UpdateIngredient
  | DeleteIngredients
  | FetchShoppingList
  | SetIngredients;
