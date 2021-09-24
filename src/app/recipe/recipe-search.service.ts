import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

/**
 * Whenever the input or category in the searchbar of the header component changes,
 * this service dispatches the updated string an category-option to the subscribers
 */
@Injectable({
  providedIn: 'root'
})
export class RecipeSearchService {
  valuesChanged = new Subject<{
    category: string,
    searchString: string
  }>();
}
