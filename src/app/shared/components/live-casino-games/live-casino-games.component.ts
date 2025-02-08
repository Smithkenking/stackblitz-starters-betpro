import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
// import { Router } from '@angular/router';
import { AuthFacadeService, casinoGameMenuSettings, websiteSettings } from '@clientApp-core/services/authentication/authentication-facade.service';
import { CommonService } from '@clientApp-core/services/common/common.service';
import { apiEndPointData } from '@clientApp-core/services/config/connfig.service';
import { DeviceInfoService } from '@clientApp-core/services/device-info/deviceinfo.services';
import { onCasinoGameClickEvent } from '@clientApp-core/services/shared/dashboard-shared.service';
import { SharedModule } from '@clientApp-shared/shared.module';
import { untilDestroyed } from 'ngx-take-until-destroy';
import { throwError } from 'rxjs';
import { catchError, take } from 'rxjs/operators';
import { LoadingEffectComponent } from "../loading-effect/loading-effect.component";
@Component({
    standalone: true,
    selector: 'app-live-casino-games',
    templateUrl: './live-casino-games.component.html',
    styleUrls: ['./live-casino-games.component.scss'],
    imports: [CommonModule, SharedModule, LoadingEffectComponent]
})
export class LiveCasinoGamesComponent implements OnInit, OnDestroy {
  casinoGameMenu = [];
  config: any;
  selectedCasinoGame = [];
  providerList = [];
  selectedCasino: string = 'Live';
  isCheckedDarkTheme: boolean = false;
  FilterProviderList = [];
  casinoProviderItems:boolean[];
  constructor(public commonService: CommonService, private router: Router, private authService: AuthFacadeService,private deviceInfoService : DeviceInfoService) {
      this.commonService.getDarkThemeStatus().subscribe(isChecked => {
        this.isCheckedDarkTheme = isChecked;
      });
     }

    ngOnInit(): void {
      const darkThemeCurrentState = this.commonService.getCookieValue('isCheckedDarkTheme');
      this.isCheckedDarkTheme = (darkThemeCurrentState != null && darkThemeCurrentState != undefined && darkThemeCurrentState != '') ? JSON.parse(darkThemeCurrentState).isCheckedDarkTheme : false;
      this.getCasinoDetails();
      this.getConfig();
      this.getCasinoConfig();
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
            this.getCasinoDetails();
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
            this.getCasinoDetails();
          }
        }, err => console.log('getConfig', err));
    }
    getCasinoDetails() {
      this.config = websiteSettings.data;
        const ProviderList = casinoGameMenuSettings.data.providerList ? casinoGameMenuSettings.data.providerList : [];
        const casinoGameMenu = casinoGameMenuSettings.data.casinoMenu ? casinoGameMenuSettings.data.casinoMenu : [];
        const tpGamePermission = websiteSettings.data.tpGamePermission ? websiteSettings.data.tpGamePermission : [];
        const filterProviderlist = ProviderList.filter(x => {
          return !tpGamePermission.includes(x.appTpGameRefType) && x.appIsShowOnDashboard;
         });
        this.casinoGameMenu = casinoGameMenu.filter(x => {
          return !tpGamePermission.includes(x.appTpGameRefType);
        });
      this.selectedCasinoGame =  this.casinoGameMenu.filter(x => x.categoryID == 1);
      this.FilterProviderList = Object.assign([], filterProviderlist);
      this.casinoProviderItems = new Array(this.FilterProviderList.length);
      this.casinoProviderItems.fill(false);
    }
     onCasinoGameClick(param) {
      onCasinoGameClickEvent(param)
    }
    onProviderClick(game, i){
    this.commonService.allprovidersget(game.appProviderName);
      if (this.router.url.indexOf('/live-casino') !== 0) {
          this.router.navigate(['live-casino', game.appProviderName]);
      } else {
        let currentUrl = this.router.url.split('/');
        let providerUrl = currentUrl && currentUrl[2] ? currentUrl[2] : 'provider';;
        let gameUrl = currentUrl && currentUrl[3] ? currentUrl[3] : 'game';
        let typeUrl = currentUrl && currentUrl[4] ? currentUrl[4] : 'type';
        if (typeUrl !== 'type') {
          this.router.navigate(['live-casino', game.appProviderName, gameUrl , typeUrl]);
        } else {
          this.router.navigate(['live-casino', game.appProviderName]);
        }
        }
    }
    errorHandler(event) {
      event.target.src = this.commonService.contentRelativePath(apiEndPointData.data.casinoDefaultPath);
    }
    trackByFn(index: number, item: any) {  
      return index;  
    }
    onCasinoTabClick(selectedTab: string) {
      this.selectedCasino = selectedTab;
      const casinoMenu = Object.assign([], this.casinoGameMenu);
      if (selectedTab == 'Providers') {
        this.FilterProviderList = Object.assign([], this.FilterProviderList);
        this.casinoProviderItems = new Array(this.FilterProviderList.length);
        this.casinoProviderItems.fill(false);
      } else if (selectedTab == 'Live') {
       this.selectedCasinoGame =  casinoMenu.filter(x => x.categoryID == 1);
      } else if (selectedTab == 'Virtual') {
        this.selectedCasinoGame =  casinoMenu.filter(x => x.categoryID == 4);
      }
    }
    providerMouseEvent(index, value) {
      this.casinoProviderItems[index] = value;
  }
  ngOnDestroy() {}
}
