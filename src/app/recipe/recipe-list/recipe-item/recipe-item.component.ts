import { trigger } from '@angular/animations';
import { Component, Input, OnInit } from '@angular/core';
import { fadeInOut } from 'src/app/shared/animation.component';
import { Recipe } from '../../recipe.model';

@Component({
  selector: 'app-recipe-item',
  templateUrl: './recipe-item.component.html',
  styleUrls: ['./recipe-item.component.scss'],
  animations: [
    trigger('listState', fadeInOut())
  ]
})
export class RecipeItemComponent implements OnInit {
  @Input() recipe: Recipe;
  @Input() index: number;
  ngOnInit(): void { }

}
