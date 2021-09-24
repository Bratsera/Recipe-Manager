import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Recipe } from '../recipe.model';
import * as fromApp from '../../store/app.reducer';
import { map, switchMap } from 'rxjs/operators';
import * as RecipeActions from '../store/recipe.actions';
import * as ShoppingListActions from '../../shopping-list/store/shopping-list.actions';
import { trigger } from '@angular/animations';
import { fadeInRight } from 'src/app/shared/animation.component';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { Ingredient } from 'src/app/shared/ingredient.model';
import { faPrint } from '@fortawesome/free-solid-svg-icons';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-recipe-detail',
  templateUrl: './recipe-detail.component.html',
  styleUrls: ['./recipe-detail.component.scss'],
  animations: [
    trigger('listState', fadeInRight())
  ]
})
export class RecipeDetailComponent implements OnInit, OnDestroy {
  printIcon = faPrint;
  // Tracks if the user is logged in
  userSubscription: Subscription;
  // Keeps track of the recipesState
  recipeSub: Subscription;

  // The displayed recipe
  recipe: Recipe;
  // The id of the wanted recipe to display
  id: string;

  // Is the user logged in?
  isAuthenticated = false;
  // Form that edits the ingredients of the recipe
  ingredientsForm: FormGroup;
  // Editmode state on adding recipe ingredients to the shopping-list
  addToShoppingListEdit = false;
  // Determines if edit-buttons in the template are displayed or not
  canEdit = false;


  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private store: Store<fromApp.AppState>
  ) { }

  ngOnInit(): void {
    // Get the current user state
    this.userSubscription = this.store.select('authentification')
      .pipe(map(authstate => authstate.user))
      .subscribe(user => {
        this.isAuthenticated = !!user;
      });
    // Buttons to edit the current recipes are only displayed, if the current route contains /my-recipes
    this.canEdit = this.router.url.includes('/my-recipes');
    // Create the ingredient form
    const ingredientsFormArray = new FormArray([]);
    this.recipeSub = this.route.params
      .pipe(
        map(params => {
          // Get the Index of the requested recipe from the route-params
          return params['id'];
        }),
        switchMap(id => {
          this.id = id;
          // Get all recipes
          return this.store.select('recipes');
        }),
        map(recipeState => {
          // Get the recipe with the selected Index
          return recipeState.recipes.find(recipe => {
            return recipe.id == this.id;
          })
        })
      )
      .subscribe(recipe => {
        // Display the recipe in the template
        this.recipe = recipe;
        // Add a checkbox to the form for every ingredient in the recipe
        for (const ingredient of recipe.ingredients) {
          ingredientsFormArray.push(
            new FormGroup({
              checked: new FormControl(true)
            }))
        }
      });
    this.ingredientsForm = new FormGroup({ ingredientsFormArray });
  }

  ngOnDestroy() {
    if (this.recipeSub) this.recipeSub.unsubscribe();
  }


  // ----------------------------Functions triggered in the template---------------------------------

  // Triggers the Ingredient editMode in the template to select the ingredients to add to the shopping list 
  shoppingListEdit(): void {
    this.addToShoppingListEdit = true;
  }

  // Cancels the Ingredient editMode in the template
  onCancel(): void {
    this.addToShoppingListEdit = false;
  }

  /**  Adds all ingredients to the shopping list, where the checkbox in the template is checked */
  onAddToShoppingList(): void {
    // Array that stores all ingredients that should be added to the shopping list
    const ingredientsToAdd: Ingredient[] = [];
    const formArray = (<FormArray>this.ingredientsForm.get('ingredientsFormArray')).controls;
    /* For every ingredient in the current recipe, check if corresponding checkbox in the template is checked
    and if true ad the ingredient to the ingredientsToAdd array  */
    for (let index = 0; index < this.recipe.ingredients.length; index++) {
      let formItem = formArray[index].get('checked');
      if (formItem.value) {
        ingredientsToAdd.push(this.recipe.ingredients[index]);
      }
      formItem.setValue(true);
    }
    // Add all checked ingredients to the shopping list
    this.store.dispatch(new ShoppingListActions.AddIngredients(ingredientsToAdd));
    // leave editMode
    this.onCancel();
  }

  // Delets the current displayed recipe
  onDeleteRecipe(): void {
    /* Prevent from fetching the recipeState after deleting the recipe 
    and before redirecting the route to avoid rendering the route with a non existent Id-param */
    if (this.recipeSub) this.recipeSub.unsubscribe();
    // Delete the recipe in the current recipesState
    this.store.dispatch(new RecipeActions.DeleteRecipe(this.id));
    // Store the changes to the database
    this.store.dispatch(new RecipeActions.StoreRecipes());
  }

  printRecipe(): void {
    window.print();
  }

}
