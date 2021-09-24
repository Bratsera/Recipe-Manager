import { Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import * as fromApp from '../store/app.reducer';
import * as AuthActions from '../authentification/store/authentification.actions';
import { Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { NavigationEnd, Router } from '@angular/router';
import { RecipeSearchService } from '../recipe/recipe-search.service';
import { User } from '../authentification/user.model';
import { Recipe } from '../recipe/recipe.model';

@Component({
  selector: 'app-header-component',
  templateUrl: './header-component.component.html',
  styleUrls: ['./header-component.component.scss']
})
export class HeaderComponentComponent implements OnInit, OnDestroy {
  searchIcon = faSearch;

  isAuthenticated = false;
  idstring: string
  // -------------------Searchbar----------------------
  curRoute = '';
  // Value of search dropdown-field in the template
  categorySelected: string = '';
  // Value of search input-field in the template
  searchString: string = '';
  // Options of search dropdown-field in the template
  categories: string[] = [];
  // Recipe names that match the searchstring value to update the recipe-list
  recipeNames: string[] = [];
  // Autocompletion options of search dropdown-field in the template
  autoComplete: string[] = [];

  //-------------------Subscriptions-------------------
  private userSubscription: Subscription;
  private recipeSubscription: Subscription;
  routerSubscription: Subscription;

  constructor(
    private store: Store<fromApp.AppState>,
    public router: Router,
    private searchService: RecipeSearchService) {
  }

  ngOnInit(): void {
    this.routerSubscription = this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {

        //Checks if navigation root has changed and clears searchbar 
        this.compareUrl(event.url)

        this.curRoute = event.url;

        if (!this.curRoute.includes('/shopping-list')) {
          // Check if the user is authenticated. If not, hide the navbar pages
          this.recipeNames = [];
          this.userSubscription = this.store.select('authentification')
            .pipe(map(authstate => authstate.user))
            .subscribe(user => {
              this.isAuthenticated = !!user;
              this.recipeSubscription = this.store.select('recipes').pipe(map(state => state.recipes)).subscribe(recipes => {

                const filteredRecipeData = this.filterRecipes(recipes, user)
                this.recipeNames = filteredRecipeData.filteredRecipeNames
                this.categories = filteredRecipeData.categories;

              })
            });
        }
        this.updateList();
      }
    })
  }

  /**
   * Compares the current navigation route with the last route. If the url root has changed, it clears the searchbar inputs
   * @param url The current navigation route-url
   */
  compareUrl(url: string) {
    if (this.curRoute.includes('/recipes')) {
      if (this.curRoute.includes('my-recipes')
        && !url.includes('my-recipes')) {
        this.searchString = '';
        this.categorySelected = '';
      }
      else if (!this.curRoute.includes('my-recipes')
        && url.includes('my-recipes')) {
        this.searchString = '';
        this.categorySelected = '';
      }
    }
    else {
      this.searchString = '';
      this.categorySelected = '';
    }
  }

  /**
   * 1. Passes the selected category and the input value to update the recipe list with the matching recipes
   * 2. Updates the Autocompletion suggestions in the header searchbar everytime the input-value changes
   * by checking all recipenames that match the input-value (case insensitive) and the selected category and storing the names in an Array
   * 
   */
  updateList() {
    this.searchService.valuesChanged.next({ category: this.categorySelected, searchString: this.searchString });
    if (!this.searchString) this.autoComplete = [];
    else {
      this.autoComplete = this.recipeNames.filter(recipe => {
        return recipe.toLocaleLowerCase().startsWith(this.searchString.toLowerCase());
      })
    }
  }

  /**
   * Filters the passed recipes array depending on the visited route by userid of the current user or the "publishRecipe"-property of each recipe
   * to update the searchbar category an Autocompletion options in the template
   * @param recipes The recipes array to filter
   * @param user UserState of the cur user
   * @returns an object containing two arrays of type string with all names an occuring categories of the filtered recipes 
   */
  filterRecipes(recipes: Recipe[], user: User) {

    const filteredRecipeNames: string[] = [];
    const categories: string[] = [];
    // If the current route contains 'my-recipes'
    if (this.curRoute.includes('my-recipes')) {
      // Filter all recipes, where the author-property matches the user id
      recipes.forEach(recipe => {
        if (user && user.id === recipe.author) {
          filteredRecipeNames.push(recipe.name);
          if (categories.indexOf(recipe.category) === -1) {
            categories.push(recipe.category);
          }
        }
      })
    }
    // If the current route is on the global recipes route
    else if (this.curRoute.includes('/recipes')) {
      // Filter all published recipes, this means where the recipe property "publishRecipe" is set to true
      recipes.forEach(recipe => {
        if (recipe.publishRecipe) {
          filteredRecipeNames.push(recipe.name);
          if (categories.indexOf(recipe.category) === -1) {
            categories.push(recipe.category);
          }
        }
      })
    }
    return {
      filteredRecipeNames,
      categories
    }
  }

  ngOnDestroy(): void {
    this.searchString = '';
    this.categorySelected = '';
    this.userSubscription.unsubscribe();
    this.recipeSubscription.unsubscribe();
  }

  onLogout(): void {
    this.store.dispatch(new AuthActions.Logout());
  }
}
