import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AuthFacadeService, GuestCasinoConfig } from '@clientApp-core/services/authentication/authentication-facade.service';
import { CommonService } from '@clientApp-core/services/common/common.service';
import { untilDestroyed } from 'ngx-take-until-destroy';
import { Subscription, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import * as M from "materialize-css/dist/js/materialize";
import { ActivatedRoute, Router } from '@angular/router';
import { DeviceInfoService } from '@clientApp-core/services/device-info/deviceinfo.services';
import { GetSortOrder } from '@clientApp-core/utilities/app-configuration';
import { apiEndPointData } from '@clientApp-core/services/config/connfig.service';
declare var $: any;
@Component({
  selector: 'app-login-casino',
  templateUrl: './login-casino.component.html',
  styleUrls: ['./login-casino.component.scss']
})
export class LoginCasinoComponent implements OnInit, AfterViewInit, OnDestroy {
  allCasinoGames: any = [
    {
      name: 'New',
      casinoData: []
    },
    {
      name: 'Popular',
      casinoData: []
    },
    {
      name: 'Live',
      casinoData: []
    },
    {
      name: 'Virtual',
      casinoData: []
    }
  ];
  casinoMenu: any = [];
  casinoGameMenu = [];
  filterCasinoMenuData: any = [];
  providerList = [];
  isShowCasinoDetailPage: boolean = false;
  isSelectedCategory: boolean = false;
  isSelectedGame: boolean = false;
  isSelectedProvider: boolean = false;
  isSearchString: boolean = false;
  selectedCategory: string = 'All';
  selectedGame: string = 'All Games';
  selectedProvider: string = 'All Provider';
  searchString: string = '';
  allgamesstatus: Subscription;
  allproviderstatus: Subscription;
  casinoGameList = [];
  showAllCasinoGames = 50;
  routeSubscription: any;
  casinoParams: any;
  casinoModalInstances: any;
  selectedCasino: string = 'Live';
  FilterProviderList = [];
  selectedCasinoGame = [];
  ProviderList = [];

  @ViewChild('casinoFreeModal', { static: true }) casinoFreeModal: ElementRef;
  constructor(public commonService: CommonService, private authService: AuthFacadeService, private route: ActivatedRoute, public router: Router, public deviceInfoService: DeviceInfoService) {
    this.routeSubscription = this.route.params.pipe().subscribe((params) => {
      if (params && !this.isEmpty(params)) {
        this.casinoParams = params;
        this.casinoRoutingFilteration();
      }
    });
    this.allproviderstatus = this.commonService._allproviderSubject.subscribe((provided) => {
      this.isShowCasinoDetailPage = true;
      this.isSelectedProvider = true;
      this.selectedProvider = provided;
      this.sortCasinoMenu();
    });
    this.allgamesstatus = this.commonService._allgamesSubject.subscribe((games) => {
      this.isShowCasinoDetailPage = true;
      this.isSelectedGame = true;
      this.selectedGame = games;
      this.sortCasinoMenu();
    });
  }

  ngOnInit(): void {
    this.setCasinoSettings();
    this.getGuestCasinoConfig();
  }
  ngAfterViewInit(): void {
    setTimeout(() => {
      let elem = document.querySelectorAll('.dropdown-trigger');
      let instances = M.Dropdown.init(elem, {});
    }, 1000);
    const output = '1';
    const getVeronicaPopupstatus = localStorage.getItem('getVeronicaPopupstatus');
    if (getVeronicaPopupstatus !== output) {
      this.casinoModalInstances.open();
      localStorage.setItem('getVeronicaPopupstatus', '1');
    }
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
  getProviderName(providerId) {
    const obj = this.providerList.find(x => x.appProviderID == providerId);
    return obj !== null && obj !== undefined ? obj.appProviderName : '';
  }
  trackByFn(index: number, item: any) {
    return index;
  }
  errorHandler(event) {
    event.target.src = this.commonService.contentRelativePath(apiEndPointData.data.casinoDefaultPath);
  }
  filterCasinoMenu(gameName) {
    this.isShowCasinoDetailPage = true;
    this.isSelectedCategory = true;
    this.selectedCategory = gameName;
    if (gameName === 'All' && this.selectedProvider === 'All Provider' && this.selectedGame === 'All Games') {
      this.isSelectedCategory = false;
      this.isSelectedGame = false;
      this.isSelectedProvider = false;
      this.isShowCasinoDetailPage = false;
    } else {
    }
    if (gameName !== 'All') {
      if (this.casinoParams && this.casinoParams.type) {
        this.router.navigate(['live-casino', this.casinoParams.provider ? this.casinoParams.provider : 'provider', this.casinoParams.game ? this.casinoParams.game : 'game', gameName]);
      } else if (this.casinoParams && this.casinoParams.game) {
        this.router.navigate(['live-casino', this.casinoParams.provider ? this.casinoParams.provider : 'provider', this.casinoParams.game ? this.casinoParams.game : 'game', gameName]);
      } else if (this.casinoParams && this.casinoParams.provider) {
        this.router.navigate(['live-casino', this.casinoParams.provider ? this.casinoParams.provider : 'provider', this.casinoParams.game ? this.casinoParams.game : 'game', gameName]);
      } else {
        this.router.navigate(['live-casino', 'provider', 'game', gameName]);
      }
    } else if (this.casinoParams && this.casinoParams.provider !== 'provider' && this.casinoParams.game !== 'game') {
      this.router.navigate(['live-casino', this.casinoParams.provider, this.casinoParams.game]);
    } else {
      this.router.navigate(['live-casino']);
    }
  }
  casinoRoutingFilteration() {
    if (this.casinoParams && this.casinoParams.type) {
      this.isShowCasinoDetailPage = true;
      this.isSelectedCategory = true;
      this.selectedCategory = this.casinoParams.type;
      if (this.casinoParams.game == 'game') {
        this.selectedGame = 'All Games';
        this.isSelectedGame = false;
      } else {
        this.selectedGame = this.casinoParams.game;
        this.isSelectedGame = true;
      }
      if (this.casinoParams.provider == 'provider') {
        this.selectedProvider = 'All Provider';
        this.isSelectedProvider = false;
      } else {
        this.selectedProvider = this.casinoParams.provider;
        this.isSelectedProvider = true;
      }
      this.sortCasinoMenu();
      this.commonService.allCasinogameget(this.selectedGame);
      this.commonService.allprovidersget(this.selectedProvider);
    } else if (this.casinoParams && this.casinoParams.game) {
      this.isShowCasinoDetailPage = true;
      this.isSelectedGame = true;
      this.selectedGame = this.casinoParams.game;
      if (this.casinoParams.provider == 'provider') {
        this.selectedProvider = 'All Provider';
        this.isSelectedProvider = false;
      } else {
        this.selectedProvider = this.casinoParams.provider;
        this.isSelectedProvider = true;
      }
      this.sortCasinoMenu();
      this.commonService.allCasinogameget(this.selectedGame);
      this.commonService.allprovidersget(this.selectedProvider);
    } else if (this.casinoParams && this.casinoParams.provider) {
      this.isShowCasinoDetailPage = true;
      this.isSelectedProvider = true;
      this.selectedProvider = this.casinoParams.provider;
      this.sortCasinoMenu();
      this.commonService.allprovidersget(this.selectedProvider);
      this.commonService.allCasinogameget('All Games');
    } else {
      this.commonService.allCasinogameget('All Games');
      this.commonService.allprovidersget('All Provider');
    }
  }
  sortCasinoMenu() {
    this.showAllCasinoGames = 50;
    const casinoMenu = Object.assign([], this.casinoMenu);
    let filterData: any = [];
    if (this.selectedCategory === 'New') {
      filterData = casinoMenu.filter(x => x.ing);
    } else if (this.selectedCategory === 'Popular') {
      filterData = casinoMenu.filter(x => x.ip);
    } else if (this.selectedCategory === 'Live') {
      filterData = casinoMenu.filter(x => x.ci == 1);
    } else if (this.selectedCategory === 'Virtual') {
      filterData = casinoMenu.filter(x => x.ci == 4);
    } else {
      this.isSelectedCategory = false;
      this.selectedCategory = 'All';
      filterData = Object.assign([], casinoMenu);
    }
    if (this.selectedProvider !== 'All Provider') {
      filterData = Object.assign([], filterData.filter(x => x.pn == this.selectedProvider));
    } else {
      this.isSelectedProvider = false;
      this.selectedProvider = 'All Provider';
    }
    if (this.selectedGame !== 'All Games') {
      filterData = Object.assign([], filterData.filter(x => x.gt == this.selectedGame));
    } else {
      this.isSelectedGame = false;
      this.selectedGame = 'All Games';
    }
    if (this.searchString && (this.searchString).trim() !== '') {
      this.isSearchString = true;
      filterData = Object.assign([], filterData.filter(x => {
        if (x.nm.toLowerCase().includes(this.searchString)) {
          return x;
        }
      }));
    } else {
      this.isSearchString = false;
      this.searchString = '';
    }
    if (!this.isSelectedCategory && !this.isSelectedProvider && !this.isSelectedGame && !this.isSearchString) {
      this.isShowCasinoDetailPage = false;
    }

    if (this.selectedCategory === 'New') {
      this.filterCasinoMenuData = Object.assign([], filterData.sort(GetSortOrder('dorn')));
    } else if (this.selectedCategory === 'Popular') {
      this.filterCasinoMenuData = Object.assign([], filterData.sort(GetSortOrder('dorp')));
    } else if (this.selectedCategory === 'Live') {
      this.filterCasinoMenuData = Object.assign([], filterData.sort(GetSortOrder('dorl')));
    } else if (this.selectedCategory === 'Virtual') {
      this.filterCasinoMenuData = Object.assign([], filterData.sort(GetSortOrder('dorv')));
    } else {
      this.filterCasinoMenuData = Object.assign([], filterData);
    }
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
    this.selectedCasinoGame = this.casinoGameMenu.filter(x => x.ci == 1);
    this.ProviderList = GuestCasinoConfig.data.providerList ? GuestCasinoConfig.data.providerList : [];
    this.FilterProviderList = Object.assign([], this.ProviderList.filter(x => x.appIsShowOnDashboard));

    const casinoMenu = GuestCasinoConfig.data.casinoMenu ? GuestCasinoConfig.data.casinoMenu : [];
    this.casinoMenu = Object.assign([], casinoMenu.filter(x => { return x.pn !== null }));
    if (this.casinoMenu && this.casinoMenu.length > 0) {
      let ProviderList = GuestCasinoConfig.data.providerList ? GuestCasinoConfig.data.providerList : [];
      this.providerList = Object.assign([], ProviderList.sort(function (a, b) {
        return a.appDisplayOrder - b.appDisplayOrder;
      }));
      let casinoGameList = GuestCasinoConfig.data.casinoGameList ? GuestCasinoConfig.data.casinoGameList : [];
      this.casinoGameList = Object.assign([], casinoGameList.filter(x => x.appIsActive));
      this.allCasinoGames[0].Count = this.casinoMenu.filter(x => x.ing).length;
      this.allCasinoGames[1].Count = this.casinoMenu.filter(x => x.ip).length;
      this.allCasinoGames[2].Count = this.casinoMenu.filter(x => x.ci == 1).length;
      this.allCasinoGames[3].Count = this.casinoMenu.filter(x => x.ci == 4).length;
      let newgame = this.casinoMenu.filter(x => x.ing);
      this.allCasinoGames[0].casinoData = newgame.splice(0, 20);
      let populargame = this.casinoMenu.filter(x => x.ip);
      this.allCasinoGames[1].casinoData = populargame.splice(0, 20);
      let livegame = this.casinoMenu.filter(x => x.ci == 1);
      this.allCasinoGames[2].casinoData = livegame.splice(0, 20);
      let virtualgame = this.casinoMenu.filter(x => x.ci == 4);
      this.allCasinoGames[3].casinoData = virtualgame.splice(0, 20);
      this.casinoRoutingFilteration();
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
    this.openLoginModel();
  }
  Allgames(gamename, i) {
    let currentUrl = this.router.url.split('/');
    let providerUrl = currentUrl && currentUrl[2] ? currentUrl[2] : 'provider';;
    let gameUrl = currentUrl && currentUrl[3] ? currentUrl[3] : 'game';
    let typeUrl = currentUrl && currentUrl[4] ? currentUrl[4] : 'type';
    if (this.selectedProvider !== 'allprovider' && this.selectedProvider !== 'All Provider') {
      if (gamename !== 'All Games') {
        if (typeUrl !== 'type') {
          this.router.navigate(['live-casino', this.selectedProvider, gamename, typeUrl]);
        } else {
          this.router.navigate(['live-casino', this.selectedProvider, gamename]);
        }
      } else {
        if (typeUrl !== 'type') {
          this.router.navigate(['live-casino', this.selectedProvider, 'game', typeUrl]);
        } else {
          this.router.navigate(['live-casino', this.selectedProvider]);
        }
      }
    } else if (gamename !== 'All Games') {
      if (typeUrl !== 'type') {
        this.router.navigate(['live-casino', 'provider', gamename, typeUrl]);
      } else {
        this.router.navigate(['live-casino', 'provider', gamename]);
      }
    } else {
      if (typeUrl !== 'type') {
        this.router.navigate(['live-casino', 'provider', 'game', typeUrl]);
      } else {
        this.router.navigate(['live-casino']);
      }
    }

  }
  Allprovider(provider, i) {
    let currentUrl = this.router.url.split('/');
    let providerUrl = currentUrl && currentUrl[2] ? currentUrl[2] : 'provider';;
    let gameUrl = currentUrl && currentUrl[3] ? currentUrl[3] : 'game';
    let typeUrl = currentUrl && currentUrl[4] ? currentUrl[4] : 'type';
    if (this.selectedGame !== 'allgames' && this.selectedGame !== 'All Games') {
      if (typeUrl !== 'type') {
        this.router.navigate(['live-casino', provider, this.selectedGame, typeUrl]);
      } else {
        this.router.navigate(['live-casino', provider !== 'All Provider' ? provider : 'provider', this.selectedGame, typeUrl]);
      }
    } else if (provider !== 'All Provider') {
      if (typeUrl !== 'type') {
        this.router.navigate(['live-casino', provider, 'game', typeUrl]);
      } else {
        this.router.navigate(['live-casino', provider]);
      }
    } else {
      if (typeUrl !== 'type') {
        this.router.navigate(['live-casino', 'provider', 'game', typeUrl]);
      } else {
        this.router.navigate(['live-casino']);
      }
    }
  }
  onAllLoadMoreClick() {
    this.showAllCasinoGames += 16;
  }
  isEmpty(obj) {
    for (var key in obj) {
      if (obj.hasOwnProperty(key))
        return false;
    }
    return true;
  }
  openLoginModel() {
    this.commonService.setLoginPopupOpen(true);
  }
  onScroll() {
    this.showAllCasinoGames += 5;
  }
  onScrollUp() {
    this.showAllCasinoGames -= 5;
  }
  trackByFun(index, item) {
    return index;
  }
  onCasinoTabClick(selectedTab: string) {
    this.selectedCasino = selectedTab;
    const casinoMenu = Object.assign([], this.casinoGameMenu);
    if (selectedTab == 'Providers') {
      this.FilterProviderList = Object.assign([], this.FilterProviderList);
    } else if (selectedTab == 'Live') {
      this.selectedCasinoGame = casinoMenu.filter(x => x.ci == 1);
    } else if (selectedTab == 'Virtual') {
      this.selectedCasinoGame = casinoMenu.filter(x => x.ci == 4);
    }
  }
  onProviderClick(game) {
    this.router.navigate(['live-casino', game.appProviderName]);
  }
  ngOnDestroy() {
    this.casinoMenu = [];
    this.allgamesstatus.unsubscribe();
    this.allproviderstatus.unsubscribe();
  }

}