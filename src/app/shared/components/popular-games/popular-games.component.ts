import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
// import { Router } from '@angular/router';
import { AuthFacadeService, casinoGameMenuSettings, GuestCasinoConfig, MostlyPlayed, PopularGames, TrendingGames, websiteSettings } from '@clientApp-core/services/authentication/authentication-facade.service';
import { CommonService } from '@clientApp-core/services/common/common.service';
import { DeviceInfoService } from '@clientApp-core/services/device-info/deviceinfo.services';
import { onCasinoGameClickEvent } from '@clientApp-core/services/shared/dashboard-shared.service';
import { GetSortOrder, mapOrder } from '@clientApp-core/utilities/app-configuration';
import { AmIvisibleDirective } from '@clientApp-shared/directive/am-ivisible.directive';
import { SharedModule } from '@clientApp-shared/shared.module';
import { untilDestroyed } from 'ngx-take-until-destroy';
import { ToastrService } from 'ngx-toastr';
import { throwError } from 'rxjs';
import { catchError, take } from 'rxjs/operators';

@Component({
  standalone: true,
  imports: [CommonModule, SharedModule, AmIvisibleDirective],
  selector: 'app-popular-games',
  templateUrl: './popular-games.component.html',
  styleUrls: ['./popular-games.component.scss']
})
export class PopularGamesComponent implements OnInit,AfterViewInit,OnDestroy {
  config: any;
  filterCasinoMenuData: any = [];
  selectedCategory: any;
  favoritegameslist: any = [];
  user: any;
  trendingGames = [];
  popularData = [];
  isLP: boolean = false;
  popularGames=[];
  startIndex = 0;
  itemsPerPage = 10; 
  constructor(public commonService: CommonService, private authService: AuthFacadeService,
    public deviceInfoService: DeviceInfoService, public router: Router, private toastr: ToastrService) { }

  ngOnInit(): void {
    this.user = JSON.parse(localStorage.getItem('token'));
    if (this.user != null) {
    this.favoriteGames();
    }
    if (this.router.url.indexOf('/home') !== -1) {
      this.isLP = true;
    } else {
      this.isLP = false;
    }
    if(this.deviceInfoService.isMobile()){
      this.itemsPerPage = 5;
    }
    this.config = this.commonService.configData;
    this.popularData = this.user !== null ? PopularGames.data : MostlyPlayed.data;
    this.getPopularGameData(this.startIndex, this.startIndex + this.itemsPerPage);
    this.getConfig();
    this.getGuestCasinoConfig();
    this.getCasinoConfig();
    // this.getPopularGames();
  }
  ngAfterViewInit(): void {
    this.popularScrollEvent();
  }
  popularScrollEvent() {
    this.customscroll('.mp-game-scroll');
    this.customscroll('.landing-popular-game-scroll');
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
  getGuestCasinoConfig() {
    this.authService.getGuestCasinoConfig$()
      .pipe(
        untilDestroyed(this),
        catchError(err => throwError(err))
      ).subscribe(response => {
        if (response) {
          this.getPopularGameData(this.startIndex, this.itemsPerPage);
        }
      }, err => console.log('getConfig', err));
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
          this.getPopularGameData(this.startIndex, this.itemsPerPage);
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
    
          this.getPopularGameData(this.startIndex, this.itemsPerPage);
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
      this.getPopularGameData(this.startIndex, this.startIndex + this.itemsPerPage);
    }
  }
  getPopularGameData(startIndex: number, endIndex: number) {
    if (this.user != null) {
      let casinoMenu = casinoGameMenuSettings.data.casinoMenu ? casinoGameMenuSettings.data.casinoMenu : [];
      const tpGamePermission = websiteSettings.data.tpGamePermission ? websiteSettings.data.tpGamePermission : [];
      casinoMenu = casinoMenu.filter(ele => {
        return (!tpGamePermission.includes(ele.appTpGameRefType) && this.config && this.config[ele.apiParamName] && ele.isActive && ele.providerName !== null);
      });
      // popularData = this.popularData ? this.popularData : [];
      // const sortingArr = popularData.map(x => x.gameName);
      // this.popularGames = casinoMenu.filter(function (o1) {
      //   return popularData.some(function (o2) {
      //     return +o1.appProviderID === +o2.providerId
      //       && o1.name === o2.gameName
      //   });
      // });
      this.popularGames =  casinoMenu.filter(x => x.isPopular).sort(GetSortOrder('displayOrderPopular'));
      if(this.router.url.indexOf('/live-casino') == 0 || this.router.url.indexOf('/campaign') == 0){
        this.popularGames = this.popularGames.slice(0, 9);
      } else {
        this.popularGames = this.popularGames.slice(0, endIndex);
      }
    } else {
      let casinoMenu = GuestCasinoConfig.data.casinoMenu ? GuestCasinoConfig.data.casinoMenu : [];
      this.popularGames =  casinoMenu.filter(x => x.ip).sort(GetSortOrder('dorp'));
      // popularData = this.popularData ? this.popularData : [];
      // const sortingArr = popularData.map(x => x.gameName);
      // this.popularGames = casinoMenu.filter(function (o1) {
      //   return popularData.some(function (o2) {
      //     return +o1.pid === +o2.providerId
      //       && o1.nm === o2.gameName
      //   });
      // });
      if(this.router.url.indexOf('/live-casino') == 0){
        this.popularGames = this.popularGames.slice(0, 9);
      } else {
        this.popularGames = this.popularGames.slice(0, endIndex);
      }
    }
    setTimeout(() => {
      this.popularScrollEvent();
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
  AllFavoriteChanges(slide){
    if (this.user != null) {
    let SelectedFavorite = this.commonService.FavoriteIds;
    if (SelectedFavorite === null) {
      SelectedFavorite = [];
      SelectedFavorite.push(slide.angularCasinoGameId);
      let btns = document.getElementsByClassName('addfavorites' + slide.angularCasinoGameId);
      for (var i = 0; i < btns.length; i++) {
          btns[i].classList.add('active');
      }
      const addgame = {
      appProviderID : slide.appProviderID,
      appAngularCasinoGameID : slide.angularCasinoGameId
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
      obj = SelectedFavorite.find(x => x == slide.angularCasinoGameId);
      if (obj) {
        var index = SelectedFavorite.indexOf(obj);
        SelectedFavorite.splice(index, 1);
        let btns = document.getElementsByClassName('addfavorites' + slide.angularCasinoGameId);
        for (var i = 0; i < btns.length; i++) {
            btns[i].classList.remove('active');
        }
        if (this.selectedCategory === 'Favourite') {
          this.filterCasinoMenuData = this.filterCasinoMenuData.filter((item) => item.angularCasinoGameId !== slide.angularCasinoGameId);
        }
       const removegame = {
           appProviderID : slide.appProviderID,
           appAngularCasinoGameID : slide.angularCasinoGameId
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
        SelectedFavorite.push(slide.angularCasinoGameId);
    let btns = document.getElementsByClassName('addfavorites' + slide.angularCasinoGameId);
    for (var i = 0; i < btns.length; i++) {
        btns[i].classList.add('active');
    }
    let btn = document.getElementsByClassName('addfavorite' + slide.angularCasinoGameId);
    for (var i = 0; i < btn.length; i++) {
        btn[i].classList.add('active');
    }
        const addgame = {
           appProviderID : slide.appProviderID,
           appAngularCasinoGameID : slide.angularCasinoGameId
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
  trackByFun(index, item) {
    return index;
  }
  ngOnDestroy(): void {
    
  }

}

