import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { B2cUserService, userProfileInfo } from '@clientApp-core/services/authentication/b2c-user.service';
import * as M from "materialize-css/dist/js/materialize";
import { untilDestroyed } from 'ngx-take-until-destroy';
import { throwError } from 'rxjs';
import { catchError, take } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { BonusService } from '@clientApp-core/services/authentication/bonus.service';
import { CampaignAction } from '@clientApp-core/enums/campaignaction.types';
import { CommonService } from '@clientApp-core/services/common/common.service';
import { DeviceInfoService } from '@clientApp-core/services/device-info/deviceinfo.services';
import { Router } from '@angular/router';
import { AuthFacadeService } from '@clientApp-core/services/authentication/authentication-facade.service';
declare var $:any;
@Component({
  selector: 'app-refer-earn',
  templateUrl: './refer-earn.component.html',
  styleUrls: ['./refer-earn.component.scss']
})
export class ReferEarnComponent implements OnInit {
  user: any;
  // referEarnInstances: any;
  userProfile: any;
  facebookSharerApi: string = '';
  twitterShareApi: string = '';
  campaignSubscriptionList: any = [];
  constructor(private b2cUserService: B2cUserService, private toastr: ToastrService,private authService: AuthFacadeService,private router: Router,
    private bonusService: BonusService, public commonService: CommonService,public deviceInfoService: DeviceInfoService) { }

  ngOnInit(): void {
    this.userProfile = userProfileInfo.data;
    this.facebookSharerApi = 'https://www.facebook.com/sharer/sharer.php?u=' + this.userProfile.appReferralUrl;
    this.twitterShareApi = 'https://twitter.com/intent/tweet?text=' + this.userProfile.appReferralUrl;
    this.b2cUserService.getUserInfo$().pipe(
      untilDestroyed(this),
      catchError(err => throwError(err))
    ).subscribe(response => {
      if (response.isSuccess) {
        this.userProfile = response.result.message;
        this.facebookSharerApi = 'https://www.facebook.com/sharer/sharer.php?u=' + this.userProfile.appReferralUrl;
        this.twitterShareApi = 'https://twitter.com/intent/tweet?text=' + this.userProfile.appReferralUrl;
      } else {
        this.toastr.error(response.result.message,"Notification",{
          toastClass: "custom-toast-error"
        });
      }
    }, err => console.log('getUserProfile', err));
    
    this.user = JSON.parse(localStorage.getItem('token'));
  }
  ngAfterViewInit(): void {
    const options = {
      dismissible: false,
      onCloseEnd() {
        $('body').css('overflow', '')
      }
    }
  }
  openLoginModel(){
    this.commonService.setLoginPopupOpen(true);
    }
  openPopup() {
    // if (this.user != null) {
    // this.getcampaign();
    // this.referEarnInstances.open();
    // } else {
    // this.openLoginModel();
    // }
  }
  close(){
    // let currentUrl = this.router.url.split('/');
    // let rne = currentUrl && currentUrl[2] ? currentUrl[2] : null;
    // if(rne !== null && rne == 'refer-n-earn'){
    //   this.router.navigate([currentUrl[1]]);
    // }
    // this.referEarnInstances.close();
  }
  trackByFun(index, item) {
    return index;
  }
  onCopyToClipboardClick(inputElement: HTMLInputElement) {
    const value = inputElement.value;
    const copyText = document.createElement('input');
    copyText.setAttribute('type', 'text');
    copyText.value = value;
    document.body.appendChild(copyText);
    copyText.select();
    copyText.setSelectionRange(0, 99999); /* For mobile devices */
    navigator.clipboard.writeText(copyText.value);
    document.body.removeChild(copyText);
    const notice = document.createElement('span');
    notice.className = 'notice visible';
    notice.innerHTML = 'Text copied to the clipboard!';
    document.body.appendChild(notice);
    setTimeout(() => {
      document.body.removeChild(notice);
    }, 3000);
  }
  getcampaign(){
    this.bonusService.getCampaignSubscriptionList().pipe(take(1)).subscribe(response => {
      if (response.isSuccess) {
        let campaign = response.result;
        this.campaignSubscriptionList = campaign.filter((item: any) => item.caeid == CampaignAction.RefferUser);
      }
    });
  }
  onWhatsappShareClick() {
    window.open('https://api.whatsapp.com/send?text='+ this.userProfile.appReferralUrl,'_blank');
  }
  ngOnDestroy(): void {
    
  }
}
