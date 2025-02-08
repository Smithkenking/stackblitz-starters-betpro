import { Component, OnInit, OnDestroy, Input, AfterViewInit, OnChanges, Output, EventEmitter, ViewChild, ElementRef } from "@angular/core";
declare var $: any;
// import { NavigationEnd, Router } from '@angular/router';
import { DeviceInfoService } from '@clientApp-core/services/device-info/deviceinfo.services';
import { apiEndPointData } from '@clientApp-core/services/config/connfig.service';
import { CommonService } from '@clientApp-core/services/common/common.service';
import { userProfileInfo } from "@clientApp-core/services/authentication/b2c-user.service";
import { SearchComponent } from "@clientApp-shared/components/search/search.component";
import { AuthFacadeService, DCOBanner, GuestMLConfig, websiteSettings } from "@clientApp-core/services/authentication/authentication-facade.service";
import { MarketFacadeService } from "@clientApp-core/services/market/market-facade.service";
import { untilDestroyed } from "ngx-take-until-destroy";
import { catchError, takeUntil } from "rxjs/operators";
import { Subject, throwError } from "rxjs";
import * as M from "materialize-css/dist/js/materialize";
import { OneClickComponent } from "@clientApp-shared/components/one-click/one-click.component";
import { ActiveMarket } from "@clientApp-core/models/market/activemarket.model";
import { arrayUniqueByKey } from "@clientApp-core/services/shared/JSfunction.service";
import { DCOBannerType, BannerType } from "@clientApp-core/enums/banner.types";
import { FanceType } from "@clientApp-core/enums/market-fancy.type";
import { Stake } from "@clientApp-core/models/bet/stake.model";
import { BetFacadeService } from "@clientApp-core/services/bet/bet.facade.service";
import { SessionService } from "@clientApp-core/services/session/session.service";
import { mapMarket, mapMatch } from "@clientApp-core/services/shared/dashboard-shared.service";
import { ToastrService } from "ngx-toastr";
import { CommonModule } from "@angular/common";
import { NavigationEnd, Router } from "@angular/router";
import { SharedModule } from "@clientApp-shared/shared.module";
import { SportsIconPipe } from "../../../pipes/sports-icon.pipe";

@Component({
  standalone: true,
  selector: "pb-left-sidebar",
  templateUrl: "./left.sidebar.component.html",
  styleUrls: ["./left.sidebar.component.css"],
  imports: [CommonModule, SharedModule, OneClickComponent, SearchComponent, SportsIconPipe]
})
export class LeftSidebarComponent implements OnInit, OnChanges, AfterViewInit, OnDestroy {
  @Input() allMatches: ActiveMarket[];
  @Input() markets: any;
  @Input() isNewsExits: boolean;
  @Output() openPopup = new EventEmitter();
  @Input() isSidemenuTrigger: boolean;
  @Input() isShowVirtualSports: boolean;
  user: any;
  mySubscription: any;
  currentMenuIndex: number = 0;
  currentTournamentIndex: number = 0;
  currentEsMenuIndex: number = 0;
  currentEsTournamentIndex: number = 0;
  excludeSport = [];
  excludeSports = [];
  logoUrl = apiEndPointData.data.logoUrl;
  excludeSportsMarket = [];
  excludeSportsList = [];
  sportList = [];
  upcomingMarkets = [];
  isListwithTournament: boolean;
  websitesettings: any;
  selectedSport = "Home";
  activeAllSportsTab: boolean = true;
  activeInPlayTab: boolean = false;
  activeUpcomingTab: boolean = false;
  selectedTab = "allsports";
  isWager: boolean;
  isAutowagerPlacebet: boolean;
  isDarkTheme: boolean = false;
  searchStr: string;
  promotionSlides = [];
  dashboardConfig = {
    dots: false,
    infinite: true,
    autoplay: true,
    autoplaySpeed: 5000,
    speed: 500,
    arrows: false,
    cssEase: 'ease-in-out',
    swipeToSlide: true,
    slidesToShow: 1
  };
  isDCOBanner: boolean = false;
  isPromotionSlides: boolean = false;
  selectedMatchcookie: any = [];
  isB2C: boolean;
  notifier = new Subject();
  @ViewChild('searchInput') searchInput: ElementRef;
  @ViewChild('searchInput') searchElement: ElementRef;
  @ViewChild('search', { static: true }) searchRef: SearchComponent;
  @ViewChild('oneclick', { static: true }) oneclickRef: OneClickComponent;
  constructor(private router: Router,
    private toastr: ToastrService,
    private authService: AuthFacadeService,
    private sessionService: SessionService,
    private betService: BetFacadeService,
    public commonService: CommonService,
    private deviceInfoService: DeviceInfoService
  ) {
    this.commonService.getDarkThemeStatus().pipe(takeUntil(this.notifier)).subscribe(isChecked => {
      this.checkIsDarkThemeExists(isChecked);
  });
    if (this.router.getCurrentNavigation()?.extras.state) {
      const routeState = this.router.getCurrentNavigation().extras.state;
      if (routeState) {
        if (routeState.data.name == 'search') {
          setTimeout(() => {
            this.searchElement.nativeElement.focus();
          }, 500);
        }
      }
    }
    this.mySubscription = this.router.events.subscribe(val => {
      if (val instanceof NavigationEnd) {
        this.initSideMenu();
      }
    });
  }

  ngOnInit() {
    this.isB2C = apiEndPointData.data.isB2C;
    this.isDCOBanner = apiEndPointData.data.isDB;
    this.excludeSports = apiEndPointData.data.excludeSports;
    this.excludeSport = this.excludeSports.map(x => x.name);
    this.excludeSportsMarket = this.allMatches.filter((v) => this.excludeSport.includes(v.st));
    this.getSettings();
    this.getConfig();
    // const darkThemeCurrentState = this.commonService.getCookieValue('isCheckedDarkTheme');
    // this.isDarkTheme = (darkThemeCurrentState != null && darkThemeCurrentState != undefined && darkThemeCurrentState != '') ? JSON.parse(darkThemeCurrentState).isCheckedDarkTheme : (apiEndPointData.data.isDarkTheme ? apiEndPointData.data.isDarkTheme : false);;
    this.commonService.getDarkThemeStatus().subscribe(isChecked => {
      this.isDarkTheme = isChecked;
    });
    this.authService.getDcoBanner$().pipe(
      untilDestroyed(this),
      catchError(err => throwError(err))
    ).subscribe(response => {
      if (response.success) {
        this.banner();
      }
    }, err => console.log('getDcoBanner', err));
    this.banner();
    if (this.user != null) {
      this.isWager = !websiteSettings.data.appIsRealBalanceUse;
      this.isAutowagerPlacebet = websiteSettings.data.appIsAutowagerPlacebet;
    }
    const darkThemeCurrentState = this.commonService.getCookieValue('isCheckedDarkTheme');
    const isCheckedDarkTheme = (darkThemeCurrentState != null && darkThemeCurrentState != undefined && darkThemeCurrentState != '') ? JSON.parse(darkThemeCurrentState).isCheckedDarkTheme : false;
    this.checkIsDarkThemeExists(isCheckedDarkTheme);
  }
  redirectTo(path) {
    if (this.deviceInfoService.isMobile()) {
      const customSidenav = document.querySelector(".custom-sidenav");
      document.querySelector(".sidenav").classList.remove("sidenav-close");
      document.querySelector(".sidenav").classList.remove("sidenav-open");
      if (customSidenav && customSidenav.classList.contains('sidenav-overlay')) {
        document.querySelector(".custom-sidenav").classList.remove('sidenav-overlay');
      }
    }
    if (websiteSettings.data.isReportPageOpenInNewTab) {
      let newRelativeUrl = this.router.createUrlTree([path]);
      let baseUrl = window.location.href.replace(this.router.url, '');
      window.open(baseUrl + newRelativeUrl, '_blank');
    } else {
      this.commonService.setCasinoOpenStatus(false);
      this.router.navigateByUrl(path);
    }

  }
  ngOnChanges() {
    $('.collapsible li.active').removeClass('active');
    this.currentMenuIndex = 0;
    this.currentEsMenuIndex = 0;
    this.excludeSportsMarket = this.allMatches.filter((v) => this.excludeSport.includes(v.st));
    this.excludeSportsList = mapMarket(this.excludeSportsMarket);
    this.getSettings();
    if (this.markets && this.markets.length > 0) {
      this.initCollapsible();
    }
    this.initSideMenu();
  }
  ngAfterViewInit() {
    setTimeout(() => {
      this.initSideMenu();
    }, 1000);
    this.initCollapsible();
    var tooltippedElems = document.querySelectorAll('.tooltipped');
    var instances = M.Tooltip.init(tooltippedElems, {});  
  }
  private initSideMenu() {
    $('body,html').click(function (e) {
      var $this = $(".iconsidebar-menu-mobile");
      if ($this.hasClass('iconsidebar-menu-mobile')) {
        $this.removeClass('iconsidebar-menu-mobile');
      }
      if ($('.iconMenu-bar li').hasClass('open')) {
        $('.iconMenu-bar li').removeClass("open");
        $('main').removeClass('sidebar-open');
      }
    });   
  }
  checkIsDarkThemeExists(isCheckedDarkTheme) {
    if (isCheckedDarkTheme) {
        document.body.classList.add('dark');
        this.logoUrl = apiEndPointData.data.lightLogoUrl;
    } else {
        document.body.classList.remove('dark');
        this.logoUrl = apiEndPointData.data.darkLogoUrl;
    }
}
  initCollapsible() {
    var elcollapsible = document.querySelectorAll(".collapsible");
    var icollapsible = M.Collapsible.init(elcollapsible, {});
  }
  activeTabs(params: string) {
    if (params === 'allsports') {
      this.activeAllSportsTab = true;
      this.activeInPlayTab = false;
      this.activeUpcomingTab = false;
    } else if (params === 'inplay') {
      this.activeAllSportsTab = false;
      this.activeInPlayTab = true;
      this.activeUpcomingTab = false;
    } else if (params === 'upcomingevent') {
      this.activeAllSportsTab = false;
      this.activeInPlayTab = false;
      this.activeUpcomingTab = true;
    }
  }
  onTabMenuClick(selectedtab: string) {
    if (this.selectedTab === selectedtab) {
      if (this.selectedTab === 'upcomingevent') {
        this.selectedTab = 'allsports';
        $('.upcoming-event').toggleClass('is-hidden');
      }
    } else {
      this.selectedTab = selectedtab;
      this.currentMenuIndex = 0;
      this.currentEsMenuIndex = 0;
      $('.collapsible li.active').removeClass('active');
    }
  }
  getSportList() {
    let sportLists = [];
    if (this.user == null || this.user == undefined || this.user == "") {
      sportLists = GuestMLConfig.data.sportList ? GuestMLConfig.data.sportList : [];
    } else {
      sportLists = websiteSettings.data.sportList ? websiteSettings.data.sportList : [];
    }
    let sportName = this.allMatches.map((v) => v.st);
    sportName = sportName.filter((item, i, ar) => ar.indexOf(item) === i)
    const allsportName = sportLists.map((v) => v.st);
    this.sportList = allsportName.filter(function (o1) {
      return !sportName.some(function (o2) {
        return o1 === o2;
      });
    });
  }
  getUpcomingMarkets() {
    const allMarkets = this.allMatches.filter(
      (v) => !this.excludeSport.includes(v.st)
    );
    const notLive = allMarkets.filter((v) => !v.mi);
    const upcoming = notLive.filter(function (e) {
      var d1 = new Date();
      var d3 = new Date(e.ed);
      return d1.getTime() <= d3.getTime();
    });

    this.upcomingMarkets = arrayUniqueByKey(upcoming, 'eid');
    this.upcomingMarkets = this.upcomingMarkets.slice(0, 10);
  }
  getSettings() {
    this.user = JSON.parse(localStorage.getItem("token"));
    if (this.user == null || this.user == undefined || this.user == "") {
      this.websitesettings = apiEndPointData.data ? apiEndPointData.data : [];
      this.isListwithTournament = this.websitesettings.ilstv;
    } else {
      this.websitesettings = websiteSettings.data ? websiteSettings.data : [];
      this.isListwithTournament = this.websitesettings.isLeftSideBarTournamentView;
    }
    this.allMatches = this.allMatches.map((market: any) => {
      const str = market.en ? market.en : '';
      let team1Name = '', team2Name = '';
      let vrunnerName;
      if (str.includes(" V ")) {
        vrunnerName = str.split(' V ');
      } else {
        vrunnerName = str.split(' v ');
      }
      if (vrunnerName !== null || vrunnerName !== undefined) {
        team1Name = vrunnerName[0];
        team2Name = vrunnerName[1];
      }
      return Object.assign({ team1: team1Name, team2: team2Name }, market);
    });
    this.getUpcomingMarkets();
    let appIsHideSportWithNoEvent = apiEndPointData.data.ishse;
    if (!appIsHideSportWithNoEvent) {
      this.getSportList();
    }
    this.initCollapsible();
  }
  handleLinkClick(type) {
    if (this.deviceInfoService.isMobile()) {
      const $this = $(".iconsidebar-menu-mobile");
      if ($this.hasClass('iconsidebar-menu-mobile')) {
        $this.removeClass('iconsidebar-menu-mobile');
      }
    }
  }
  getConfig() {
    this.authService
      .getConfig$()
      .pipe(
        untilDestroyed(this),
        catchError((err) => throwError(err))
      )
      .subscribe(
        (response) => {
          if (response) {
            this.excludeSports = apiEndPointData.data.excludeSports;
            this.excludeSport = this.excludeSports.map((x) => x.name);
            this.commonService.configData = response;
            this.isB2C = websiteSettings.data.isB2C;
            this.isWager = !websiteSettings.data.appIsRealBalanceUse;
            this.isAutowagerPlacebet = websiteSettings.data.appIsAutowagerPlacebet;
            this.getSettings();
          }
        },
        (err) => console.log("getConfig", err)
      );
  }
  over() {
    var menu = document.querySelectorAll('.iconMenu-bar');
    for (var i = 0; i < menu.length; i++) {
      menu[i].classList.add('open');
    }
    var menu1 = document.querySelectorAll('main');
    for (var i = 0; i < menu1.length; i++) {
      menu1[i].classList.add('sidebar-open');
    }
    setTimeout(() => {
      var pos = $(".selectbet-header").width(); // don't need to use 'px'
      if (pos) {
        $(".scoreboard-sticky").css('width', pos + 'px');
      }
    }, 500);
  }
  out() {
    var menu = document.querySelectorAll('.iconMenu-bar');
    for (var i = 0; i < menu.length; i++) {
      if (this.isSidemenuTrigger) {
        menu[i].classList.add('open');
      } else {
        menu[i].classList.remove('open');
      }
    }
    var menu1 = document.querySelectorAll('main');
    for (var i = 0; i < menu1.length; i++) {
      if (this.isSidemenuTrigger) {
        menu1[i].classList.add('sidebar-open');
      } else {
        menu1[i].classList.remove('sidebar-open');
      }
    }
    setTimeout(() => {
      var pos = $(".selectbet-header").width(); // don't need to use 'px'
      if (pos) {
        $(".scoreboard-sticky").css('width', pos + 'px');
      }
    }, 500);
  }
  isNewLaunchSports(name) {
    const obj = this.allMatches.find(x => x.st === name);
    const newLaunchSports = this.websitesettings.newLaunchSports && this.websitesettings.newLaunchSports !== undefined && this.websitesettings.newLaunchSports !== null ? this.websitesettings.newLaunchSports : apiEndPointData.data.nls;
    const newLaunchSport = newLaunchSports && newLaunchSports.length > 0 ? newLaunchSports.split(',') : [];
    const isIncludeSport = newLaunchSport.includes(obj.si.toString());
    return isIncludeSport;
  }
  isActiveExcludeSports(name) {
    return !!this.excludeSportsMarket.find((x) => x.st === name);
  }
  onChangeRealBalanceUse(isChecked: boolean) {
    this.authService.SetRealBalanceUse$().pipe(untilDestroyed(this),
      catchError(err => throwError(err))).subscribe((data: any) => {
        if (data && data.isSuccess && data.result) {
          this.isWager = isChecked;
          websiteSettings.data.appIsRealBalanceUse = !isChecked;
          this.commonService.setRealBalanceUseStatus(!isChecked);
          this.toastr.success(data.result.message);
        }
      }, err => console.log('SetRealBalanceUse', err));
  }
  disabledWager() {
    return this.betService.getBetStatus();
  }
  onMarketClick(match: any, betId?) {
    if (this.deviceInfoService.isMobile()) {
      const customSidenav = document.querySelector(".custom-sidenav");
      document.querySelector(".sidenav").classList.remove("sidenav-close");
      document.querySelector(".sidenav").classList.remove("sidenav-open");
      if (customSidenav && customSidenav.classList.contains('sidenav-overlay')) {
        document.querySelector(".custom-sidenav").classList.remove('sidenav-overlay');
      }
    }
    if (this.user !== null) {
      var matchCookie = [], selectedMatchName = '';
      if (this.commonService.getCookieValue('selected_match_name')) {
        matchCookie = JSON.parse(this.commonService.getCookieValue('selected_match_name'));
      }
      if (matchCookie != null) {
        this.selectedMatchcookie = matchCookie;
      }
      if (betId) {
        selectedMatchName = match.eid;
      } else {
        selectedMatchName = match.values[0].eid;
      }
      const matchObj = new Object({
        id: selectedMatchName,
        type: 'Match',
        date: new Date()
      });
      this.selectedMatchcookie.push(matchObj);
      var selectedMatchcookieStr = JSON.stringify(this.selectedMatchcookie);
      this.commonService.setCookieValue('selected_match_name', selectedMatchcookieStr);
    }
    if (apiEndPointData.data.isdr) {
      if (betId) {
        this.removeCentralGroup(match, betId);
      } else {
        this.removeCentralGroup(match.values);
      }
    }
    this.currentMenuIndex = 0;
    this.currentEsMenuIndex = 0;
    $('.collapsible li.active').removeClass('active');
    const stake = new Stake();
    stake.closeMe = true;
    this.betService.setStake().next(stake);
    if (betId) {
      const eventName = ((match.en.trim())).replace(/\s/g, '');
      this.router.navigate(['event', match.eid, betId, eventName]);
    } else if (match.values[0].mt === FanceType.Virtual) {
      this.router.navigate(['event', 'virtual-sports']);
    } else {
      const eventName = ((match.values[0].en.trim())).replace(/\s/g, '');
      this.router.navigate(['event', match.values[0].eid, eventName]);
    }
  }
  getHRMarket(matchId) {
    return this.allMatches.filter(x => x.eid === matchId);
  }
  fnEventWise(index, item) {
    return item.appBetID;
  }
  getBetNameArray(betName) {
    const arr = betName.split(': ');
    if (arr && arr.length >= 2) {

      let time = arr[1];
      let hours = Number(time.match(/^(\d+)/)[1]);
      let minutes = Number(time.match(/:(\d+)/)[1]);
      let AMPM = time.match(/\s(.*)$/)[1];
      let AMPMTrim = AMPM.trim().toLowerCase();
      if (AMPMTrim == "pm" && hours < 12) hours = hours + 12;
      if (AMPMTrim == "am" && hours == 12) hours = hours - 12;
      let sHours = hours.toString();
      let sMinutes = minutes.toString();
      if (hours < 10) sHours = "0" + sHours;
      if (minutes < 10) sMinutes = "0" + sMinutes;
      const timeFormate = sHours + ":" + sMinutes;
      return timeFormate;
    }
    return '';
  }
  upcomingMarketClick(match: any) {
    const matchWise = this.allMatches.filter(function (value) {
      if (value.eid == match.eid) {
        return value;
      }
    });
    const matchWiseData = mapMatch(matchWise);
    this.onMarketClick(matchWiseData[0]);
  }
  removeCentralGroup(matches: any, betId?) {
    if (
      !this.websitesettings.isSocketRateEnabled &&
      this.allMatches &&
      this.allMatches.length > 0
    ) {
      const centralizationIds = this.allMatches.map(
        (match) => match.mc
      );
      var SelectedcentralizationIds: any;
      if (betId) {
        SelectedcentralizationIds = matches.mc.toString();
      } else {
        SelectedcentralizationIds = matches
          .map((match) => match.mc)
          .toString();
      }

      for (let i = 0; i < centralizationIds.length; i++) {
        if (!SelectedcentralizationIds.includes(centralizationIds[i])) {
          this.sessionService.removeCentralGroup(
            centralizationIds[i].toString()
          );
        }
      }
    }
  }
  openSearchModal() {
    this.searchRef.openPopup();
  }
  toogleSidenavBar(event: any) {
    event.stopPropagation();
    const customSidenav = document.querySelector(".custom-sidenav");
    if (document.querySelector(".sidenav").classList.contains("sidenav-open")) {
      document.querySelector(".sidenav").classList.remove('sidenav-open');
      document.querySelector(".sidenav").classList.add('sidenav-close');
      if (customSidenav && customSidenav.classList.contains('sidenav-overlay')) {
        document.querySelector(".custom-sidenav").classList.remove('sidenav-overlay');
      }
    } else {
      document.querySelector(".sidenav").classList.remove('sidenav-close');
      document.querySelector(".sidenav").classList.add('sidenav-open');
      if (customSidenav && customSidenav.classList.contains('sidenav-overlay')) {
        document.querySelector(".custom-sidenav").classList.add('sidenav-overlay');
      }
    }
  }
  searchValueChange(val) {
    if (this.deviceInfoService.isMobile()) {
      $('.iconsidebar-menu').removeClass('iconsidebar-menu-mobile');
    }
  }
  searchFocusOutFn(event: any) {
    this.searchStr = '';
  }
  trackByFun(index, item) {
    return index;
  }
  banner() {
    const user = JSON.parse(localStorage.getItem('token'));
    if (this.isDCOBanner) {
      const banners = DCOBanner.data ? DCOBanner.data : [];
      if (user != null) {
        this.promotionSlides = banners.filter(x => x.position == 'LeftPromotion' && (x.displayType === DCOBannerType.After_Login || x.displayType == DCOBannerType.Before_and_After_Login));
      } else {
        this.promotionSlides = banners.filter(x => x.position == 'LeftPromotion' && (x.displayType === DCOBannerType.Before_Login || x.displayType == DCOBannerType.Before_and_After_Login));
      }
    } else {
      const banners = apiEndPointData.data.banners ? apiEndPointData.data.banners : [];
      if (this.user != null) {
        this.promotionSlides = banners.filter(x => x.bt === BannerType.Left_Promotion_Before_and_After_Login || x.bt === BannerType.Left_Promotion_after_login).sort(function (a, b) {
          return a.dor - b.dor;
        });
      } else {
        this.promotionSlides = banners.filter(x => x.bt === BannerType.Left_Promotion_Before_and_After_Login || x.bt === BannerType.Left_Promotion_before_login).sort(function (a, b) {
          return a.dor - b.dor;
        });
      }
      if (this.deviceInfoService.isMobile()) {
        this.promotionSlides = this.promotionSlides.filter(x => x.imv);
      } else {
        this.promotionSlides = this.promotionSlides.filter(x => x.iwv);
      }
    }
    this.isPromotionSlides = this.promotionSlides && this.promotionSlides.length > 0 ? true : false;
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
  changeMode() {
    document.body.classList.toggle('dark');
    if (!this.isDarkTheme) {
      // this.isDarkTheme = true;
      this.commonService.setCookieValue('isCheckedDarkTheme', JSON.stringify({ isCheckedDarkTheme: true }));
      // this.footerLogo = this.commonService.imgRelativePath('assets/images/footer-logo-dark.png?v=1.3');
      this.commonService.setDarkThemeStatus(true);
    } else {
      // this.isDarkTheme = false;
      this.commonService.setCookieValue('isCheckedDarkTheme', JSON.stringify({ isCheckedDarkTheme: false }));
      // this.footerLogo = this.commonService.imgRelativePath('assets/images/footer-logo.png?v=1.3');
      this.commonService.setDarkThemeStatus(false);
    }
  }
  onOneClick() {
    if (this.user != null) {
      this.oneclickRef.openPopup();
    } else {
      this.commonService.setLoginPopupOpen(true);
    }
    if (document.querySelector(".sidenav").classList.contains("sidenav-open")) {
      document.querySelector(".sidenav").classList.remove('sidenav-open');
      document.querySelector(".sidenav").classList.add('sidenav-close');
      const customSidenav = document.querySelector(".custom-sidenav")
      if (customSidenav && customSidenav.classList.contains('sidenav-overlay')) {
        document.querySelector(".custom-sidenav").classList.remove('sidenav-overlay');
      }
    }
  }
  ngOnDestroy() {
    localStorage.removeItem('providerset');
    this.mySubscription.unsubscribe();

  }
}
