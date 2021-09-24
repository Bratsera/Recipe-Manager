import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import * as fromApp from '../../store/app.reducer';
import * as RecipeActions from '../store/recipe.actions';
import { map } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { Recipe } from '../recipe.model';

@Component({
  selector: 'app-recipe-edit',
  templateUrl: './recipe-edit.component.html',
  styleUrls: ['./recipe-edit.component.scss']
})
export class RecipeEditComponent implements OnInit, OnDestroy {
  /*-----------------------------------Form variables----------------------------------*/
  recipeName: string = '';
  category: string = '';
  description: string = '';
  about: string = '';
  comment: string = '';
  publishRecipe = false;
  // Stores path and name of the image to display
  image = {
    filePath: '../assets/NoImage.jpg',
    fileName: 'Kein Bild vorhanden'
  }
  // Stores the uploaded image
  file;

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


  recipeForm: FormGroup;
  ingredients: FormArray;
  variants: FormArray;

  /*-----------------------------------Form variables end----------------------------------*/

  // Tracking recipesState
  recipeSub: Subscription;
  // Tracking authState
  authSub: Subscription;
  // id of the edited recipe
  id: string;
  // userId of the current user to assign the author to every new created recipe
  author: string;
  // Determines if a new recipe is created of an existing recipe is updated
  editMode = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private store: Store<fromApp.AppState>
  ) { }

  get ingredientControls() {
    return (<FormArray>this.recipeForm.get('ingredients')).controls;
  }
  get variantControls() {
    return (<FormArray>this.recipeForm.get('variants')).controls;
  }

  ngOnInit(): void {
    // Check params in current route
    this.getRouteParams();

    // Get the id of the logged user
    this.authSub = this.store.select('authentification').subscribe(authstate => {
      if (authstate.user) this.author = authstate.user.id;
    });
    // Create and fill the template form
    this.initForm();
  }

  /** Checks the current route for params. If there is an Id-param in the current route,
   * store it and start editMode 
   */
  getRouteParams() {
    this.route.params.subscribe(
      (params: Params) => {
        // Get the Index of the requested recipe from the route-params
        this.id = params['id'];
        // If an id-param was passed in the route, set editmode to true
        this.editMode = params['id'] != null;
      }
    );
  }
  // -------------------------------------Initializing Template Form-------------------------------------------
  /**
   * Initializes the the template form for adding a new recipe or
   * fills the template form with selected recipe data, if a recipe is selected
   */
  initForm(): void {
    // Initial form values
    this.recipeName = '';
    this.category = '';
    this.description = '';
    this.about = '';
    this.comment = '';
    this.publishRecipe = false;
    this.ingredients = new FormArray([]);
    this.variants = new FormArray([]);

    // Creates the variant controls of the template form
    this.createFormVariants();
    // If editMode is true, fill the form with the edited recipe data
    this.fillFormTemplate();
    // Create the form
    this.createForm()
  }
  // Creates the variant controls of the template form
  createFormVariants() {

    for (let option of this.variantOptions) {
      this.variants.push(new FormGroup({
        name: new FormControl(option.name),
        checked: new FormControl(option.checked),
        description: new FormControl(option.description)
      }));
    }
  }
  // Initializes the template form
  createForm() {
    this.recipeForm = new FormGroup(
      {
        name: new FormControl(this.recipeName, Validators.required),
        category: new FormControl(this.category, Validators.required),
        description: new FormControl(this.description, Validators.required),
        about: new FormControl(this.about),
        comment: new FormControl(this.comment),
        ingredients: this.ingredients,
        variants: this.variants,
        img: new FormControl(this.image.filePath),
        filename: new FormControl(['']),
        publishRecipe: new FormControl(this.publishRecipe)
      }
    );
  }

  /**
   * If editMode is true, get the cur recipesState, find the recipe matching the recipe id with the route params id
   * and fill the form with the recipe data
   */
  fillFormTemplate() {
    if (this.editMode) {
      // Find the recipe with the matching id
      const recipe = this.getCurRecipe();

      // Fill the form
      this.recipeName = recipe.name;
      this.image.filePath = recipe.image.filePath;
      this.image.fileName = recipe.image.fileName;
      this.description = recipe.description;
      this.category = recipe.category;
      this.about = recipe.about;
      this.comment = recipe.comment;
      this.publishRecipe = recipe.publishRecipe;

      // Create Form controls for every ingredient in the recipe
      if (recipe['ingredients']) {
        for (const ingredient of recipe.ingredients) {
          this.ingredients.push(new FormGroup({
            name: new FormControl(ingredient.name, Validators.required),
            amount: new FormControl(ingredient.amount, [Validators.required, Validators.pattern(/^\d*(\.\d{0,2})?$/)]),
            unit: new FormControl(ingredient.unit, Validators.required)
          }));
        }
      }
      if (recipe.variants) {
        this.variants.clear();
        for (const variant of recipe.variants) {
          this.variants.push(new FormGroup({
            name: new FormControl(variant.name),
            checked: new FormControl(variant.checked),
            description: new FormControl(variant.description)
          }));
        }
      }
    };
  }

  /**
   * Tracks the current recipeState, searches the recipe with the matching id
   * @returns The recipe with the corresponding id
   */
  getCurRecipe(): Recipe {
    let curRecipe;
    this.recipeSub = this.store
      .select('recipes')
      .pipe(
        map(recipeState => {
          // Get the recipe with the selected Index
          return recipeState.recipes.find(recipe => recipe.id == this.id);
        })
      )
      .subscribe(recipe => {
        curRecipe = recipe;
      })
    return curRecipe;
  }

  // -------------------------------------Initializing Template Form End-------------------------------------------
  ngOnDestroy(): void {
    if (this.authSub) this.authSub.unsubscribe();
    if (this.recipeSub) this.recipeSub.unsubscribe();
  }
  // ----------------------------Functions triggered in the template---------------------------------

  onSubmit(): void {
    /* Prevent from fetching the recipe- and auth-State before redirecting the route*/
    if (this.authSub) this.authSub.unsubscribe();
    if (this.recipeSub) this.recipeSub.unsubscribe();

    const formobj: Recipe = this.recipeForm.value;
    const newRecipe: Recipe = new Recipe(
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
    // Add/update recipe and store changes to the database
    this.storeRecipe(newRecipe)

    // Navigate back to the /recipes route
    this.onCancel();
  }

  // Add/update recipe and store changes to the database
  storeRecipe(recipe: Recipe) {
    // If an existing recipe was edited, update the recipe
    if (this.editMode) this.store.dispatch(new RecipeActions.UpdateRecipe({ index: this.id, recipe: recipe }));
    // Else add a new recipe
    else {
      this.store.dispatch(new RecipeActions.AddRecipe(recipe));
    }
    // Save the changes in the database
    this.store.dispatch(new RecipeActions.StoreRecipes());
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

  /** 
   * Show the uploaded image in the template. Also convert and store the uploaded image data
   */
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

}
