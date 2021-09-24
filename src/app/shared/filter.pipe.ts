import { Pipe, PipeTransform } from '@angular/core';
import { Recipe } from '../recipe/recipe.model';

@Pipe({
  name: 'filter',
  pure: false
})
export class FilterPipe implements PipeTransform {

  transform(value: Recipe[], filterString: string, filterCategory: string): Recipe[] {
    const filteredList: Recipe[] = [];
    value.forEach(recipe => {
      if (
        (filterString === '' ||
          recipe.name.toLocaleLowerCase().includes(filterString.toLocaleLowerCase())) &&
        (filterCategory === '' ||
          recipe.category.toLocaleLowerCase().includes(filterCategory.toLocaleLowerCase()))) {
        filteredList.push(recipe);
      }
    })
    return filteredList;
  }
}
