import { Directive, ElementRef, OnInit, Renderer2 } from '@angular/core';
/**
 * Add this directive to any element in your template, which should not be displayed when you print the page.
 * It adds the class 'dontPrint' to the Element. This class is styled in the main styles.scss file.
 */
@Directive({
    selector: '[appDontPrint]'
})
export class DontPrintDirective implements OnInit {

    constructor(private elRef: ElementRef, private renderer: Renderer2) { }
    ngOnInit(): void {
        this.renderer.addClass(this.elRef.nativeElement, 'dontPrint');
    }
}
