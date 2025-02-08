import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
// import { Router } from '@angular/router';
import { AuthFacadeService, casinoGameMenuSettings, GuestCasinoConfig, MostlyPlayed, PopularGames, RecommendGames, TrendingGames } from '@clientApp-core/services/authentication/authentication-facade.service';
import { CommonService } from '@clientApp-core/services/common/common.service';
import { apiEndPointData } from '@clientApp-core/services/config/connfig.service';
import { DeviceInfoService } from '@clientApp-core/services/device-info/deviceinfo.services';
import { onCasinoGameClickEvent } from '@clientApp-core/services/shared/dashboard-shared.service';
import { GetSortOrder, mapOrder } from '@clientApp-core/utilities/app-configuration';
import { SharedModule } from '@clientApp-shared/shared.module';
import { untilDestroyed } from 'ngx-take-until-destroy';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
@Component({
  standalone: true,
  imports:[CommonModule,SharedModule],
  selector: 'app-trending-games',
  templateUrl: './trending-games.component.html',
  styleUrls: ['./trending-games.component.scss']
})
export class TrendingGamesComponent implements OnInit, AfterViewInit, OnDestroy {
  user: any;
  trendingGames = [];
  gameData = [];
  popularData = [];
  isLP: boolean = false;
  popularGames=[];
  startIndex = 0;
  itemsPerPage = 10; 
  constructor(public commonService: CommonService, private authService: AuthFacadeService,
    public deviceInfoService: DeviceInfoService, public router: Router) { }

  ngOnInit(): void {
    if (this.router.url.indexOf('/home') !== -1) {
      this.isLP = true;
    } else {
      this.isLP = false;
    }
    if(this.deviceInfoService.isMobile()){
      this.itemsPerPage = 5;
    }
    this.user = JSON.parse(localStorage.getItem('token'));
    this.gameData = this.user !== null ? RecommendGames.data : TrendingGames.data;
    this.popularData = this.user !== null ? PopularGames.data : MostlyPlayed.data;
    this.getTrandingGameData();
    // this.getPopularGameData(this.startIndex, this.startIndex + this.itemsPerPage);
    this.getGuestCasinoConfig();
    this.getCasinoConfig();
    this.getTrendingGames();
    this.getPopularGames();
  }
  ngAfterViewInit(): void {
    this.trendingScrollEvent();
    this.popularScrollEvent();
  }
  trendingScrollEvent() {
    const scroll: any  = document.querySelector(".trendingScroll");
    var isDown = false;
    var scrollX;
    var scrollLeft;
   if(scroll){
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
  }
  popularScrollEvent() {
    const scroll: any  = document.querySelector(".popularScroll");
    var isDown = false;
    var scrollX;
    var scrollLeft;
   if(scroll){
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
  }
  getGuestCasinoConfig() {
    this.authService.getGuestCasinoConfig$()
      .pipe(
        untilDestroyed(this),
        catchError(err => throwError(err))
      ).subscribe(response => {
        if (response) {
          this.getTrandingGameData();
          // this.getPopularGameData(this.startIndex, this.itemsPerPage);
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
          this.getTrandingGameData();
          // this.getPopularGameData(this.startIndex, this.itemsPerPage);
        }
      }, err => console.log('getConfig', err));
  }
  getTrendingGames() {
    this.authService.getTrendingGames$()
      .pipe(
        untilDestroyed(this),
        catchError(err => throwError(err))
      ).subscribe((response: any) => {
        if (response && response.result) {
          this.gameData = response.result.data;
          this.getTrandingGameData();
        }
      }, err => console.log('getConfig', err));
  }
  getPopularGames() {
    this.authService.getMostlyPlayedGames$()
      .pipe(
        untilDestroyed(this),
        catchError(err => throwError(err))
      ).subscribe((response: any) => {
        if (response && response.result) {
          this.popularData = response.result.data;
          this.getPopularGameData(this.startIndex, this.startIndex + this.itemsPerPage);
        }
      }, err => console.log('getConfig', err));
  }
  onElementVisible(visible: boolean) {
    if (visible) {
      this.startIndex += this.itemsPerPage;
      // this.getPopularGameData(this.startIndex, this.startIndex + this.itemsPerPage);
    }
  }
  getPopularGameData(startIndex: number, endIndex: number) {
    if (this.user != null) {
      let casinoMenu = casinoGameMenuSettings.data.casinoMenu ? casinoGameMenuSettings.data.casinoMenu : [],
      popularData = this.popularData ? this.popularData : [];
      this.popularGames = casinoMenu.filter(function (o1) {
        return popularData.some(function (o2) {
          return +o1.appProviderID === +o2.providerId
            && o1.name === o2.gameName
        });
      });
      this.popularGames = this.popularGames.map((o1)=>{
        const val = popularData.find(function (o2) {
          return +o1.appProviderID === +o2.providerId
            && o1.name === o2.gameName
        });
        return Object.assign({clientsPlayed: val.clientsPlayed }, o1);
      }).sort(GetSortOrder('clientsPlayed')).reverse().slice(0, endIndex);
    } else {
      let casinoMenu = GuestCasinoConfig.data.casinoMenu ? GuestCasinoConfig.data.casinoMenu : [],
      popularData = this.popularData ? this.popularData : [];
      this.popularGames = casinoMenu.filter(function (o1) {
        return popularData.some(function (o2) {
          return +o1.pid === +o2.providerId
            && o1.nm === o2.gameName
        });
      });
      this.popularGames = this.popularGames.map((o1)=>{
        const val = popularData.find(function (o2) {
          return +o1.pid === +o2.providerId
            && o1.nm === o2.gameName
        });
        return Object.assign({clientsPlayed: val.clientsPlayed }, o1);
      }).sort(GetSortOrder('clientsPlayed')).reverse().slice(0, endIndex);
    }
    setTimeout(() => {
      this.popularScrollEvent();
    }, 1000);
  }
  getTrandingGameData() {
    if (this.user != null) {
      let casinoMenu = casinoGameMenuSettings.data.casinoMenu ? casinoGameMenuSettings.data.casinoMenu : [], gameData = this.gameData ? this.gameData : [];
      const sortingArr = gameData.map(x => x.gameName);
      this.trendingGames = casinoMenu.filter(function (o1) {
        return gameData.some(function (o2) {
          return +o1.appProviderID === +o2.providerId
            && o1.name === o2.gameName
        });
      });
      this.trendingGames = mapOrder(this.trendingGames, sortingArr, 'name');
    } else {
      let casinoMenu = GuestCasinoConfig.data.casinoMenu ? GuestCasinoConfig.data.casinoMenu : [], gameData = this.gameData ? this.gameData : [];
      const sortingArr = gameData.map(x => x.gameName);
      this.trendingGames = casinoMenu.filter(function (o1) {
        return gameData.some(function (o2) {
          return +o1.pid === +o2.providerId
            && o1.nm === o2.gameName
        });
      });
      this.trendingGames = mapOrder(this.trendingGames, sortingArr, 'nm');
    }
    setTimeout(() => {
      this.trendingScrollEvent();
      // this.popularScrollEvent();
    }, 1000);
  }
  getProviderName(providerId) {
    if (this.user != null) {
      let ProviderList = casinoGameMenuSettings.data.providerList ? casinoGameMenuSettings.data.providerList :  [];
      const obj = ProviderList.find(x => x.appProviderID == providerId);
      return obj !== null && obj !== undefined ? obj.appProviderName : '';
    } else {
      let ProviderList = GuestCasinoConfig.data.providerList ? GuestCasinoConfig.data.providerList : [];
      const obj = ProviderList.find(x => x.appProviderID == providerId);
      return obj !== null && obj !== undefined ? obj.appProviderName : '';
    }

  }
  onCasinoGameClick(param) {
    if (this.user != null) {
      onCasinoGameClickEvent(param)
    } else {
      this.openLoginModel();
    }
  }
  openLoginModel(){
  this.commonService.setLoginPopupOpen(true);
  }
  errorHandler(event) {
    event.target.src = this.commonService.contentRelativePath(apiEndPointData.data.casinoDefaultPath);
  }
  trackByFun(index, item) {
    return index;
  }
  ngOnDestroy(): void {
    
  }
}
