import { trigger } from '@angular/animations';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { fadeInOut } from '../shared/animation.component';
import { Ingredient } from '../shared/ingredient.model';
import * as fromApp from '../store/app.reducer';
import * as shoppingListActions from './store/shopping-list.actions';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { SelectionModel } from '@angular/cdk/collections';
import { faPrint, faTrashAlt, faEdit, faPlusSquare } from '@fortawesome/free-solid-svg-icons';
import { Action } from 'rxjs/internal/scheduler/Action';
import { FormControl, FormGroup, NgForm, Validators } from '@angular/forms';

@Component({
  selector: 'app-shopping-list',
  templateUrl: './shopping-list.component.html',
  styleUrls: ['./shopping-list.component.scss'],
  animations: [
    trigger('listState', fadeInOut())
  ]
})

export class ShoppingListComponent implements OnInit, OnDestroy {
  addIngredientForm: FormGroup;
    
  editingSub: Subscription;
  

  //numSelected: number = 0;
  selectedIngredients: number[];
  printIcon = faPrint;
  deleteIcon = faTrashAlt;
  editIcon = faEdit;
  addIcon = faPlusSquare;
  displayedColumns: string[] = ['select', 'position', 'name', 'amount', 'unit'];
  dataSource: MatTableDataSource<Ingredient>;
  editMode = false;
  showAddIng = false;
  curIngIndex= -1;
  selection = new SelectionModel<Ingredient>(true, []);

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return this.selection.selected.length === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    if (this.isAllSelected()) {
      this.selection.clear();
      return;
    }

    this.selection.select(...this.dataSource.data);
  }

  /** The label for the checkbox on the passed row */

  checkboxLabel(row?: Ingredient, i?: number): string {
    if (!row) {
      return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
    }

    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${i + 1}`;
  }

  shoppingListSub = new Subscription();
  ingredients: Ingredient[] = [];
  //sort: Ingredient[];

  constructor(
    private store: Store<fromApp.AppState>
  ) { }

  ngOnInit(): void {
    // Get the ingredients from current shoppingList-state and initialize the template
    this.shoppingListSub = this.store.select('shoppingList')
      .pipe(
        map(shoppingListState => shoppingListState.ingredients)
      )
      .subscribe((newList: Ingredient[]) => {
        this.ingredients = newList;
        const sort = [...this.ingredients];
        this.dataSource = new MatTableDataSource<Ingredient>(sort);
        this.editMode=false;
      });
     
  }

  /**
   * Starts editing-mode to update the ingredient with the index @index in the current shoppingList state
   * @param index The index of the ingredient you want to edit
   */
  onEditItem(index: number = -1): void {
    this.showAddIng = true
    
    console.log(this.dataSource.data)

    if(index > -1){
    this.curIngIndex = index
    this.editMode = true;
    const editedItem = this.ingredients[this.curIngIndex];
    this.addIngredientForm= new FormGroup({ name: new FormControl(editedItem.name, Validators.required),
      amount: new FormControl(editedItem.amount, [Validators.required, Validators.pattern("^[1-9]+[0-9]*$")]),
      unit: new FormControl( editedItem.unit, Validators.required)}) 
}
else{
  this.curIngIndex = -1;
  this.addIngredientForm = new FormGroup ({
    name: new FormControl(null, Validators.required),
    amount: new FormControl(null, [Validators.required, Validators.pattern("^[1-9]+[0-9]*$")]),
    unit: new FormControl( null, Validators.required)
  })
}
    
     //this.store.dispatch(new shoppingListActions.StartEdit(index));
  }

  ngOnDestroy(): void {
    this.shoppingListSub.unsubscribe();
  }

  drop(event: CdkDragDrop<string[]>): void {
    if (event.previousContainer === event.container) {
      moveItemInArray(this.dataSource.data, event.previousIndex, event.currentIndex);
      this.dataSource.data = this.dataSource.data.slice();
      this.store.dispatch(new shoppingListActions.SetIngredients(this.dataSource.data))
    }
  }

  printRecipe(): void {
    window.print();
  }

  onDeleteIngredients(): void {
    let ingNames: string[] = [];
    this.selection.selected.forEach(ingredient => {
      ingNames.push(ingredient.name)
      
    })
    this.store.dispatch(new shoppingListActions.DeleteIngredients(ingNames))
    this.selection.clear();

  }

  
    /**
     * Whenever the shopping-list-form is submitted it takes the entered form-data
     * and adds it as a new Ingredient to the shopping-list  or updates an existing Ingredient in the shopping-list.
     * Then it stores the changes in the database.
     * @param form The NgForm in the template which holds the data
     */
  onAddItem(): void {
    // Get the entered form-data
    const newIngredient: Ingredient = this.addIngredientForm.value; 
    console.log(newIngredient)
    // If an existing Ingredient is being updated
    if (this.editMode) {
        // Update the Ingredient by updating the shopping-list state and store the changes in the database
        this.store.dispatch(new shoppingListActions.UpdateIngredient({index: this.curIngIndex, ingredient: newIngredient}));
        console.log("dispatched update"+this.curIngIndex )
        // Quit editmode by setting it to false
        this.editMode = false;
    }
    // Add a new Ingredient by updating the shopping-list state and store the changes in the database
    else this.store.dispatch(new shoppingListActions.AddIngredient(newIngredient));
    
    // Clear the form
    this.addIngredientForm.reset();
    this.showAddIng =false;
}

 /**
     * Stopps the editing of the Ingredient without saving the changes
     */
  onClear(): void {
    // Clear the form
    this.addIngredientForm.reset();
    // Quit editmode by setting it to false
    this.editMode = false;
    this.showAddIng = false;
    this.curIngIndex = -1;
    // Update the shopping-list state
    //this.store.dispatch(new shoppingListActions.StopEdit());
}
}
