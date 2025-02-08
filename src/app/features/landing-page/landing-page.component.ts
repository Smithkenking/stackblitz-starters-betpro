import { Component, Inject, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { apiEndPointData } from '@clientApp-core/services/config/connfig.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonService } from '@clientApp-core/services/common/common.service';
declare var $: any;
import { AuthFacadeService, casinoGameMenuSettings, GuestCasinoConfig, GuestMLConfig, websiteSettings } from "@clientApp-core/services/authentication/authentication-facade.service";
import { catchError, take, takeUntil } from "rxjs/operators";
import { Subject, throwError } from 'rxjs';
import { LandingPageBT } from '@clientApp-core/enums/banner.types';
import { B2cUserService } from '@clientApp-core/services/authentication/b2c-user.service';
import { untilDestroyed } from 'ngx-take-until-destroy';
import { MarketFacadeService } from '@clientApp-core/services/market/market-facade.service';
import { GetSortOrder, fancyRankOrder } from '@clientApp-core/utilities/app-configuration';
import Swiper, { Autoplay, Pagination } from "swiper";
import { CampaignAction } from '@clientApp-core/enums/campaignaction.types';
import { CampaignActionGroup } from '@clientApp-core/enums/CampaignActionGroup.type';
import { BonusService } from '@clientApp-core/services/authentication/bonus.service';
import { CasinoService } from '@clientApp-core/services/casino/casino.service';
import { ToastrService } from 'ngx-toastr';
Swiper.use([Autoplay, Pagination]);
@Component({
  selector: 'app-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.scss']
})
export class LandingPageComponent implements OnInit, OnDestroy {
  user: any;
  allMatches: any[] = [];
  isCheckedDarkTheme: boolean = false;
  referralcode: any = '';
  click_id: any = '';
  mkt: any = '';
  topBanner: any;
  PromotionImages: any;
  SportsCasinoImg: any;
  paymentImg: any;
  websiteName: string;
  mobileAppUrl: any;
  routeSubscription: any;
  isNewsExits: boolean;
  campaignSubscriptionList: any;
  ProviderList = [];
  depositAmt: any;
  logoUrl = apiEndPointData.data.logoUrl;
  APKlogoUrl = apiEndPointData.data.APKlogoUrl;
  notifier = new Subject();
  topBannerConfig = {
    slidesToShow: 1,
    infinite: true,
    arrows: false,
    dots: false,
    autoplay: true,
    autoplayTimeout: 2500,
  };
  clientSliderConfig = {
    slidesToShow: 5,
    infinite: true,
    arrows: true,
    dots: false,
    autoplay: true,
    autoplaySpeed: 100,
    speed: 8000,
    pauseOnHover: false,
    cssEase: 'linear',
    prevArrow: '<img src="images/pre-arrow.png">',
    nextArrow: '<img src="images/nexr-arrow.png">',
    appendArrows: $('.slider-arrow'),
    responsive: [
      {
        breakpoint: 1701,
        settings: {
          slidesToShow: 4
        }
      },
      {
        breakpoint: 1501,
        settings: {
          slidesToShow: 2.5
        }
      },
      {
        breakpoint: 1500,
        settings: {
          slidesToShow: 2.1
        }
      },
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2
        }
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1.5
        }
      },
      {
        breakpoint: 767,
        settings: {
          slidesToShow: 1
        }
      },

    ]
  }
  constructor(public router: Router, public commonService: CommonService,
    private authService: AuthFacadeService, private route: ActivatedRoute,
    private elementRef: ElementRef, private marketFacadeService: MarketFacadeService, private bonusService: BonusService,
    private toastr: ToastrService, private casinoService: CasinoService,) {
    this.route.queryParams.pipe(takeUntil(this.notifier)).subscribe(params => {
      if (params && params['referralcode'] && params['referralcode'] !== '' && apiEndPointData.data.isB2C) {
        this.commonService.setCookieValue('referralcodeset', JSON.stringify(params['referralcode']), 30);
        this.referralcode = params['referralcode'];
      } else if (params && params['mkt'] && params['mkt'] !== '' && apiEndPointData.data.isB2C) {
        this.mkt = params['mkt'];
      }
      if (params && params['click_id'] && params['click_id'] !== '' && apiEndPointData.data.isB2C) {
        this.click_id = params['click_id'];
      }
    });
    this.commonService.getDarkThemeStatus().pipe(takeUntil(this.notifier)).subscribe(isChecked => {
      this.isCheckedDarkTheme = isChecked;
      this.checkIsDarkThemeExists();

    });
    this.commonService.getLoginPopupOpen().pipe(takeUntil(this.notifier)).subscribe(isChecked => {
      if (isChecked) {
        this.redirectToLogin();
      }
    });
  }
  ngOnInit(): void {
    this.logoUrl = apiEndPointData.data.logoUrl;
    this.user = JSON.parse(localStorage.getItem('token'));
    this.mobileAppUrl = apiEndPointData.data.mau;
    const darkThemeCurrentState = this.commonService.getCookieValue('isCheckedDarkTheme');
    this.isCheckedDarkTheme = (darkThemeCurrentState != null && darkThemeCurrentState != undefined && darkThemeCurrentState != '') ? JSON.parse(darkThemeCurrentState).isCheckedDarkTheme : false;
    const origin = window.location.host;
    let url = origin.lastIndexOf(".") > -1 ? origin.substring(0, origin.lastIndexOf(".")) : origin;
    this.getBanner();
    this.websiteName = url.replace(/^(?:https?:\/\/)?(?:www\.)?/i, "");
    if (this.user != null) {
      this.getMarkets();
      this.allMatches = this.marketFacadeService.marketList;
      this.isNewsExits = this.commonService.isNewsExits;
      this.getCasinoConfig();
      this.getNews();
    } else {
      this.getGuestMLConfig();
      this.getGuestCasinoConfig();
      this.allMatches = GuestMLConfig.data.allActiveMarketList ? GuestMLConfig.data.allActiveMarketList : [];
    }
    this.getProviderList();
    this.GetCampaignActionList(CampaignActionGroup.Deposit);
  }
  redirectToLogin() {
    if (this.click_id && this.referralcode) {
      this.router.navigate(['/login'], { queryParams: { referralcode: this.referralcode, click_id: this.click_id } });
    } else if (this.click_id) {
      this.router.navigate(['/login'], { queryParams: { click_id: this.click_id } });
    } else if (this.referralcode) {
      this.router.navigate(['/login'], { queryParams: { referralcode: this.referralcode } });
    } else {
      this.router.navigate(['/login']);
    }
  }
  ngAfterViewInit(): void {
    setTimeout(() => {
      this.initOwlCarousel();
    }, 1000);
    if ($('.iconMenu-bar').hasClass('open') && $(window).width() > 991) {
      $('main').addClass('sidebar-open');
    }
    this.customscroll(".landing-top-section-scroll");
  }
  customscroll(classname) {
    setTimeout(() => {
      const scroll: any = document.querySelector(classname);
      var isDown = false;
      var scrollX;
      var scrollLeft;
      if (scroll) {
        // Mouse Up Function
        scroll.addEventListener("mouseup", () => {
          isDown = false;
          scroll.classList.remove("active");
        });

        // Mouse Leave Function
        scroll.addEventListener("mouseleave", () => {
          isDown = false;
          scroll.classList.remove("active");
        });

        // Mouse Down Function
        scroll.addEventListener("mousedown", (e) => {
          e.preventDefault();
          isDown = true;
          scroll.classList.add("active");
          scrollX = e.pageX - scroll.offsetLeft;
          scrollLeft = scroll.scrollLeft;
        });

        // Mouse Move Function
        scroll.addEventListener("mousemove", (e) => {
          if (!isDown) return;
          e.preventDefault();
          var element = e.pageX - scroll.offsetLeft;
          var scrolling = (element - scrollX) * 2;
          scroll.scrollLeft = scrollLeft - scrolling;
        });
      }

    }, 1000);
  }
  getGuestMLConfig() {
    this.authService.getMarketConfig$().pipe(takeUntil(this.notifier), catchError(err => throwError(err))).subscribe((response: any) => {
      if (response) {
        this.allMatches = response.allActiveMarketList.sort((a, b) => {
          return fancyRankOrder.get(b.mt) - fancyRankOrder.get(a.mt);
        }).sort(GetSortOrder('ed'));
      }
    }, err => console.log('getGuestMLConfig', err));
  }
  getMarkets() {
    this.marketFacadeService.getMarkets$()
      .pipe(takeUntil(this.notifier),
        untilDestroyed(this),
        catchError(err => throwError(err))
      ).subscribe(response => {
        if (response && response.length > 0) {
          this.allMatches = response;
        }
      }, err => console.log('left menu getMarkets', err));
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
  shuffle(list) {
    return list.reduce((p, n) => {
      const size = p.length;
      const index = Math.trunc(Math.random() * (size - 1));
      p.splice(index, 0, n);
      return p;
    }, []);
  };
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
  initOwlCarousel() {
    var bonusslider = new Swiper('#bonus-slider', {
      loop: true,
      slidesPerView: 1,
      centeredSlides: true,
      spaceBetween: 15,
      autoplay: { delay: 2000, disableOnInteraction: false },
      modules: [Autoplay, Pagination],
      pagination: {
        el: '.swiper-pagination',
        clickable: true,
      },
    });
    var promocarousel = new Swiper('#promo-carousel', {
      loop: true,
      slidesPerView: 4,
      // centeredSlides: true,
      spaceBetween: 15,
      autoplay: { delay: 2000, disableOnInteraction: false },
      modules: [Autoplay, Pagination],
      pagination: {
        el: '.swiper-pagination',
        clickable: true,
      },

      breakpoints: {
        320: {
          slidesPerView: 1.25,
          centeredSlides: true,
        },
        600: {
          slidesPerView: 2,
          centeredSlides: true,
        },
        993: {
          slidesPerView: 4,
          spaceBetween: 10,
        },
      }
    });
  }
  trackByFun(index, item) {
    return index;
  }
  onBannerClick(slide: any) {
    if (slide && slide.url !== null && slide.url !== undefined && slide.url !== '') {
      window.open(slide.url, '_self');
    } else if (slide && slide.mi !== null && slide.mi !== undefined && slide.mi !== '' && slide.mi !== 0) {
      this.router.navigate(['event', slide.mi]);
    }
  }
  getNews() {
    this.authService.getNews$()
      .pipe(
        untilDestroyed(this),
        take(1),
        catchError(err => throwError(err))
      ).subscribe(response => {
        if (response && response.length > 0) {
          this.isNewsExits = true;
        }
      }, err => console.log('getNews', err));
  }
  getGuestCasinoConfig() {
    this.authService.getGuestCasinoConfig$()
      .pipe(
        untilDestroyed(this),
        catchError(err => throwError(err))
      ).subscribe(response => {
        if (response) {
          this.getProviderList();
        }
      }, err => console.log('getConfig', err));
  }
  getCasinoConfig() {
    this.authService.getCasinoConfig$()
      .pipe(
        untilDestroyed(this),
        catchError(err => throwError(err))
      ).subscribe(response => {
        if (response) {
          this.getProviderList();
        }
      }, err => console.log('getConfig', err));
  }
  getProviderList() {
    if (this.user != null) {
      const ProviderList = casinoGameMenuSettings.data.providerList ? casinoGameMenuSettings.data.providerList : [];
      const tpGamePermission = websiteSettings.data.tpGamePermission ? websiteSettings.data.tpGamePermission : [];
      const filterProviderlist = ProviderList.filter(x => {
        return !tpGamePermission.includes(x.appTpGameRefType) && x.appIsShowOnDashboard;
      });
      this.ProviderList = Object.assign([], filterProviderlist);
    } else {
      const ProviderList = GuestCasinoConfig.data.providerList ? GuestCasinoConfig.data.providerList : [];
      this.ProviderList = ProviderList.filter(x => x.appIsActive);
    }
    this.customscroll(".landing-bottom-section-scroll");
  }
  onProviderClick(game) {
    this.router.navigate(['live-casino', game.appProviderName]);
  }
  onAviatorClick() {
    if (this.user != null) {
      const selectedProvider = 'Spribe';
      const selectedgame = 'Aviator';
      const casinoGameMenu = casinoGameMenuSettings.data.casinoMenu ? casinoGameMenuSettings.data.casinoMenu : [];
      const param = casinoGameMenu.find(x => x.name?.toLowerCase().replace(/\s/g, '') === selectedgame.toLowerCase().replace(/\s/g, '') &&
        x.providerName?.toLowerCase().replace(/\s/g, '') === selectedProvider.toLowerCase().replace(/\s/g, ''));
      if (param) {
        this.commonService.setLoadingStatus(true);
        this.casinoService.getCasinoToken(param);
        sessionStorage.setItem('isAviatorGameOpen', JSON.stringify({ isAviatorGameOpen: true }));
      } else {
        this.toastr.error('Game is currently disabled');
      }
    } else {
      const selectedProvider = 'Spribe';
      const selectedgame = 'Aviator';
      const casinoGameMenu = GuestCasinoConfig.data.casinoMenu ? GuestCasinoConfig.data.casinoMenu : [];
      const item = casinoGameMenu.find(x => x.nm?.toLowerCase().replace(/\s/g, '') === selectedgame.toLowerCase().replace(/\s/g, '') &&
        x.pn?.toLowerCase().replace(/\s/g, '') === selectedProvider.toLowerCase().replace(/\s/g, ''));
      if (item) {
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
        sessionStorage.setItem('isAviatorGameOpen', JSON.stringify({ isAviatorGameOpen: true }));
      }
      this.redirectToLogin();
    }
  }
  affiliateClick(){
    window.open('https://affiliate.playsta.com', '_blank');
  }
  GetCampaignActionList(GroupCode) {
    this.bonusService.GetCampaignActionList(GroupCode).pipe(catchError(err => throwError(err))).subscribe((response: any) => {
      if (response.isSuccess) {
        let campaign = response.result;
        this.campaignSubscriptionList = campaign.filter((item: any) => item.caeid == CampaignAction.FirstDeposite)[0];
      }
    }, err => { console.log('GetCampaignActionList', err) });
  }
  quickdeposit() {
    if (this.depositAmt) {
      this.router.navigate(['deposit', this.depositAmt]);
    }
  }
  checkIsDarkThemeExists() {
    if (this.isCheckedDarkTheme) {
      // document.body.classList.add('dark');
      this.logoUrl = apiEndPointData.data.lightLogoUrl;
    } else {
      // document.body.classList.remove('dark');
      this.logoUrl = apiEndPointData.data.darkLogoUrl;
    }
  }
  isEmpty(obj: any) {
    for (var key in obj) {
      if (obj.hasOwnProperty(key))
        return false;
    }
    return true;
  }
  ngOnDestroy(): void {

    this.elementRef.nativeElement.remove();
    if (apiEndPointData.data.isWALoginEnable) {
      const script = document.querySelector(
        'script[src="https://otpless.com/auth.js"]'
      );
      if (script) {
        document.body.removeChild(script);
      }
    }
    this.notifier.next();
    this.notifier.complete();
  }
}
