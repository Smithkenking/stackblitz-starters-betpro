import { Directive, Input, ElementRef, OnChanges, Renderer2 } from '@angular/core';
import { DeviceInfoService } from '@clientApp-core/services/device-info/deviceinfo.services';

@Directive({
  selector: '[pbAutoFocus]',
  standalone: true,
})
export class FocusDirective implements OnChanges {
  @Input() value: any;
  constructor(
    private el: ElementRef,
    private renderer: Renderer2,
    private deviceInfoService: DeviceInfoService
  ) { }
  ngOnChanges() {
    window.setTimeout(() => {
      if (this.deviceInfoService.isDesktop()) {
        this.renderer.selectRootElement(this.el.nativeElement).focus();
      }
    }, 500);
  }
}