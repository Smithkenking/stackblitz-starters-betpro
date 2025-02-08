import { Directive, ElementRef, Input, OnChanges, OnInit, Renderer2, SimpleChanges } from '@angular/core';
import { CommonService } from '@clientApp-core/services/common/common.service';

@Directive({
  selector: '[appFavouritecasino]',
  standalone:true,
})
export class FavouritecasinoDirective implements OnInit, OnChanges  {
  @Input() casinoId: number;
  constructor( private el: ElementRef,
    private renderer: Renderer2,
    public commonService: CommonService) { }    
  ngOnInit(): void {    
  }
  ngOnChanges(changes: SimpleChanges): void {
    window.setTimeout(() => {
    if (this.checkIsMultiPin(this.casinoId)) {
      this.renderer.addClass(this.el.nativeElement, 'active');
    } else {
      this.renderer.removeClass(this.el.nativeElement, 'active');
    }
  }, 500);
  }
  checkIsMultiPin(casinoId: number) {
    const  multiSelectedCasino = this.commonService.FavoriteIds;
    if (multiSelectedCasino !== null && multiSelectedCasino.length > 0) {
       return  multiSelectedCasino.includes(casinoId);
    } else {
       return false;
    }
  }
}  