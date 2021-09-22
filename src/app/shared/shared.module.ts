import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { DropDownDirective } from './dropdown.directive';
import { LoadingSpinnerComponent } from './loading-spinner/loading-spinner.component';
import { DontPrintDirective } from './dont-print.directive';
import { FilterPipe } from './filter.pipe';


@NgModule({
    declarations: [
        DropDownDirective,
        LoadingSpinnerComponent,
        DontPrintDirective,
        FilterPipe,
    ],
    imports: [CommonModule],
    exports: [
        DropDownDirective,
        LoadingSpinnerComponent,
        CommonModule,
        DontPrintDirective,
        FilterPipe
    ]
})
export class SharedModule { }
