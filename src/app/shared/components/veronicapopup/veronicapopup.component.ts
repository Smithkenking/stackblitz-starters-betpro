import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { DeviceInfoService } from '@clientApp-core/services/device-info/deviceinfo.services';
import { apiEndPointData } from '@clientApp-core/services/config/connfig.service';
import * as M from "materialize-css/dist/js/materialize";
import { BannerType } from '@clientApp-core/enums/banner.types';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@clientApp-shared/shared.module';
declare var $: any;
@Component({
  standalone: true,
  imports:[CommonModule,SharedModule],
  selector: 'app-veronicapopup',
  templateUrl: './veronicapopup.component.html',
  styleUrls: ['./veronicapopup.component.css']
})
export class VeronicapopupComponent implements OnInit {
  @ViewChild('veronica', { static: true }) template: ElementRef;
  modalInstances: any;
  casinoWebImg: string;
  casinoMobImg: string;
  casinoRedirectURL: string;
  constructor(public deviceInfoService: DeviceInfoService, public router: Router) {
  }

  ngOnInit() {
    const user = JSON.parse(localStorage.getItem('token'));
    if (user != null) {
      const banner = user.banner;
      const webBanner = banner.find(x => x.appBannerType === BannerType.AfterLogin_Popup && x.appIsforWebView == true);
      const mobBanner = banner.find(x => x.appBannerType === BannerType.AfterLogin_Popup && x.appIsforMobileView == true);
      this.casinoWebImg = webBanner ? webBanner.appBannerImage : '';
      this.casinoMobImg = mobBanner ? mobBanner.appBannerImage : '';
    }
    this.casinoRedirectURL = apiEndPointData.data.casinoRedirectURL;
  }
  hideModal() {
    this.modalInstances.close();
  }
  openPopup() {
    const options = {
      onCloseEnd() {
        $('body').css('overflow', '')
      }
    }
    if(this.modalInstances) {
      this.modalInstances.destroy();
    }
    this.modalInstances = M.Modal.init(this.template.nativeElement, options);
    this.modalInstances.open();
    localStorage.setItem('showVeronicaPopup', '1');
  }
  onPlaynowClick() {
    this.modalInstances.close();
    this.router.navigateByUrl('/live-casino'); 
  }
}
