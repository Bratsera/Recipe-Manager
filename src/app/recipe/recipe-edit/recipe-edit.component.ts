import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import * as fromApp from '../../store/app.reducer';
import * as RecipeActions from '../store/recipe.actions';
import { map } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { Recipe } from '../recipe.model';
import { Ingredient } from 'src/app/shared/ingredient.model';

@Component({
  selector: 'app-recipe-edit',
  templateUrl: './recipe-edit.component.html',
  styleUrls: ['./recipe-edit.component.scss']
})
export class RecipeEditComponent implements OnInit, OnDestroy {
  image = {
    filePath: '../assets/NoImage.jpg',
    fileName: 'Kein Bild vorhanden'
}
  author: string;
  authSub: Subscription;
  file;
  recipeForm: FormGroup;
  id: string;
  editMode = false;
  recipeSub: Subscription;
  variantOptions = [{
    name: 'Mit Fleisch',
    checked: false,
    description: ""
  },
  {
    name: 'Vegetarisch',
    checked: false,
    description: ""
  },
  {
    name: 'Vegan',
    checked: false,
    description: ""
  }];


  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private store: Store<fromApp.AppState>
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe(
      (params: Params) => {
        // Get the Index of the requested recipe from the route-params
        this.id = params['id'];
        // If an id-param was passed in the route, set editmode to true
        this.editMode = params['id'] != null;
      }
    );
    this.authSub = this.store.select('authentification').subscribe(authstate => {
      
      if(authstate.user) this.author = authstate.user.id;
    })
    this.initForm();
  }

  /**
   * Initializes the the template form for adding a new recipe or
   * fills the template form with selected recipe data, if a recipe is selected
   */
  initForm(): void {
    let recipeName = '';
    let category = '';
    let description = '';
    let about = '';
    let comment = '';
    let publishRecipe = false;
  
  

    const ingredients = new FormArray([]);
    let variants = new FormArray([]);
    for (let option of this.variantOptions) {
      variants.push(new FormGroup({
        name: new FormControl(option.name),
        checked: new FormControl(option.checked),
        description: new FormControl(option.description)
      }));

    }

    // On editmode fill the template-form with the recipe data
    if (this.editMode) {
      this.recipeSub = this.store
        .select('recipes')
        .pipe(
          map(recipeState => {
            // Get the recipe with the selected Index
            return recipeState.recipes.find(recipe => {
              console.log(recipe.id + " gesucht:" + this.id)
              return recipe.id == this.id;
            })
          })
        )
        .subscribe(recipe => {
          // Fill the form
          recipeName = recipe.name;
          this.image.filePath = recipe.image.filePath;
          this.image.fileName = recipe.image.fileName;
          description = recipe.description;
          category = recipe.category;
          about = recipe.about;
          comment = recipe.comment;
          publishRecipe = recipe.publishRecipe;
         
          if (recipe['ingredients']) {
            for (const ingredient of recipe.ingredients) {
              ingredients.push(new FormGroup({
                name: new FormControl(ingredient.name, Validators.required),
                amount: new FormControl(ingredient.amount, [Validators.required, Validators.pattern(/^\d*(\.\d{0,2})?$/)]),
                unit: new FormControl(ingredient.unit, Validators.required)
              }));
            }

          }
          if (recipe.variants) {
            variants.clear();
            for (const variant of recipe.variants) {
              variants.push(new FormGroup({
                name: new FormControl(variant.name),
                checked: new FormControl(variant.checked),
                description: new FormControl(variant.description)
              }));
            }
          }


        });
    }
    // Create the form
    this.recipeForm = new FormGroup(
      {
        name: new FormControl(recipeName, Validators.required),
        category: new FormControl(category, Validators.required),
        description: new FormControl(description, Validators.required),
        about: new FormControl(about),
        comment: new FormControl(comment),
        ingredients,
        variants,
        img: new FormControl(this.image.filePath),
        filename: new FormControl(['']),
        publishRecipe: new FormControl(publishRecipe)

      }
    );
  }
  get ingredientControls() {
    return (<FormArray>this.recipeForm.get('ingredients')).controls;
  }
  get variantControls() {
    return (<FormArray>this.recipeForm.get('variants')).controls;
  }

  ngOnDestroy(): void {
    if(this.authSub) this.authSub.unsubscribe();
    if (this.recipeSub) this.recipeSub.unsubscribe();
  }

  onSubmit(): void {
    if(this.authSub) this.authSub.unsubscribe();
    if (this.recipeSub) this.recipeSub.unsubscribe();
    const formobj: Recipe = this.recipeForm.value;
    
    const newRecipe:Recipe = new Recipe(
      formobj.name,
      formobj.category,
      formobj.description,
      this.image,
      formobj.ingredients,
      formobj.about,
      formobj.comment,
      formobj.variants,
      this.author,
      formobj.publishRecipe,
     )

    // If an existing recipe was edited, update the recipe
    if (this.editMode) this.store.dispatch(new RecipeActions.UpdateRecipe({ index: this.id, recipe: newRecipe }));

    // Else add a new recipe
    else {
   
      
      this.store.dispatch(new RecipeActions.AddRecipe(newRecipe));
    }
    // Save the changes in the database
    this.store.dispatch(new RecipeActions.StoreRecipes());
    // Navigate back to the /recipes route
    this.onCancel();
  }
  
  // Adds a new ingredient to the recipe
  onAddIngredient(): void {
    (<FormArray>this.recipeForm.get('ingredients')).push(new FormGroup({
      name: new FormControl(null, Validators.required),
      amount: new FormControl(null, [Validators.required, Validators.pattern(/^[1-9]+[0-9]*$/)]),
      unit: new FormControl(null, Validators.required)
    }));
  }
  // Removes an ingredient from the recipe
  onDeleteIngredient(index: number): void {
    (<FormArray>this.recipeForm.get('ingredients')).removeAt(index);
  }
  // Navigate back to the /recipes route
  onCancel(): void {
    this.router.navigate(['/recipes/my-recipes']);
  }

  imagePreview(event) {
    this.file = event.target.files[0];
    this.recipeForm.patchValue({
      img: this.file
    });

    this.recipeForm.get('img').updateValueAndValidity()
    const reader = new FileReader();
    reader.onload = () => {
      this.image.filePath = reader.result as string;
      this.image.fileName = this.file.name;
    }
    reader.readAsDataURL(this.file)
  }
  onPreview(){
  console.log(this.recipeForm.value)
  }
}
