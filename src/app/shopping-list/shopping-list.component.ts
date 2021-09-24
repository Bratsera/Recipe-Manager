import { trigger } from '@angular/animations';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { fadeInOut } from '../shared/animation.component';
import { Ingredient } from '../shared/ingredient.model';
import * as fromApp from '../store/app.reducer';
import * as shoppingListActions from './store/shopping-list.actions';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { MatTableDataSource } from '@angular/material/table';
import { SelectionModel } from '@angular/cdk/collections';
import { faPrint, faTrashAlt, faEdit, faPlusSquare } from '@fortawesome/free-solid-svg-icons';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-shopping-list',
  templateUrl: './shopping-list.component.html',
  styleUrls: ['./shopping-list.component.scss'],
  animations: [
    trigger('listState', fadeInOut())
  ]
})

export class ShoppingListComponent implements OnInit, OnDestroy {
  // Template icons
  printIcon = faPrint;
  deleteIcon = faTrashAlt;
  editIcon = faEdit;
  addIcon = faPlusSquare;

  shoppingListSub = new Subscription();
  ingredients: Ingredient[] = [];


  /*-----------------------------------Add Ingredient Form variables----------------------------------*/
  addIngredientForm: FormGroup;
  // Determines if a new list item is added (false) or an existing item is updated (true)
  editMode = false;
  // Display the Add/Edit Item form in the template
  showAddIng = false;
  // Index of the list item, that is edited
  curIngIndex = -1;


  /*-----------------------------------Table variables----------------------------------*/
  displayedColumns: string[] = ['select', 'position', 'name', 'amount', 'unit'];
  dataSource: MatTableDataSource<Ingredient>;
  selection = new SelectionModel<Ingredient>(true, []);


  constructor(
    private store: Store<fromApp.AppState>
  ) { }

  ngOnInit(): void {
    // Get the ingredients from current shoppingList-state and initialize the template
    this.shoppingListSub = this.store.select('shoppingList')
      .pipe(map(shoppingListState => shoppingListState.ingredients))
      .subscribe((newList: Ingredient[]) => {
        this.ingredients = newList;
        const sort = [...this.ingredients];
        // Fill the table
        this.dataSource = new MatTableDataSource<Ingredient>(sort);
        this.editMode = false;
      });

  }

  ngOnDestroy(): void {
    this.shoppingListSub.unsubscribe();
  }

  /*-----------------------------------Table Methods----------------------------------*/

  /**
   * Compares the amount of selected rows to the total amount of rows in the table . 
   * @returns True if all checkboxes are checked
   */
  isAllSelected() {
    const numRows = this.dataSource.data.length;
    return this.selection.selected.length === numRows;
  }

  /**
   * Selects all rows if they are not all selected; otherwise clear selection. 
   */
  masterToggle() {
    if (this.isAllSelected()) {
      this.selection.clear();
      return;
    }
    this.selection.select(...this.dataSource.data);
  }

  /**
   * Selects/deselects the passed row in the table deepending on its current state
   * @param row The current row
   * @param i The row index
   */
  checkboxLabel(row?: Ingredient, i?: number): string {
    if (!row) {
      return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${i + 1}`;
  }

  /**
   * Change the table order when an item is dragged and dropped in another position
   * @param event When the item is dropped
   */
  drop(event: CdkDragDrop<string[]>): void {
    if (event.previousContainer === event.container) {
      moveItemInArray(this.dataSource.data, event.previousIndex, event.currentIndex);
      this.dataSource.data = this.dataSource.data.slice();
      this.store.dispatch(new shoppingListActions.SetIngredients(this.dataSource.data))
    }
  }
  /*----------------------------------- Shopping list modify Methods----------------------------------*/
  /**
   * Deletes all selected items in the table
   */
  onDeleteIngredients(): void {
    let ingNames: string[] = [];
    this.selection.selected.forEach(ingredient => {
      ingNames.push(ingredient.name)
    })
    // Update database
    this.store.dispatch(new shoppingListActions.DeleteIngredients(ingNames))
    // Clear table selections
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
    // If an existing Ingredient is being updated
    if (this.editMode) {
      // Update the Ingredient by updating the shopping-list state and store the changes in the database
      this.store.dispatch(new shoppingListActions.UpdateIngredient({ index: this.curIngIndex, ingredient: newIngredient }));
      console.log("dispatched update" + this.curIngIndex)
      // Quit editmode by setting it to false
      this.editMode = false;
    }
    // Add a new Ingredient by updating the shopping-list state and store the changes in the database
    else this.store.dispatch(new shoppingListActions.AddIngredient(newIngredient));

    // Clear the form
    this.addIngredientForm.reset();
    // Hide the form
    this.showAddIng = false;
  }

  /**
   * Starts editing-mode to update the ingredient with the index @index in the current shoppingList state
   * or creates an empty form if no index was passed
   * @param index The index of the ingredient you want to edit
   */
  onEditItem(index: number = -1): void {
    // Display the form in the template
    this.showAddIng = true
    // If an index was passed
    if (index > -1) {
      this.curIngIndex = index
      this.editMode = true;
      // Get the ingredient with the index from the item list 
      const editedItem = this.ingredients[this.curIngIndex];
      // Create and fill the form with the selected ingredient data
      this.addIngredientForm = new FormGroup({
        name: new FormControl(editedItem.name, Validators.required),
        amount: new FormControl(editedItem.amount, [Validators.required, Validators.pattern("^[1-9]+[0-9]*$")]),
        unit: new FormControl(editedItem.unit, Validators.required)
      })
    }
    else {
      // No index passed
      this.curIngIndex = -1;
      // Create an empty form
      this.addIngredientForm = new FormGroup({
        name: new FormControl(null, Validators.required),
        amount: new FormControl(null, [Validators.required, Validators.pattern("^[1-9]+[0-9]*$")]),
        unit: new FormControl(null, Validators.required)
      })
    }
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
  }

  printRecipe(): void {
    window.print();
  }
}
