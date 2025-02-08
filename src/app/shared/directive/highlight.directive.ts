import { Directive, Input, ElementRef, OnInit, OnChanges, Renderer2 } from '@angular/core';

@Directive({
  selector: '[pbHighlight]',
  standalone:true,
})
export class HighlightDirective implements OnInit, OnChanges {
  @Input() value: string | any;
  constructor(
    private el: ElementRef,
    private renderer: Renderer2
  ) { }

  ngOnInit() {
    if (this.value == null || this.value == undefined || this.value == '' || this.value == '-' || this.value == 0) {
      if (this.el.nativeElement.classList.contains('back-rate')) {
        this.renderer.addClass(this.el.nativeElement, 'no-back-rate');
      } else {
        this.renderer.addClass(this.el.nativeElement, 'no-lay-rate');
      }
      
    }
  }
  ngOnChanges() {
    if (this.value != null && this.value != undefined && this.value !== '' && this.value !== '-' && this.value !== '0.00' &&  this.value !== 0) {
      this.renderer.removeClass(this.el.nativeElement, 'no-back-rate');
      this.renderer.removeClass(this.el.nativeElement, 'no-lay-rate');
      this.renderer.removeClass(this.el.nativeElement, 'spark');
      this.renderer.addClass(this.el.nativeElement, 'spark');
      window.setTimeout(() => {
        this.renderer.removeClass(this.el.nativeElement, 'spark');
      }, 500);
    } else {
      if (this.el.nativeElement.classList.contains('back-rate')) {
        this.renderer.addClass(this.el.nativeElement, 'no-back-rate');
      } else {
        this.renderer.addClass(this.el.nativeElement, 'lay-1');
        this.renderer.addClass(this.el.nativeElement, 'no-lay-rate');
      }
    }
  }
}
