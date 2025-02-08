import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { AuthFacadeService } from '@clientApp-core/services/authentication/authentication-facade.service';
import { MarketFacadeService } from '@clientApp-core/services/market/market-facade.service';
import { DeviceInfoService } from '@clientApp-core/services/device-info/deviceinfo.services';
import { CommonService } from '@clientApp-core/services/common/common.service';
import { untilDestroyed } from 'ngx-take-until-destroy';
import { take, catchError } from 'rxjs/operators';
import { throwError, BehaviorSubject, Observable } from 'rxjs';
import { fancyRankOrder, GetSortOrder } from '@clientApp-core/utilities/app-configuration';
import { ActiveMarket } from '@clientApp-core/models/market/activemarket.model';
import { Router } from '@angular/router';
import { VeronicapopupComponent } from '@clientApp-shared/components/veronicapopup/veronicapopup.component';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {
  @ViewChild('veronica', { static: true }) veronicaRef: VeronicapopupComponent;
  allMarkets: ActiveMarket[];
  excludeSport = [];
  excludeSportsMarket = [];
  CheckDevice: boolean = false;
  isNewsExits: boolean;
  private _marketSubject = new BehaviorSubject<boolean>(null);
  constructor(private authService: AuthFacadeService
    , private marketService: MarketFacadeService
    , public deviceInfoService: DeviceInfoService
    , public commonService: CommonService
    , public router: Router) {
  }

  ngOnInit() {
    this.isNewsExits = this.commonService.isNewsExits;
    localStorage.removeItem("selected_matches");
    localStorage.removeItem("selected_betId");
    localStorage.removeItem('lobbyUrl');
    this.getConfig();
    this.allMarkets = this.marketService.marketList;
    this.getMarkets();
    this.CheckDevice = window.matchMedia("only screen and (max-width: 576px)").matches;
    this.getNews();
  }
  getCurrentMarket$(): Observable<boolean> {
    return this._marketSubject.asObservable();
  }
  getMarkets() {
    this.marketService.getMarkets$()
      .pipe(
        untilDestroyed(this),
        take(1),
        catchError(err => throwError(err))
      ).subscribe(markets => {
        if (markets && markets.length > 0) {
          this.allMarkets = markets.sort((a, b) => {
            return fancyRankOrder.get(b.mt) - fancyRankOrder.get(a.mt);
          }).sort(GetSortOrder('ed'));
          this.excludeSportsMarket = Object.assign([], this.allMarkets.filter((v) => this.excludeSport.includes(v.st)));
        } else {
          this.commonService.allMarkets = [];
          this.allMarkets = [];
        }
      }, err => console.log('dashboard getMarkets', err));
  }
  getConfig() {
    this.authService.getConfig$()
      .pipe(take(1),
        untilDestroyed(this),
        catchError(err => throwError(err))
      ).subscribe(response => {
        if (response) {
          this.commonService.configData = response; //dashboard
        }
      }, err => console.log('getConfig', err));
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
  ngOnDestroy() {}
}
