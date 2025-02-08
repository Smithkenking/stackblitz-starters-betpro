import { Component, OnInit, OnDestroy, AfterViewInit, Inject } from '@angular/core';
import { MarketFacadeService } from '@clientApp-core/services/market/market-facade.service';
import { untilDestroyed } from 'ngx-take-until-destroy';
import { take, catchError, takeUntil } from 'rxjs/operators';
import { throwError, Subject } from 'rxjs';
import { MarketRateFacadeService } from '@clientApp-core/services/market/market-rates/market-rate-facade.service';
import { StoreService } from '@clientApp-core/services/store/store.service';
import { SessionService } from '@clientApp-core/services/session/session.service';
import { BetFacadeService } from '@clientApp-core/services/bet/bet.facade.service';
import { DeviceInfoService } from '@clientApp-core/services/device-info/deviceinfo.services';
declare var $: any;
import * as M from "materialize-css/dist/js/materialize";
import { CommonService } from '@clientApp-core/services/common/common.service';
import { fancyRankOrder, GetSortOrder } from '@clientApp-core/utilities/app-configuration';
import { AuthFacadeService, casinoGameMenuSettings, websiteSettings } from '@clientApp-core/services/authentication/authentication-facade.service';
import { apiEndPointData } from '@clientApp-core/services/config/connfig.service';
import { arrayUniqueByKey } from '@clientApp-core/services/shared/JSfunction.service';
import { ActiveMarket } from '@clientApp-core/models/market/activemarket.model';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { LandingPageBT } from '@clientApp-core/enums/banner.types';
import { CasinoService } from '@clientApp-core/services/casino/casino.service';
import { DOCUMENT } from '@angular/common';
import Swiper, { Autoplay, Pagination } from "swiper";
import { userProfileInfo } from '@clientApp-core/services/authentication/b2c-user.service';
import { DataLayerService } from '@clientApp-core/services/window/DataLayerService.service';
Swiper.use([Autoplay,Pagination]);
@Component({
  selector: 'app-fav-sports',
  templateUrl: './fav-sports.component.html',
  styleUrls: ['./fav-sports.component.scss']
})
export class FavSportsComponent implements OnInit, AfterViewInit, OnDestroy {
  user: any;
  selectedMatchcookie: any = [];
  filterCasinoMenuData: any = [];
  providerList = [];
  config: any;
  casinoMenu: any = [];
  markets: ActiveMarket[] = [];
  allMarkets: ActiveMarket[] = [];
  notifier = new Subject();
  favoritegameslist: any = [];
  selectedCategory: string = 'Favourite';
  showAllCasinoGames = 10;
  PromotionImages: any;
  selectedCasino: any = [];
  selectedType: string = 'All';
  routeSubscription: any;
  casinoParams: any;
  casinoGameList = [];
  cpuWorker: any;
  isNewsExits: boolean;
  constructor(
    @Inject(DOCUMENT) private document: Document,
    private marketFacadeService: MarketFacadeService,
    private marketRateService: MarketRateFacadeService,
    private storeService: StoreService,
    private marketRateFacadeService: MarketRateFacadeService,
    private betService: BetFacadeService,
    public commonService: CommonService,
    private sessionService: SessionService,
    public deviceInfoService: DeviceInfoService,
    private toastr: ToastrService,
    private casinoService: CasinoService,private dataLayerService: DataLayerService,
    private authService: AuthFacadeService,private route: ActivatedRoute,private router: Router) {}

  ngOnInit() {
    this.config = this.commonService.configData;   
    this.getMarkets();  
    this.getConfig();
    this.getCasinoConfig();
    this.checkGameCategory();
    this.favoriteGames();
    this.getBanner();
    this.allMarkets = this.marketFacadeService.marketList;
    this.getFavouriteSports();
    this.getRunningMarketDetail();
    this.isNewsExits = this.commonService.isNewsExits;
this.getNews();
    if (typeof Worker !== 'undefined') {
      this.cpuWorker  = new Worker(new URL('../../worker/cpu.worker', import.meta.url),
        { type: "module" });
      this.cpuWorker.onmessage = ({ data }) => {
        const marketDetail = data.marketDetail, mi = data.mi;
        if (this.markets && this.markets.length > 0
            && marketDetail && marketDetail.length > 0) {
            this.markets.map((x: any) => {
              if (mi === +x.mc) {
                x.marketDetail = marketDetail;
              }
            });
        }
        };
        
    } else {
      // Web workers are not supported in this environment.
      // You should add a fallback so that your 
      // program still executes correctly.
    }
  }
  ngAfterViewInit() {
    setTimeout(() => {
      this.initOwlCarousel();
      let elem = document.querySelectorAll('.dropdown-trigger');
      let instances = M.Dropdown.init(elem, {});
    }, 1000);
  }
  getMarkets() {
    this.marketFacadeService.getMarkets$()
      .pipe(takeUntil(this.notifier),untilDestroyed(this), take(1),
        catchError(err => throwError(err))
      ).subscribe(response => {
        if (response && response.length > 0) {
          this.allMarkets =  response.sort((a, b) => {
            return fancyRankOrder.get(b.mt) - fancyRankOrder.get(a.mt);
          }).sort(GetSortOrder('ed'));
          this.getFavouriteSports();
        }
      }, err => console.log('market page getMarkets', err));
  }
  getFavouriteSports(){
    const multiselected_matchIds = localStorage.getItem('multiselected_matchIds');
    if (multiselected_matchIds != null && JSON.parse(multiselected_matchIds).length > 0) {
      const matchIds = JSON.parse(multiselected_matchIds);
     let matches = this.allMarkets.filter(market => matchIds.includes(market.eid));
     this.markets = arrayUniqueByKey(matches, 'eid');
     this.joinCentralGroup();
    }
  }
  joinCentralGroup(){
    if(websiteSettings.data.isShowDashboardRate){
      const centralizationIds =  this.markets.map(match => match.mc).toString();
        this.sessionService.joinCentralDashboardGroup(centralizationIds);
     }
  }
  getRunningMarketDetail() {
    if (websiteSettings.data.isShowDashboardRate) {
      this.marketRateFacadeService.getRunningDashboardMarketDetail$().pipe(takeUntil(this.notifier), untilDestroyed(this)).subscribe((runningMarket) => {
        if (runningMarket != null) {
          this.cpuWorker.postMessage(runningMarket);
        }
      });
    }
  }
  getConfig() {
    this.authService.getConfig$()
      .pipe(
        untilDestroyed(this),
        catchError(err => throwError(err))
      ).subscribe(response => {
        if (response) {
          this.commonService.configData = response;
          this.config = response;
          this.checkGameCategory();
          this.joinCentralGroup();
          this.getRunningMarketDetail();
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
          this.checkGameCategory();
        }
      }, err => console.log('getConfig', err));
  }
  favoriteGames() {
    this.authService.getFavoriteGames().pipe(catchError(err => throwError(err))).subscribe((response: any) => {
      if (response) {
        this.favoritegameslist = Object.assign([], response.result);
        this.commonService.FavoriteIds = []; 
        this.favoritegameslist.forEach(ele => {
          this.commonService.FavoriteIds.push(ele.appAngularCasinoGameID);   
        });
        this.casinoRoutingFilteration();
      }
    }, err => console.log('favoriteGames', err));
  }
  onMarketClick(match: any, betId?) {
    if (this.user !== null) {
      var matchCookie = [];
      if (this.commonService.getCookieValue('selected_match_name')) {
        matchCookie = JSON.parse(this.commonService.getCookieValue('selected_match_name'));
      }
      if (matchCookie != null) {
        this.selectedMatchcookie = matchCookie;
      }
      var selectedMatchName = match.eid;
      const matchObj = new Object({
        id: selectedMatchName,
        type: 'Match',
        date: new Date()
      });
      this.selectedMatchcookie.push(matchObj);
      var selectedMatchcookieStr = JSON.stringify(this.selectedMatchcookie);
      this.commonService.setCookieValue('selected_match_name', selectedMatchcookieStr);
     } 
    let matches;
    if (betId && betId !== undefined) {
      matches = this.allMarkets.filter((game) => {
        return (game.eid === match.eid && game.mid === betId);
      });
    } else {
      matches = this.allMarkets.filter((game) => {
        return game.eid === match.eid;
      });
    }
    if (apiEndPointData.data.isdr) {
      this.removeAllGroup();
    }
    this.storeService.removeAllStoreData();
    this.marketRateService.curMatchInfo = [];
    this.marketRateService.curMarketsVol = [];
    this.marketRateService.curMarketsRate = [];
    this.marketRateService.curMarketsRunners = [];
    const _currentSet ={
      'event': 'sports_game',
      'Sport_type': match.st,
      'phone': '+' + userProfileInfo.data.appMobileNo,
     };
     this.dataLayerService.pingHome(_currentSet);
    const eventName = ((match.en.trim())).replace(/\s/g, '');
    if (betId && betId !== undefined) {
      this.router.navigate(['event', match.eid,betId, eventName]);
    } else {
      this.router.navigate(['event', match.eid, eventName]);
    }
  }
  showContent(type: string) {
    this.selectedType = type;
  }
  onPinClick(match: any) {
    let multiSelectedMatch: any;
    multiSelectedMatch = JSON.parse(localStorage.getItem('multiselected_matchIds'));

    if (multiSelectedMatch === null) {
      multiSelectedMatch = [];
      multiSelectedMatch.push(match.eid);
      document.getElementById('multipin' + match.mid).classList.add('active');
    } else {
      let obj: any;
      obj = multiSelectedMatch.find(x => x ==  match.eid);
      if (obj) {
        multiSelectedMatch = multiSelectedMatch.filter(x => x !==  obj);
        document.getElementById('multipin' + match.mid).classList.remove('active');
      } else {
        if (multiSelectedMatch.length <= 4) {
          multiSelectedMatch.push(match.eid);
          document.getElementById('multipin' + match.mid).classList.add('active');
        }
      }
    }
    this.commonService.setEventCounts('Favourite',multiSelectedMatch.length);
    localStorage.setItem('multiselected_matchIds', JSON.stringify(multiSelectedMatch));
    if (multiSelectedMatch.length === 0) {
      this.markets = [];
    } else {
    this.getFavouriteSports();
    }
  }

  removeAllGroup() {
    if (!this.deviceInfoService.isMobile() && this.markets && this.markets.length > 0) {
      const centralizationIds = this.markets.map(match => match.mc).filter(function (el) {
        return el != null && el != undefined && el != '';
      }).toString();
      this.sessionService.removeCentralDashboardGroup(centralizationIds);
    }
  }
  AllFavoriteChanges(games:any){
    
    let SelectedFavorite:any = this.commonService.FavoriteIds;
    if (SelectedFavorite === null) {
      SelectedFavorite = [];
      SelectedFavorite.push(games.angularCasinoGameId);
      let btns = document.getElementsByClassName('addfavorites' + games.angularCasinoGameId);
      for (var i = 0; i < btns.length; i++) {
          btns[i].classList.add('active');
      }
      const addgame = {
      appProviderID : games.appProviderID,
      appAngularCasinoGameID : games.angularCasinoGameId
    }
    this.authService.getAddfavoriteGame(addgame).subscribe(res => {
      if (res) {
        this.toastr.success(res.result.message,"Notification",{
          toastClass: "custom-toast-success"
        });
        this.favoriteGames();
      }
    });  
    } else {
      let obj: any;
      obj = SelectedFavorite.find(x => x == games.angularCasinoGameId);
      if (obj) {
        var index = SelectedFavorite.indexOf(obj);
        SelectedFavorite.splice(index, 1);
        let btns = document.getElementsByClassName('addfavorites' + games.angularCasinoGameId);
        for (var i = 0; i < btns.length; i++) {
            btns[i].classList.remove('active');
        }
        if (this.selectedCategory === 'Favourite') {
          this.filterCasinoMenuData = this.filterCasinoMenuData.filter((item) => item.angularCasinoGameId !== games.angularCasinoGameId);
        }
       const removegame = {
           appProviderID : games.appProviderID,
           appAngularCasinoGameID : games.angularCasinoGameId
         }
         this.authService.getRemoveFavoriteGame(removegame).subscribe(res => {
           if (res) {
          this.toastr.error(res.result.message,"Notification",{
            toastClass: "custom-toast-error"
          });
          this.favoriteGames();
           }
         });  
      } else {
        SelectedFavorite.push(games.angularCasinoGameId);
    let btns = document.getElementsByClassName('addfavorites' + games.angularCasinoGameId);
    for (var i = 0; i < btns.length; i++) {
        btns[i].classList.add('active');
    }
    let btn = document.getElementsByClassName('addfavorite' + games.angularCasinoGameId);
    for (var i = 0; i < btn.length; i++) {
        btn[i].classList.add('active');
    }
        const addgame = {
           appProviderID : games.appProviderID,
           appAngularCasinoGameID : games.angularCasinoGameId
         }
         this.authService.getAddfavoriteGame(addgame).subscribe(res => {
           if (res) {
           this.toastr.success(res.result.message,"Notification",{
            toastClass: "custom-toast-success"
          });
           this.favoriteGames();
           }
         });  
      }
    }
    this.commonService.FavoriteIds = SelectedFavorite;

  }
  casinoRoutingFilteration() {
    this.showAllCasinoGames = 10;
    const casinoMenu = Object.assign([], this.casinoMenu);
    let filterData: any = Object.assign([], casinoMenu);
    if (this.selectedCategory === 'Favourite' || this.selectedCategory === 'favourite') {
      let SelectedFavorite = this.commonService.FavoriteIds;
        if (SelectedFavorite !== null && SelectedFavorite.length > 0) {
          filterData = casinoMenu.filter(x => {
                return SelectedFavorite.includes(x.angularCasinoGameId);
            });
        } else {
          filterData = [];
        }
    } 
    this.filterCasinoMenuData = Object.assign([], filterData);
  }
  getBanner() {
    const bannerData = apiEndPointData.data.banners ? apiEndPointData.data.banners : [];
    if (bannerData && bannerData.length > 0) {
      this.PromotionImages = bannerData.filter(second => second.bt === LandingPageBT.LP_Promotion_Images);
    }
  }
  initOwlCarousel() {
    var promocarousel = new Swiper('#promo-carousel', {
      loop: true,
      slidesPerView: 4,
      // centeredSlides: true,
      spaceBetween: 15,
      autoplay: { delay: 2000, },
      modules: [Autoplay,Pagination],
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
  checkGameCategory() {
    const casinoGameMenu = casinoGameMenuSettings.data.casinoMenu ? casinoGameMenuSettings.data.casinoMenu : [];
    let ProviderList = casinoGameMenuSettings.data.providerList ? casinoGameMenuSettings.data.providerList : [];
    const tpGamePermission = websiteSettings.data.tpGamePermission ? websiteSettings.data.tpGamePermission : [];
    this.providerList = ProviderList.filter(x => {
      return !tpGamePermission.includes(x.appTpGameRefType);
     }).sort(function (a, b) {
      return a.appDisplayOrder - b.appDisplayOrder;
    });
    this.casinoMenu = casinoGameMenu.filter(ele => {
      return (!tpGamePermission.includes(ele.appTpGameRefType) && this.config && this.config[ele.apiParamName] && ele.isActive && ele.providerName !== null);
    });
    if (this.casinoMenu && this.casinoMenu.length > 0) {
      this.casinoRoutingFilteration();
    }
  }
  onCasinoGameClick(param) {
   if(param.providerName === "BetGames") {
      this.loadJSDynamic(param.providerName);
     }
     const selectedProvider = 'Spribe';
     const selectedgame = 'Aviator';
    if (param.name?.toLowerCase().replace(/\s/g, '') === selectedgame.toLowerCase().replace(/\s/g, '') && 
        param.providerName?.toLowerCase().replace(/\s/g, '') === selectedProvider.toLowerCase().replace(/\s/g, '')) {
      sessionStorage.setItem('isAviatorGameOpen', JSON.stringify({ isAviatorGameOpen: true }));
    } else {
      sessionStorage.removeItem('isAviatorGameOpen');
    }
    this.commonService.setLoadingStatus(true);
     this.casinoService.getCasinoToken(param);
     const CasinoObj = new Object({
      id:param.angularCasinoGameId,
      type:'Casino',
      date: new Date()
    });
    if (this.commonService.getCookieValue('selected_match_name')) {
      var getCasinoCookie = JSON.parse(this.commonService.getCookieValue('selected_match_name'));
    }

    if (getCasinoCookie != null) {
      this.selectedCasino = getCasinoCookie;
    }

    this.selectedCasino.push(CasinoObj);
    this.commonService.setCookieValue('selected_match_name', JSON.stringify(this.selectedCasino));
  }
  // load betgame and tvbet dynamic script
  loadJSDynamic(sportName) {
    let scripts = document.getElementsByTagName("script")
    if(sportName === "BetGames") {
      let isFound = false;
      for (var i = 0; i < scripts.length; ++i) {
        if (scripts[i].getAttribute('src') != null && scripts[i].getAttribute('src').includes("betgames.js")) {
            isFound = true;
        }
      }
      if(!isFound) {
       let url = this.commonService.contentRelativePath("assets/js/betgames.js");
        this.loadScript(url);
      }
    }
  }
  public loadScript(scriptName: string) {
    let body = <HTMLDivElement>document.body;
    let script = document.createElement('script');
    script.innerHTML = '';
    script.src = scriptName;
    script.async = true;
    script.defer = true;
    body.appendChild(script);
  }
  loadStyle(styleName: string, rel?: string) {
    const head = this.document.getElementsByTagName('head')[0];

    const style = this.document.createElement('link');
    style.id = 'client-theme';
    style.rel = rel ? rel : 'stylesheet';
    style.href = `${styleName}`;
    style.crossOrigin = 'anonymous';
    head.appendChild(style);

  }
  errorHandler(event) {
    event.target.src = this.commonService.contentRelativePath(apiEndPointData.data.casinoDefaultPath);
  }
  trackByFn(index, item) {
    return item.eid; // or index 
  }
  trackByFun(index, item) {
    return index;
  }
  onScroll() {
    this.showAllCasinoGames += 5;
  }
  onScrollUp() {
    this.showAllCasinoGames -= 5;
  }
  getProviderName(providerId) {
    const obj = this.providerList.find(x => x.appProviderID == providerId);
    return obj !== null && obj !== undefined ? obj.appProviderName : '';
  }
  isEmpty(obj) {
    for (var key in obj) {
      if (obj.hasOwnProperty(key))
        return false;
    }
    return true;
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
            if (response &&  response.length > 0) {
                this.isNewsExits = true;
            }
        }, err => console.log('getNews', err));
  }
  ngOnDestroy() {
    this.notifier.next();
    this.notifier.complete();
  }
}
