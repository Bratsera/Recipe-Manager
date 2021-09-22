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
export class RecipeDetailComponent implements OnInit,OnDestroy {
  printIcon = faPrint;
  ingredientsForm: FormGroup;
  recipeSub: Subscription;
  recipe: Recipe;
  id: string;
  editMode = false;
  canEdit = false; 

  shoppingListEdit(): void {
    this.editMode = true;
  }
  onCancel():void{
    this.editMode = false;
  }
  onSubmit():void {
    if(this.recipeSub) this.recipeSub.unsubscribe();
    const ingredientsToAdd: Ingredient[] = [];
    const formArray= (<FormArray> this.ingredientsForm.get('ingredientsFormArray')).controls;
    for (let index = 0; index < this.recipe.ingredients.length; index++) {
      let formItem = formArray[index].get('checked');
      if(formItem.value){
        ingredientsToAdd.push(this.recipe.ingredients[index]);
      }     
      formItem.setValue(true);
    }
    this.store.dispatch(new ShoppingListActions.AddIngredients(ingredientsToAdd));
    this.editMode = false;
  }

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private store: Store<fromApp.AppState>
  ) { }

  
  ngOnInit(): void {
    this.canEdit = this.router.url.includes('/my-recipes');
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
        for(const ingredient of recipe.ingredients) {
     
          ingredientsFormArray.push(
            new FormGroup({
            checked: new FormControl(true)
           // ingredient: new FormControl(ingredient)
          }))
        }
      });
      this.ingredientsForm = new FormGroup({ingredientsFormArray});
  }
  ngOnDestroy(){
    if(this.recipeSub) this.recipeSub.unsubscribe();
  }

  onDeleteRecipe(): void {
    if(this.recipeSub) this.recipeSub.unsubscribe();
    this.store.dispatch(new RecipeActions.DeleteRecipe(this.id));
    this.store.dispatch(new RecipeActions.StoreRecipes());
  }

  printRecipe(): void {
    window.print();
  }

}
