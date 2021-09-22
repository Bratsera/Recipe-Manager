import { Ingredient } from '../shared/ingredient.model';
import { UUID } from 'angular2-uuid';


export class Recipe {
    public id: string;
    constructor(

        public name: string,
        public category: string,
        public description: string,
        public image: {
            filePath: string,
            fileName: string
        },
        public ingredients: Ingredient[],
        public about: string,
        public comment: string,
        public variants: [{
            name: string,
            checked: boolean,
            description: string
        }],
        public author: string,
        public publishRecipe: boolean
    ) {
        this.id = UUID.UUID();
    }
}
