import { Component, OnDestroy, OnInit } from '@angular/core';
import { CampaignApplyOn } from '@clientApp-core/enums/CampaignApplyOn-types';
import { BonusService } from '@clientApp-core/services/authentication/bonus.service';
import { DeviceInfoService } from '@clientApp-core/services/device-info/deviceinfo.services';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import * as M from "materialize-css/dist/js/materialize";
import { CommonService } from '@clientApp-core/services/common/common.service';
import { ActivatedRoute, Router } from '@angular/router';
import { apiEndPointData } from '@clientApp-core/services/config/connfig.service';
import { LandingPageBT } from '@clientApp-core/enums/banner.types';
@Component({
  selector: 'app-login-promotion',
  templateUrl: './login-promotion.component.html',
  styleUrls: ['./login-promotion.component.scss']
})
export class LoginPromotionComponent implements OnInit,OnDestroy {
  CampaignList: any = [];
  filterCampaignList: any = [];
  activeCampaign: string = 'All';
  isShowDetailPage: boolean = false;
  CampaignDetailList: any;
  routeSubscription: any;
  cid: any;
  topBanner: any;
  PromotionImages: any;
  SportsCasinoImg: any;
  paymentImg: any;
  constructor(private bonusService: BonusService, public deviceInfoService: DeviceInfoService,
    public commonService: CommonService, private route: ActivatedRoute,private router: Router) {
      this.routeSubscription = this.route.params.pipe().subscribe((params) => {
        if (params && !this.isEmpty(params)) {
          this.cid = +params['cid'];
          this.onDetailClick(+params['cid']);
         }
    });
     }

  ngOnInit() {
    this.getBanner();
    this.GetCampaignList();
  }
  GetCampaignList() {
    this.commonService.setLoadingStatus(true);
    this.bonusService.getCampaignList().pipe(catchError(err => throwError(err))).subscribe((reponse: any) => {
      if (reponse.isSuccess) {
        this.CampaignList = reponse.result;
        this.onCampaignClick(this.activeCampaign);
        if (this.cid) {
          this.onDetailClick(this.cid);
        }
      }
      this.commonService.setLoadingStatus(false);
    }, err =>{ this.commonService.setLoadingStatus(false); console.log('GetCampaignList', err)});
  }
  onCampaignClick(campaign) {
    this.activeCampaign = campaign;
    if (campaign === 'Sports') {
      this.filterCampaignList = this.CampaignList.filter(x => x.cao == CampaignApplyOn.Sport || x.cao == CampaignApplyOn.Both);
    } else if (campaign === 'Casino') {
      this.filterCampaignList = this.CampaignList.filter(x => x.cao == CampaignApplyOn.Casino || x.cao == CampaignApplyOn.Both);
    } else {
      this.filterCampaignList = Object.assign([],this.CampaignList);
    }
  }
  onDetailClick(cid) {
    this.isShowDetailPage = true;
    this.CampaignDetailList = this.CampaignList.find(x => x.cid == cid);
    this.router.navigate(['/campaign', cid]);
    setTimeout(() => {
      var elemsTabs = document.querySelectorAll('.tabs');
      var tabinstances = M.Tabs.init(elemsTabs, {});
    }, 0);
  }
   getBanner() {
      const bannerData = apiEndPointData.data.banners ? apiEndPointData.data.banners : [];
      if (bannerData && bannerData.length > 0) {
        this.topBanner = this.shuffleArray(bannerData.filter(first => first.bt === LandingPageBT.LP_Top_Banner));
        this.PromotionImages = bannerData.filter(second => second.bt === LandingPageBT.LP_Promotion_Images);
        this.SportsCasinoImg = bannerData.filter(third => third.bt === LandingPageBT.LP_Sports_Casino);
        this.paymentImg = bannerData.find(four => four.bt === LandingPageBT.LP_Payment);
      }
    }
    shuffleArray(array) {
      var m = array.length, t, i;
  
      while (m) {
        i = Math.floor(Math.random() * m--);
        t = array[m];
        array[m] = array[i];
        array[i] = t;
      }
  
      return array;
    }
    onBannerClick(slide: any) {
      if (slide && slide.url !== null && slide.url !== undefined && slide.url !== '') {
        window.open(slide.url, '_self');
      } else if (slide && slide.mi !== null && slide.mi !== undefined && slide.mi !== '' && slide.mi !== 0) {
        this.router.navigate(['event', slide.mi]);
      }
    }
  onPlayNowClick() {
    this.commonService.setLoginPopupOpen(true);
  }
  trackByFun(index, item) {
    return index;
  }
  backToPromo() {
    this.isShowDetailPage = false; 
    this.router.navigate(['campaign']);
  }
  isEmpty(obj) {
    for (var key in obj) {
      if (obj.hasOwnProperty(key))
        return false;
    }
    return true;
  }
  ngOnDestroy(): void {
    
  }
}
