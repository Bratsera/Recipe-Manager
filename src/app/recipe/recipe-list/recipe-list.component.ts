import { Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { Recipe } from '../recipe.model';
import * as fromApp from '../../store/app.reducer';
import { Store } from '@ngrx/store';
import { map } from 'rxjs/operators';
import { RecipeSearchService } from '../recipe-search.service';
import { faDrumstickBite, faCheese, faCarrot, faSeedling } from '@fortawesome/free-solid-svg-icons';
import { User } from 'src/app/authentification/user.model';
import { NavigationEnd, Router } from '@angular/router';

@Component({
  selector: 'app-recipe-list',
  templateUrl: './recipe-list.component.html',
  styleUrls: ['./recipe-list.component.scss'],
})
export class RecipeListComponent implements OnInit, OnDestroy {
  @ViewChild('content') content: ElementRef;
  faMeatIcon = faDrumstickBite;
  faCheeseIcon = faCheese;
  faCarrotIcon = faCarrot;
  faSeedlingIcon = faSeedling;


  recipeSubscription: Subscription;
  searchSubscription: Subscription;
  authSub: Subscription;
  curRoute: string;
  recipes: Recipe[];
  // slides = [];
  category: string = '';
  searchString: string = '';
  routerSubscription: any;
  userSubscription: Subscription;

  constructor(
    private store: Store<fromApp.AppState>,
    private searchService: RecipeSearchService,
    private router: Router
  ) { 
  
  }

  ngOnInit(): void {
   /* let user: User;
    this.authSub = this.store.select('authentification').subscribe(authstate => {
      user = authstate.user;
    });
    // Get the current list of recipes
    this.recipeSubscription = this.store.select('recipes')
      .pipe(map(recipeState => recipeState.recipes))
      .subscribe(
        (recipes: Recipe[]) => {
          const filteredRecipeData = this.searchService.getRecipeList(recipes, user)
          this.recipes = filteredRecipeData.filterdRecipes;
          this.recipes.forEach(ing => {
            // this.slides.push({ image: ing.imagePath });  
          })
        });*/
        
            this.curRoute = this.router.url;
            // Check if the user is authenticated. If not, hide the navbar pages
            this.userSubscription = this.store.select('authentification')
              .pipe(map(authstate => authstate.user))
              .subscribe(user => {
                this.recipeSubscription = this.store.select('recipes').pipe(map(state => state.recipes)).subscribe(recipes => {
                  
                  const filteredRecipeData = this.getRecipeList(recipes,user)
                  this.recipes = filteredRecipeData;
                  
                  
                })
              });
          
        
    
    this.searchSubscription = this.searchService.valuesChanged.subscribe(values => {
      this.category = values.category;
      this.searchString = values.searchString;
    })
  }

  ngOnDestroy(): void {

    if (this.authSub) this.authSub.unsubscribe();
    this.recipeSubscription.unsubscribe();
    this.searchSubscription.unsubscribe();

  }

  itemsPerSlide = 3;
  singleSlideOffset = true;
  noWrap = true;
  
  getRecipeList(recipes: Recipe[], user: User) {
  
    const filteredRecipes: Recipe[] = [];
    if (this.curRoute.includes('my-recipes')) {
      recipes.forEach(recipe => {
        if (user && user.id === recipe.author) {
          filteredRecipes.push(recipe);
        }
      })
    }
    else if (this.curRoute.includes('/recipes')) {
      recipes.forEach(recipe => {
        if (recipe.publishRecipe) {
          filteredRecipes.push(recipe);
        }
      })
    }
    return filteredRecipes
  }
}
