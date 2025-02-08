import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
// import { Router } from '@angular/router';
import { BannerType } from '@clientApp-core/enums/banner.types';
import { Match } from '@clientApp-core/models/market/match.model';
import { AuthFacadeService, DCOBanner, websiteSettings } from '@clientApp-core/services/authentication/authentication-facade.service';
import { CommonService } from '@clientApp-core/services/common/common.service';
import { apiEndPointData } from '@clientApp-core/services/config/connfig.service';
import { DeviceInfoService } from '@clientApp-core/services/device-info/deviceinfo.services';
import { MarketFacadeService } from '@clientApp-core/services/market/market-facade.service';
import { MarketRateFacadeService } from '@clientApp-core/services/market/market-rates/market-rate-facade.service';
import { SharedModule } from '@clientApp-shared/shared.module';
import { untilDestroyed } from 'ngx-take-until-destroy';
import { Subject, throwError } from 'rxjs';
import { catchError, takeUntil } from 'rxjs/operators';
declare var $: any;
import Swiper from "swiper";
import { MatchedbetComponent } from "../matchedbet/matchedbet.component";
import { RecentActivityComponent } from "../recent-activity/recent-activity.component";
import { SafePipe } from "../../pipes/safe.pipe";
import { BetPanelLayoutComponent } from 'app/features/market/bet-panel-layout/bet-panel-layout.component';
import { MarketPlaceBetViewsComponent } from 'app/features/market/place-bet-views/market-place-bet-views/market-place-bet-views.component';
import { SessionPlaceBetViewsComponent } from 'app/features/market/place-bet-views/session-place-bet-views/session-place-bet-views.component';
import { LiveCasinoGamesComponent } from "../live-casino-games/live-casino-games.component";
@Component({
    standalone: true,
    selector: 'app-rightsidebar',
    templateUrl: './rightsidebar.component.html',
    styleUrls: ['./rightsidebar.component.scss'],
    imports: [CommonModule, SharedModule, MatchedbetComponent, RecentActivityComponent, SafePipe, BetPanelLayoutComponent, MarketPlaceBetViewsComponent, SessionPlaceBetViewsComponent, LiveCasinoGamesComponent]
})
export class RightsidebarComponent implements OnInit,AfterViewInit, OnDestroy {
  selectedCategory: string = 'Betlist';
  matchBetCount = 0;
  unMatchBetCount = 0;
  videoUrl = 'assets/flashphoner/player.html';
  matchId: any;
  ipAddress: string = '';
  channelno: any;
  host = websiteSettings.data.appVideoLink;
  StreamNamePreFix = websiteSettings.data.appStreamPreFix;
  matchInfo: Match;
  yt: any;
  showTV = false;
  promotionSlides = [];
  isDCOBanner: boolean = false;
  isShowBetSlipBelowRunner: boolean;
  notifier = new Subject();
  constructor(private marketRateFacadeService: MarketRateFacadeService, private marketFacadeService: MarketFacadeService,
    public commonService: CommonService,private authService: AuthFacadeService, public deviceInfoService: DeviceInfoService, public router: Router) {
    this.marketRateFacadeService.getMatchBetCount$().pipe(takeUntil(this.notifier),untilDestroyed(this)).subscribe(matchcount => {
      this.matchBetCount = matchcount;
    });
    this.marketRateFacadeService.getUnMatchBetCount$().pipe(takeUntil(this.notifier),untilDestroyed(this)).subscribe(unmatchcount => {
      this.unMatchBetCount = unmatchcount;
    });
   }

  ngOnInit(): void {
    this.isShowBetSlipBelowRunner = websiteSettings.data.isShowBetSlipBelowRunner;
    this.isDCOBanner = apiEndPointData.data.isDB;
    this.getConfig();
    this.host = websiteSettings.data.appVideoLink;
    this.StreamNamePreFix = websiteSettings.data.appStreamPreFix;
    this.marketFacadeService.getVideo$().subscribe(matchid => {
      if (this.matchId !== matchid) {
        this.showTV = false;
      } 
      this.matchId = matchid;
      this.matchInfo = Object.assign([], this.marketRateFacadeService.curMatchInfo.find(x => x.eid == matchid));
      this.videoUrl = 'assets/flashphoner/player.html';
      if (this.matchInfo && this.matchInfo.ei &&this.matchInfo.ep === true && this.matchInfo.ev !== '') {
        this.showTV = !this.showTV;
        this.videoUrl = this.matchInfo.ev;
        var field = 'twitch.tv';
        var url = this.matchInfo.ev;
        if (url.indexOf(field) > -1) {
          if (url.indexOf('parent=#domain#') > -1) {
            const splitArr = url.split('parent=#domain#');
            const origin = window.location.origin.replace(/^https?\:\/\//i, "");
            this.videoUrl = splitArr[0] + 'parent=' + origin;
          }
        }
              
        this.yt = '<iframe class="w-100" src="' + this.videoUrl
          + '" frameborder="0" allow="autoplay; encrypted-media"  scrolling="no" width="100%" height="220" allowfullscreen="true" webkitallowfullscreen="true" mozallowfullscreen="true"></iframe>';
      }
      else if (this.matchInfo && this.matchInfo.ei && this.matchInfo.ec != null) {
        this.showTV = !this.showTV;
        this.channelno = this.matchInfo.ec;
        const channelnoList = apiEndPointData.data.channelnoList ? apiEndPointData.data.channelnoList : [];
        const isNumberExitst = channelnoList.includes(+this.channelno);
        if (isNumberExitst == null || isNumberExitst == undefined || !isNumberExitst) {
          if (this.commonService.ipAddress && this.commonService.ipAddress.length > 0) {
            this.videoUrl = websiteSettings.data.externalVideoUrl + this.matchInfo.ec + "&ip=" + this.commonService.ipAddress;
            this.yt = '<iframe class="w-100" src="' + this.videoUrl
            + '" frameborder="0" allow="autoplay; encrypted-media"  scrolling="no" width="100%" height="220" allowfullscreen="true" webkitallowfullscreen="true" mozallowfullscreen="true"></iframe>';
          } else {
            this.getIp();
          }
        } else {
          this.videoUrl = 'assets/flashphoner/player.html';
          this.yt = '<iframe class="w-100" src="' + this.videoUrl
          + '" frameborder="0" allow="autoplay; encrypted-media"  scrolling="no" width="100%" height="220" allowfullscreen="true" webkitallowfullscreen="true" mozallowfullscreen="true"></iframe>';
        } 
      } else {
        this.showTV = false;
      }
    });
    this.banner();
    if (this.router.url.indexOf('/event') !== -1) {
      this.selectedCategory = 'Betlist';
    } else {
      this.selectedCategory = 'Promotions';
    }
  }
  ngAfterViewInit(): void {
    setTimeout(() => {
      var promoSlider = new Swiper('.promo-slider', {
        loop: true,
        slidesPerView: 1,
        centeredSlides: true,
        autoplay:{ delay: 5000,}
        
      });
    }, 1000);
  }
  getIp(){
    const self = this, url = websiteSettings.data.ipAddApi ? websiteSettings.data.ipAddApi : apiEndPointData.data.ipAddApi;
    var ip =  $.getJSON(url, function (data: any) {
      self.commonService.ipAddress = data.ip;
      self.videoUrl = websiteSettings.data.externalVideoUrl + self.matchInfo.ec + "&ip=" + data.ip;
      self.yt = '<iframe class="w-100" src="' + self.videoUrl
      + '" frameborder="0" allow="autoplay; encrypted-media"  scrolling="no" width="100%" height="205" marginheight="0" marginwidth="0" allowfullscreen="true" webkitallowfullscreen="true" mozallowfullscreen="true"></iframe>';
    }).fail(function(ex){
      console.log('market comp getIp',ex.responseText);
   });
  }
  getConfig() {
    this.authService.getConfig$()
      .pipe(
        untilDestroyed(this),
        catchError(err => throwError(err))
      ).subscribe(response => {
        if (response) {
          this.commonService.configData = response;
          this.host = websiteSettings.data.appVideoLink;
          this.StreamNamePreFix = websiteSettings.data.appStreamPreFix;
        }
      }, err => console.log('getConfig', err));
  }
  onClickCategory(category) {
    this.selectedCategory = category;
  }
  banner() {
    if (this.isDCOBanner) { 
      const banners = DCOBanner.data ? DCOBanner.data : [];
      this.promotionSlides = banners.filter(x => x.position == 'Promotion');
    } else {
    const banners = apiEndPointData.data.banners ? apiEndPointData.data.banners : [];
    this.promotionSlides = banners.filter(x => x.bt === BannerType.Right_Promotion_after_login || x.bt === BannerType.Right_Promotion_Before_and_After_Login).sort(function(a, b) {
      return a.dor - b.dor;
    });
    if (this.deviceInfoService.isMobile()) {
      this.promotionSlides = this.promotionSlides.filter(x => x.imv);
    } else {
      this.promotionSlides = this.promotionSlides.filter(x => x.iwv);
      }
    }
  }
  onDCOBannerClick(slide: any) {
    if (slide && slide.redirecturl !== null && slide.redirecturl !== undefined && slide.redirecturl !== '') {
      window.open(slide.redirecturl, slide.targetWindow);
    }
  }
  onBannerClick(slide: any) {
    if (slide && slide.url !== null && slide.url !== undefined && slide.url !== '') {
      window.open(slide.url, '_blank'); 
    } else if (slide && slide.mi !== null && slide.mi !== undefined && slide.mi !== '' && slide.mi !== 0) {
      this.router.navigate(['event', slide.mi]);
    }
  }
  setLiveTvMode(value) {
    if(value) {
      this.commonService.isShowLiveTvCenter = true;
    } else { this.commonService.isShowLiveTvCenter = false; }
  }
  trackByFun(index, item) {
    return index;
  }
  ngOnDestroy(): void {
    this.notifier.next();
    this.notifier.complete();
  }
}
