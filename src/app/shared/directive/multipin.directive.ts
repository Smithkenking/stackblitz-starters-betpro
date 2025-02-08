import { Directive, Input, ElementRef, OnInit, OnChanges, Renderer2 } from '@angular/core';

@Directive({
  selector: '[pbMultiPin]',
  standalone:true,
})
export class MultiPinDirective implements OnInit, OnChanges  {
 @Input() matchId: number;
  constructor(
    private el: ElementRef,
    private renderer: Renderer2
  ) { }

  ngOnInit() {
  }
   ngOnChanges() {
     window.setTimeout(() => {

    if (this.checkIsMultiPin(this.matchId)) {
      this.renderer.addClass(this.el.nativeElement, 'active');
    } else {
      this.renderer.removeClass(this.el.nativeElement, 'active');
    }
    }, 500);
  }
  checkIsMultiPin(matchId: number) {
    const   multiSelectedMatch = JSON.parse(localStorage.getItem('multiselected_matchIds'));

    if (multiSelectedMatch !== null && multiSelectedMatch.length > 0) {
      return this.checkAvailability(multiSelectedMatch, matchId);
    } else {
        return false;
    }
  }
  checkAvailability(arr, val) {
    return arr.some(arrVal => val === arrVal);
  }
}
