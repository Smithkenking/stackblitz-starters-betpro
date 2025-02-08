import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AuthFacadeService, casinoGameMenuSettings, websiteSettings } from '@clientApp-core/services/authentication/authentication-facade.service';
import { CasinoService } from '@clientApp-core/services/casino/casino.service';
import { CommonService } from '@clientApp-core/services/common/common.service';
import { apiEndPointData } from '@clientApp-core/services/config/connfig.service';
import { untilDestroyed } from 'ngx-take-until-destroy';
import { take, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Router } from '@angular/router';
import * as M from "materialize-css/dist/js/materialize";
import { GetDateSortOrder, GetSortOrder } from '@clientApp-core/utilities/app-configuration';
import { arrayUniqueByKey } from '@clientApp-core/services/shared/JSfunction.service';
import { VeronicapopupComponent } from '@clientApp-shared/components/veronicapopup/veronicapopup.component';
declare var $: any;
@Component({
  selector: 'app-casino-games-list',
  templateUrl: './casino-games-list.component.html',
  styleUrls: ['./casino-games-list.component.scss']
})
export class CasinoGamesListComponent implements OnInit, AfterViewInit, OnDestroy {
  // @ViewChild('veronica', { static: true }) veronicaRef: VeronicapopupComponent;
  config: any;
  casinoMenu: any = [];
  filterCasinoMenuData: any = [];
  providerList = [];
  favoritegameslist: any = [];
  selectedCategory: string = 'All';
  selectedGame: string = 'All Games';
  selectedProvider: string = 'All Provider';
  selectedCasino: any = [];
  casinoParams: any;
  routeSubscription: any;
  showAllCasinoGames = 50;
  casinoGameList = [];
  isNewsExits: boolean;
  recentPlayedCasinoGames = [];
  constructor(public commonService: CommonService, private toastr: ToastrService
    , private authService: AuthFacadeService
    , private casinoService: CasinoService, public router: Router, private route: ActivatedRoute) {
    this.routeSubscription = this.route.params.pipe().subscribe((params) => {
      if (params && !this.isEmpty(params)) {
        if (params['provider']) {
          this.casinoParams = params;
          this.casinoRoutingFilteration();
        }

      }
    });
  }

  ngOnInit(): void {
    this.favoriteGames();
    this.config = this.commonService.configData;
    this.getConfig();
    this.getCasinoConfig();
    this.checkGameCategory();
    this.isNewsExits = this.commonService.isNewsExits;
    this.getNews();
  }
  ngAfterViewInit() {
    this.init();
    this.commonService.setCasinoOpenStatus(true);
    // setTimeout(() => {
    //   const output = '1';
    //       const getVeronicaPopupstatus = localStorage.getItem('showVeronicaPopup');
    //       // if (websiteSettings.data.isShowCasinoGamePopup && getVeronicaPopupstatus !== output) {
    //       //   this.veronicaRef.openPopup();
    //       // }
    // }, 3000);
  }
  init() {
    setTimeout(() => {
      let elem = document.querySelectorAll('.dropdown-trigger');
      let instances = M.Dropdown.init(elem, {});
    }, 500);
    $('ul.dropdown-content li').on('touchend', function (e) {
      e.stopPropagation();
    });
    const scroll5:any = document.querySelector(".ac_slider");
var isDown = false;
var scrollX;
var scrollLeft;

// Mouse Up Function
scroll5.addEventListener("mouseup", () => {
  isDown = false;
  scroll5.classList.remove("active");
});

// Mouse Leave Function
scroll5.addEventListener("mouseleave", () => {
  isDown = false;
  scroll5.classList.remove("active");
});

// Mouse Down Function
scroll5.addEventListener("mousedown", (e) => {
  e.preventDefault();
  isDown = true;
  scroll5.classList.add("active");
  scrollX = e.pageX - scroll5.offsetLeft;
  scrollLeft = scroll5.scrollLeft;
});

// Mouse Move Function
scroll5.addEventListener("mousemove", (e) => {
  if (!isDown) return;
  e.preventDefault();
  var element = e.pageX - scroll5.offsetLeft;
  var scrolling = (element - scrollX) * 2;
  scroll5.scrollLeft = scrollLeft - scrolling;
});
  }

  getConfig() {
    this.authService.getConfig$()
      .pipe(
        untilDestroyed(this),
        take(1),
        catchError(err => throwError(err))
      ).subscribe(response => {
        if (response) {
          this.config = response;
          this.commonService.configData = response;
          this.checkGameCategory();
          this.init();
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
      }
    }, err => console.log('favoriteGames', err));
  }
  AllFavoriteChanges(games) {

    let SelectedFavorite = this.commonService.FavoriteIds;
    if (SelectedFavorite === null) {
      SelectedFavorite = [];
      SelectedFavorite.push(games.angularCasinoGameId);
      let btns = document.getElementsByClassName('addfavorites' + games.angularCasinoGameId);
      for (var i = 0; i < btns.length; i++) {
        btns[i].classList.add('active');
      }
      const addgame = {
        appProviderID: games.appProviderID,
        appAngularCasinoGameID: games.angularCasinoGameId
      }
      this.authService.getAddfavoriteGame(addgame).subscribe(res => {
        if (res) {
          this.toastr.success(res.result.message, "Notification", {
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
          appProviderID: games.appProviderID,
          appAngularCasinoGameID: games.angularCasinoGameId
        }
        this.authService.getRemoveFavoriteGame(removegame).subscribe(res => {
          if (res) {
            this.toastr.error(res.result.message, "Notification", {
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
          appProviderID: games.appProviderID,
          appAngularCasinoGameID: games.angularCasinoGameId
        }
        this.authService.getAddfavoriteGame(addgame).subscribe(res => {
          if (res) {
            this.toastr.success(res.result.message, "Notification", {
              toastClass: "custom-toast-success"
            });
            this.favoriteGames();
          }
        });
      }
    }
    this.commonService.FavoriteIds = SelectedFavorite;

  }
  checkGameCategory() {
    let casinoGameList = casinoGameMenuSettings.data.casinoGameList ? casinoGameMenuSettings.data.casinoGameList : (apiEndPointData.data.casinoGameList ? apiEndPointData.data.casinoGameList : []);
    this.casinoGameList = Object.assign([], casinoGameList.filter(x => x.appIsActive));
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
      const getrecentPlayedgame = this.commonService.getCookieValue('recentPlayedgame').length > 0 ? JSON.parse(this.commonService.getCookieValue('recentPlayedgame')) : [];
      let recentPlayedgame = Object.assign([], getrecentPlayedgame.sort(GetDateSortOrder('date', 'desc')));
      recentPlayedgame = arrayUniqueByKey(recentPlayedgame, 'id');
      const topTenRecentPlayedGame = recentPlayedgame.filter((month, idx) => idx < 10);
      let getRecentTopTenGames = [];
      for (let i = 0; i < topTenRecentPlayedGame.length; i++) {
        var selectedCasino = this.casinoMenu.filter(x => x.angularCasinoGameId == topTenRecentPlayedGame[i].id);
        if (selectedCasino != null && selectedCasino.length > 0) {
          getRecentTopTenGames.push(selectedCasino[0]);
        }
        this.recentPlayedCasinoGames = Object.assign([], getRecentTopTenGames);
        if (i == 9) {
          break;
        }
      }
      this.casinoRoutingFilteration();
    }
  }
  onCasinoGameClick(param) {
    if (param.providerName === "BetGames") {
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
      id: param.angularCasinoGameId,
      type: 'Casino',
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
  errorHandler(event) {
    event.target.src = this.commonService.contentRelativePath(apiEndPointData.data.casinoDefaultPath);
  }
  trackByFn(index: number, item: any) {
    return index;
  }
  getProviderName(providerId) {
    const obj = this.providerList.find(x => x.appProviderID == providerId);
    return obj !== null && obj !== undefined ? obj.appProviderName : '';
  }
  filterCasinoMenu(gameName) {
    this.selectedCategory = gameName;
    if (gameName !== 'All') {
      this.router.navigate(['live-casino', this.casinoParams?.provider ? this.casinoParams.provider : 'provider', this.casinoParams?.game ? this.casinoParams.game : 'game', gameName]);
    } else if (this.casinoParams && this.casinoParams.game !== 'game') {
      this.router.navigate(['live-casino', this.casinoParams?.provider ? this.casinoParams.provider : 'provider', this.casinoParams?.game ? this.casinoParams.game : 'game']);
    } else if (this.casinoParams && this.casinoParams.provider !== 'provider') {
      this.router.navigate(['live-casino', this.casinoParams?.provider ? this.casinoParams.provider : 'provider']);
    } else {
      this.router.navigate(['live-casino']);
    }
  }
  casinoRoutingFilteration() {
    this.selectedCategory = this.casinoParams?.type && this.casinoParams?.type !== 'type' ? this.casinoParams.type : 'All';
    this.selectedGame = this.casinoParams?.game && this.casinoParams?.game !== 'game' ? (this.casinoParams.game).replace(/%20/g, " ") : 'All Games';
    this.selectedProvider = this.casinoParams?.provider && this.casinoParams?.provider !== 'provider' ? (this.casinoParams.provider).replace(/%20/g, " ") : 'All Provider';
    this.showAllCasinoGames = 50;
    const casinoMenu = Object.assign([], this.casinoMenu);
    let filterData: any = Object.assign([], casinoMenu);
    if (this.selectedProvider !== 'All Provider') {
      filterData = Object.assign([], filterData.filter(x => x.providerName?.toLowerCase().replace(/\s/g, '') === this.selectedProvider.toLowerCase().replace(/\s/g, '')));
    }
    if (this.selectedGame !== 'All Games') {
      filterData = Object.assign([], filterData.filter(x => x.gameType?.toLowerCase().replace(/\s/g, '') === this.selectedGame.toLowerCase().replace(/\s/g, '')));
    }
    if (this.selectedCategory === 'New' || this.selectedCategory === 'new') {
      filterData = filterData.filter(x => x.isNewGame).sort(GetSortOrder('displayOrderNew'));
    } else if (this.selectedCategory === 'Popular' || this.selectedCategory === 'popular') {
      filterData = filterData.filter(x => x.isPopular).sort(GetSortOrder('displayOrderPopular'));
    } else if (this.selectedCategory === 'Live' || this.selectedCategory === 'live') {
      filterData = filterData.filter(x => x.categoryID == 1).sort(GetSortOrder('displayOrderLive'));
    } else if (this.selectedCategory === 'Virtual' || this.selectedCategory === 'virtual') {
      filterData = filterData.filter(x => x.categoryID == 4).sort(GetSortOrder('displayOrderVirtual'));
    } else if (this.selectedCategory === 'Favourite' || this.selectedCategory === 'favourite') {
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
    if (this.selectedProvider === "BetGames") {
      this.loadJSDynamic(this.selectedProvider);
    }
  }
  // load betgame and tvbet dynamic script
  loadJSDynamic(sportName) {
    let scripts = document.getElementsByTagName("script")
    if (sportName === "BetGames") {
      let isFound = false;
      for (var i = 0; i < scripts.length; ++i) {
        if (scripts[i].getAttribute('src') != null && scripts[i].getAttribute('src').includes("betgames.js")) {
          isFound = true;
        }
      }
      if (!isFound) {
        let url = this.commonService.contentRelativePath("assets/js/betgames.js");
        this.loadScript(url);
      }
    }
  }
  loadScript(url: string) {
    let node = document.createElement('script');
    node.src = url;
    node.type = 'text/javascript';
    document.getElementsByTagName('head')[0].appendChild(node);
    node.onerror = (error: any) => { console.log('error scritp load : ', error); return false; };
    return true;
  }
  isEmpty(obj) {
    for (var key in obj) {
      if (obj.hasOwnProperty(key))
        return false;
    }
    return true;
  }
  Allgames(gamename) {
    let currentUrl = this.router.url.split('/'),
      providerUrl = currentUrl && currentUrl[2] ? decodeURIComponent(currentUrl[2]).replace(/%20/g, " ") : 'provider',
      gameUrl = currentUrl && currentUrl[3] ? currentUrl[3] : 'game',
      typeUrl = currentUrl && currentUrl[4] ? currentUrl[4] : 'type',
      selectedGame = gamename !== 'All Games' ? gamename : 'game';
    if (typeUrl !== 'type') {
      this.router.navigate(['live-casino', providerUrl, selectedGame, typeUrl]);
    } else if (gamename !== 'All Games') {
      this.router.navigate(['live-casino', providerUrl, selectedGame]);
    } else if (gamename === 'All Games' && providerUrl !== 'provider') {
      this.router.navigate(['live-casino', providerUrl]);
    } else {
      this.router.navigate(['live-casino']);
    }

  }
  Allprovider(provider) {
    let currentUrl = this.router.url.split('/'),
      providerUrl = currentUrl && currentUrl[2] ? currentUrl[2] : 'provider',
      gameUrl = currentUrl && currentUrl[3] ? decodeURIComponent(currentUrl[3]).replace(/%20/g, " ") : 'game',
      typeUrl = currentUrl && currentUrl[4] ? currentUrl[4] : 'type',
      selectedProvider = provider !== 'All Provider' ? provider : 'provider';
    if (typeUrl !== 'type') {
      this.router.navigate(['live-casino', selectedProvider, gameUrl, typeUrl]);
    } else if (gameUrl !== 'game') {
      this.router.navigate(['live-casino', selectedProvider, gameUrl]);
    } else if (provider !== 'All Provider') {
      this.router.navigate(['live-casino', provider]);
    } else {
      this.router.navigate(['live-casino']);
    }
  }
  onScroll() {
    this.showAllCasinoGames += 5;
  }
  onScrollUp() {
    this.showAllCasinoGames -= 5;
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
          this.commonService.isNewsExits = true;
        }
      }, err => console.log('getNews', err));
  }
  ngOnDestroy() {
    this.routeSubscription.unsubscribe();
  }
}
