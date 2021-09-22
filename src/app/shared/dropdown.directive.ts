import { Directive, HostBinding, HostListener, OnInit } from '@angular/core';

@Directive({
  selector: '[appDropdown]'
})
export class DropDownDirective {
  @HostBinding('class.open') classOpen = false;
  isOpen = false;
  @HostListener('click') click(eventData: Event): void {
    this.classOpen = !this.classOpen;
  }
}
