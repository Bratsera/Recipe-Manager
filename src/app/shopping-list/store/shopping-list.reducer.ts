
import { Ingredient } from '../../shared/ingredient.model';
import * as ShoppingListActions from './shopping-list.actions';


export interface State {
  ingredients: Ingredient[];
}

const initialState: State = {
  ingredients: [],
};

/**
 * Checks if there´s already an existing Ingredient with the same name like @newIngredient in @ingredientList .
 * If this is false, @newIngredient is pushed to @ingredientList .
 * Else the amount of the existing Ingredient in @ingredientList is updated by the amount of @newIngredient .
 * @param ingredientList The Array of ingredients to be updated
 * @param newIngredient The Ingredient to add
 * @returns Returns the updated Array of ingredients
 */
const updateExistingElements = (ingredientList: Ingredient[], newIngredient: Ingredient) => {
  const ingredients = [...ingredientList];
  // Search the ingredient in the ingredientList by the name and return the index in the array.
  const index = ingredients.findIndex(ingredient => ingredient.name.toLowerCase() === newIngredient.name.toLowerCase());
  // If an ingredient was found, update the found ingredient
  if (index !== -1) {
    const ingredient = ingredients[index];
    // Update the amount-property
    const newAmount = ingredient.amount + newIngredient.amount;
    const updatedIngredient = {
      ...ingredient,
      amount: newAmount
    };
    ingredients[index] = updatedIngredient;

  }
  else {
    // No ingredient was found so add this indredient to the array
    ingredients.push(newIngredient);
  }
  // return the updated ingredientList
  return ingredients;
};

export function shoppingListReducer(
  state: State = initialState,
  action: ShoppingListActions.ShoppingListActions
): State {
  switch (action.type) {
    case ShoppingListActions.SET_INGREDIENTS:
      {
        return {
          ...state,
          ingredients: action.payload
        };
      }
    case ShoppingListActions.ADD_INGREDIENT: {
      const ingredients = [...state.ingredients];
      const updatedIngredients = updateExistingElements(ingredients, action.payload);
      return {
        ...state,
        ingredients: updatedIngredients
      };
    }
    case ShoppingListActions.ADD_INGREDIENTS: {
      let ingredients = [...state.ingredients];
      action.payload.forEach(element => {
        ingredients = updateExistingElements(ingredients, element);
      });
      return {
        ...state,
        ingredients
      };
    }
    case ShoppingListActions.UPDATE_INGREDIENT: {
      const ingredient = state.ingredients[action.payload.index];
      const updatedIngredient = {
        ...ingredient,
        ...action.payload.ingredient
      };
      const updatedIngredients = [...state.ingredients];
      updatedIngredients[action.payload.index] = updatedIngredient;

      return {
        ...state,
        ingredients: updatedIngredients,
      };
    }
    case ShoppingListActions.DELETE_INGREDIENTS:
      return {
        ...state,
        ingredients: state.ingredients.filter((ig) => {
          return !action.payload.includes(ig.name)
        }),
      };

    default:
      return state;
  }
}
