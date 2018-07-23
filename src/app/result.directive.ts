import { Directive, ViewContainerRef } from '@angular/core';

@Directive({
  selector: '[appResult]'
})
export class ResultDirective {
  constructor(public viewContainerRef: ViewContainerRef) { }

}
