import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { Recipe } from '../recipe.model';
import * as fromApp from '../../store/app.reducer';
import { Store } from '@ngrx/store';
import { map } from 'rxjs/operators';
import { RecipeSearchService } from '../recipe-search.service';
import { faDrumstickBite, faCheese, faCarrot, faSeedling } from '@fortawesome/free-solid-svg-icons';
import { User } from 'src/app/authentification/user.model';
import { Router } from '@angular/router';
import {BreakpointObserver} from '@angular/cdk/layout';

@Component({
  selector: 'app-recipe-list',
  templateUrl: './recipe-list.component.html',
  styleUrls: ['./recipe-list.component.scss'],
})
export class RecipeListComponent implements OnInit, OnDestroy {
  
  // Checks if there is a <slide> displayed in the template
  @ViewChild('content') content: ElementRef;

  //State of the screen size
  smallScreen = false;

  // Template icons
  faMeatIcon = faDrumstickBite;
  faCheeseIcon = faCheese;
  faCarrotIcon = faCarrot;
  faSeedlingIcon = faSeedling;

  //Subscribtions
  recipeSubscription: Subscription;
  searchSubscription: Subscription;
  routerSubscription: Subscription;
  userSubscription: Subscription;
  breakpointSubscription: Subscription;

  //Routing states
  curRoute: string;
  myRecipeRoute = false;

  // Carousel component config
  itemsPerSlide = 3;
  singleSlideOffset = true;
  noWrap = true;
  recipes: Recipe[];
  category: string = '';
  searchString: string = '';

  constructor(
    private store: Store<fromApp.AppState>,
    private searchService: RecipeSearchService,
    private router: Router,
    private breakpointObserver: BreakpointObserver
  ) { }

  ngOnInit(): void {
    // Observes changes of the screensize and adjusts template
    this.checkScreenSize();
    
    // Check if user is on the global route or the my-recipes route
    this.curRoute = this.router.url;
    this.myRecipeRoute = this.curRoute.includes('my-recipes');

    if (this.myRecipeRoute) {
      this.getRecipeListByUserId();
    }
    else if (this.curRoute.includes('/recipes')) {
      this.getRecipeList();
    }
    // Update displayed recipes on changes
    this.checkForSearchFieldInput()
  }
  /**
   * Checks if the screensize is smaller then 768px or not and adjusts the amount of slides shown in the template
   */
  checkScreenSize() {
    this.breakpointSubscription = this.breakpointObserver.observe('(max-width: 768px)')
    .subscribe( value =>{
      this.smallScreen = value.matches
      // Show only one slide on small devices and 3 slides on other
      this.itemsPerSlide = this.smallScreen ? 1 : 3;
    })
  }

  /**
   * Get the current user state and filter the current recipe list by the id of the current user id
   */
  getRecipeListByUserId() {
    // Get the current user state
    this.userSubscription = this.store.select('authentification')
      .pipe(map(authstate => authstate.user))
      .subscribe(user => {
        // Get the list of recipes with the matching user id
        this.getRecipeList(user)
      });
  }

  /**
   * Get the current recipe state and filter the recipes
   * @param user current user state
   */
  getRecipeList(user: User = null) {
    this.recipeSubscription = this.store.select('recipes')
      .pipe(map(state => state.recipes))
      .subscribe(recipes => {
        // Filter the recipes
        const filteredRecipeData = this.filterRecipes(recipes, user)
        this.recipes = filteredRecipeData;
      })
  }

  /**
   * Filters the passed recipe list. If the passed user-param is not null,
   * recipes are filterd by the user id. Else, recipes are filtered by the recipe-property "publishRecipe" (if value is true)
   * @param recipes The recipes to filter
   * @param user Current user state
   * @returns a filtered array of recipes
   */
  filterRecipes(recipes: Recipe[], user: User) {
    const filteredRecipes: Recipe[] = [];
    if (user) {
      recipes.forEach(recipe => {
        if (user && user.id === recipe.author) {
          filteredRecipes.push(recipe);
        }
      })
    }
    else {
      recipes.forEach(recipe => {
        if (recipe.publishRecipe) {
          filteredRecipes.push(recipe);
        }
      })
    }
    return filteredRecipes;
  }

  /**
   * Change the displayed recipes if the input or category in the searchbar of the header component changes
   */
  checkForSearchFieldInput() {
    this.searchSubscription = this.searchService.valuesChanged.subscribe(values => {
      this.category = values.category;
      this.searchString = values.searchString;
    })
  }

  ngOnDestroy(): void {
    if (this.userSubscription) this.userSubscription.unsubscribe();
    if (this.recipeSubscription) this.recipeSubscription.unsubscribe();
    if (this.searchSubscription) this.searchSubscription.unsubscribe();
    if (this.routerSubscription) this.routerSubscription.unsubscribe();
    if (this.breakpointSubscription) this.breakpointSubscription.unsubscribe();
  }
}
