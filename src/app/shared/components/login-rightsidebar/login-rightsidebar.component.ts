import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
// import { Router } from '@angular/router';
import { BannerType, DCOBannerType } from '@clientApp-core/enums/banner.types';
import { AuthFacadeService, DCOBanner, GuestCasinoConfig } from '@clientApp-core/services/authentication/authentication-facade.service';
import { CommonService } from '@clientApp-core/services/common/common.service';
import { apiEndPointData } from '@clientApp-core/services/config/connfig.service';
import { DeviceInfoService } from '@clientApp-core/services/device-info/deviceinfo.services';
import { SharedModule } from '@clientApp-shared/shared.module';
import { untilDestroyed } from 'ngx-take-until-destroy';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import Swiper from "swiper";
import { LoadingEffectComponent } from "../loading-effect/loading-effect.component";
@Component({
    standalone: true,
    selector: 'app-login-rightsidebar',
    templateUrl: './login-rightsidebar.component.html',
    styleUrls: ['./login-rightsidebar.component.scss'],
    imports: [CommonModule, SharedModule, LoadingEffectComponent]
})
export class LoginRightsidebarComponent implements OnInit, AfterViewInit, OnDestroy {
  casinoGameMenu = [];
  selectedCasinoGame = [];
  ProviderList = [];
  FilterProviderList = [];
  casinoProviderItems: boolean[];
  selectedCasino: string = 'Live';
  isCasinoGameOpen: boolean = false;
  selectedTab = 'Home';
  logoUrl: any;
  isCheckedDarkTheme: boolean = apiEndPointData.data.isDarkTheme ? apiEndPointData.data.isDarkTheme : false;
  promotionSlides = [];
  isB2C: boolean;
  clsmarketBets: boolean;
  isDCOBanner: boolean = false;
  CheckDevice: boolean = false;
  constructor(private authService: AuthFacadeService, public commonService: CommonService, public router: Router, public deviceInfoService: DeviceInfoService) {
    this.commonService.getDarkThemeStatus().subscribe(isChecked => {
      this.isCheckedDarkTheme = isChecked;
      this.checkIsDarkThemeExists();
    });
  }

  ngOnInit() {
    this.CheckDevice = window.matchMedia("only screen and (max-width: 576px)").matches;
    this.isDCOBanner = apiEndPointData.data.isDB;
    const currentUrl = this.router.url;
    if (currentUrl.indexOf('/event') !== -1) {
      this.clsmarketBets = true;
    } else {
      this.clsmarketBets = false;
    }
    this.authService.getDcoBanner$().pipe(
      untilDestroyed(this),
      catchError(err => throwError(err))
    ).subscribe(response => {
      if (response.success) {
        this.banner();
      }
    }, err => console.log('getDcoBanner', err));
    this.banner();
    this.getGuestCasinoConfig();
    this.setCasinoSettings();
    this.checkIsDarkThemeExists();
    this.isB2C = apiEndPointData.data.isB2C;
    const currentState = sessionStorage.getItem('isCasinoGameOpen');
    if (currentState != null && JSON.parse(currentState).isCasinoGameOpen) {
      this.isCasinoGameOpen = true;
      this.selectedTab = 'Casino';
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
  getGuestCasinoConfig() {
    this.authService.getGuestCasinoConfig$()
      .pipe(
        untilDestroyed(this),
        catchError(err => throwError(err))
      ).subscribe(response => {
        if (response) {
          this.setCasinoSettings();
        }
      }, err => console.log('getConfig', err));
  }
  setCasinoSettings() {
    this.casinoGameMenu = GuestCasinoConfig.data.casinoMenu ? GuestCasinoConfig.data.casinoMenu : [];
    this.selectedCasinoGame =  this.casinoGameMenu.filter(x => x.ci == 1);
    this.ProviderList = GuestCasinoConfig.data.providerList ? GuestCasinoConfig.data.providerList : [];
    this.FilterProviderList = Object.assign([], this.ProviderList.filter(x=>x.appIsShowOnDashboard));
    this.casinoProviderItems = new Array(this.FilterProviderList.length);
    this.casinoProviderItems.fill(false);
  }
  errorHandler(event) {
    event.target.src = this.commonService.contentRelativePath('assets/images/casinoimg/default.jpg');
  }

  onCasinoTabClick(selectedTab: string) {
    this.selectedCasino = selectedTab;
    const casinoMenu = Object.assign([], this.casinoGameMenu);
    if (selectedTab == 'Providers') {
      this.FilterProviderList = Object.assign([], this.FilterProviderList);
      this.casinoProviderItems = new Array(this.FilterProviderList.length);
      this.casinoProviderItems.fill(false);
    } else if (selectedTab == 'Live') {
     this.selectedCasinoGame =  casinoMenu.filter(x => x.ci == 1);
    } else if (selectedTab == 'Virtual') {
      this.selectedCasinoGame =  casinoMenu.filter(x => x.ci == 4);
    }
  }

  trackByFn(index, item) {
    return item.eid;
  }

  trackByFun(index, item) {
    return index;
  }

  checkIsDarkThemeExists() {
    if (this.isCheckedDarkTheme) {
      this.logoUrl = apiEndPointData.data.lightLogoUrl;
    } else {
      this.logoUrl = apiEndPointData.data.darkLogoUrl;
    }
  }

  banner() {
    if (this.isDCOBanner) { 
      const banners = DCOBanner.data ? DCOBanner.data : [];
      this.promotionSlides = banners.filter(x => x.position == 'Promotion' && (x.displayType === DCOBannerType.Before_Login || x.displayType == DCOBannerType.Before_and_After_Login));
    } else {
    const banners = apiEndPointData.data.banners ? apiEndPointData.data.banners : [];
    this.promotionSlides = banners.filter(x => x.bt === BannerType.Right_Promotion_befor_login || x.bt === BannerType.Right_Promotion_Before_and_After_Login).sort(function(a, b) {
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

  onCasinoGameClick(item) {
    let casinoMenu: any = {};
    casinoMenu.name = item.nm;
    casinoMenu.icon = item.ic;
    casinoMenu.isActive = item.ia;
    casinoMenu.isShow = item.isw;
    casinoMenu.types = item.ty;
    casinoMenu.isNewGame = item.ing;
    casinoMenu.gameCode = item.gc;
    casinoMenu.apiParamName = item.apn;
    casinoMenu.apiEndPoint = item.aep;
    casinoMenu.categoryID = item.ci;
    casinoMenu.displayOrder = item.dor;
    casinoMenu.appCasinoGameID = item.cgi;
    casinoMenu.appProviderID = item.pid;
    casinoMenu.isPopular = item.isd;
    casinoMenu.gameType = item.gt;
    casinoMenu.providerName = item.pn;
    localStorage.setItem('casino', JSON.stringify(casinoMenu));
    const eventName = ((item.pn.trim())).replace(/\s/g, '');
    this.openLoginModel();
  }


  onProviderClick(game) {
    this.router.navigate(['live-casino', game.appProviderName]);
  }

  providerMouseEvent(index, value) {
    this.casinoProviderItems[index] = value;
  }


  openLoginModel() {
    this.commonService.setLoginPopupOpen(true);
  }
  onBannerClick(slide: any) {
    if (slide && slide.url !== null && slide.url !== undefined && slide.url !== '') {
      window.open(slide.url, '_blank');
    } else if (slide && slide.mi !== null && slide.mi !== undefined && slide.mi !== '' && slide.mi !== 0) {
      this.router.navigate(['event', slide.mi]);
    }

  }
  ngOnDestroy(): void {

  }
}
