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

  // Searchbar
  curRoute = '';
  categorySelected: string = '';
  searchString: string = '';
  categories: string[] = [];
  recipeNames: string[] = [];
  autoComplete: string[] = [];

  //Subscriptions
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
        this.curRoute = event.url;
        if (this.curRoute.includes('/shopping-list')) {
          this.searchString = '';
        }
        else {
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
      }
    })
  }

  ngOnDestroy(): void {
    this.searchString = '';
    this.userSubscription.unsubscribe();
    this.recipeSubscription.unsubscribe();
  }

  onLogout(): void {

    this.store.dispatch(new AuthActions.Logout());
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
  filterRecipes(recipes: Recipe[], user: User) {

    const filteredRecipeNames: string[] = [];
    const categories: string[] = [];
    if (this.curRoute.includes('my-recipes')) {
      recipes.forEach(recipe => {

        if (user && user.id === recipe.author) {
          filteredRecipeNames.push(recipe.name);
          if (categories.indexOf(recipe.category) === -1) {
            categories.push(recipe.category);
          }
        }
      })
    }
    else if (this.curRoute.includes('/recipes')) {
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
}
