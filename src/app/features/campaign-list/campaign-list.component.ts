import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { CampaignApplyOn } from '@clientApp-core/enums/CampaignApplyOn-types';
import { BonusService } from '@clientApp-core/services/authentication/bonus.service';
import { CommonService } from '@clientApp-core/services/common/common.service';
import { untilDestroyed } from 'ngx-take-until-destroy';
import { throwError } from 'rxjs';
import { catchError, take } from 'rxjs/operators';
import * as M from "materialize-css/dist/js/materialize";
import { ActivatedRoute, Router } from '@angular/router';
import { AuthFacadeService } from '@clientApp-core/services/authentication/authentication-facade.service';
import { LandingPageBT } from '@clientApp-core/enums/banner.types';
import { apiEndPointData } from '@clientApp-core/services/config/connfig.service';

declare var $: any;
@Component({
  selector: 'app-campaign-list',
  templateUrl: './campaign-list.component.html',
  styleUrls: ['./campaign-list.component.scss']
})
export class CampaignListComponent implements OnInit, AfterViewInit, OnDestroy {
  CampaignList: any = [];
  filterCampaignList: any = [];
  activeCampaign: string = 'All';
  isNewsExits: boolean;
  isShowDetailPage: boolean = false;
  CampaignDetailList: any;
  routeSubscription: any;
  cid: any;
  topBanner: any;
  PromotionImages: any;
  SportsCasinoImg: any;
  paymentImg: any;
  constructor(private bonusService: BonusService, private router: Router,
    public commonService: CommonService, private authFacadeService: AuthFacadeService, private route: ActivatedRoute) {
    this.routeSubscription = this.route.params.pipe().subscribe((params) => {
      if (params && !this.isEmpty(params)) {
        if (params['cid']) {
          this.cid = +params['cid'];
          this.onDetailClick(+params['cid']);
        }
      }
    });
  }

  ngOnInit() {
    this.getBanner();
    this.GetCampaignList();
    this.isNewsExits = this.commonService.isNewsExits;
    this.getNews();
  }
  ngAfterViewInit(): void {
    if ($('.iconMenu-bar').hasClass('open') && $(window).width() > 991) {
      $('main').addClass('sidebar-open');
    }
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
    }, err => { this.commonService.setLoadingStatus(false); console.log('GetCampaignList', err) });
  }
  onCampaignClick(campaign) {
    this.activeCampaign = campaign;
    if (campaign === 'Sports') {
      this.filterCampaignList = this.CampaignList.filter(x => x.cao == CampaignApplyOn.Sport || x.cao == CampaignApplyOn.Both);
    } else if (campaign === 'Casino') {
      this.filterCampaignList = this.CampaignList.filter(x => x.cao == CampaignApplyOn.Casino || x.cao == CampaignApplyOn.Both);
    } else {
      this.filterCampaignList = Object.assign([], this.CampaignList);
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
  backToPromo() {
    this.isShowDetailPage = false;
    this.router.navigate(['campaign']);
  }
  trackByFun(index, item) {
    return index;
  }
  getNews() {
    this.authFacadeService.getNews$()
      .pipe(
        untilDestroyed(this),
        take(1),
        catchError(err => throwError(err))
      ).subscribe(response => {
        if (response && response.length > 0) {
          this.isNewsExits = true;
          this.commonService.isNewsExits = true;
        }
      }, err => console.log('getNews', err));
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
  isEmpty(obj) {
    for (var key in obj) {
      if (obj.hasOwnProperty(key))
        return false;
    }
    return true;
  }
  ngOnDestroy(): void {
    this.routeSubscription.unsubscribe();
  }
}
