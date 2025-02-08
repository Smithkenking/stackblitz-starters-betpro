import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
// import { Router } from '@angular/router';
import { ActiveMarket } from '@clientApp-core/models/market/activemarket.model';
import { AuthFacadeService, casinoGameMenuSettings } from '@clientApp-core/services/authentication/authentication-facade.service';
import { CasinoService } from '@clientApp-core/services/casino/casino.service';
import { CommonService } from '@clientApp-core/services/common/common.service';
import { MarketFacadeService } from '@clientApp-core/services/market/market-facade.service';
import { arrayUniqueByKey } from '@clientApp-core/services/shared/JSfunction.service';
import { fancyRankOrder, GetDateSortOrder, GetSortOrder } from '@clientApp-core/utilities/app-configuration';
import { SharedModule } from '@clientApp-shared/shared.module';
import { untilDestroyed } from 'ngx-take-until-destroy';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { CheckInplayTypePipe } from "../../pipes/check-inplay-type.pipe";
import { OrdinalDatePipe } from "../../pipes/ordinal-date.pipe";
import { splitVSPipe } from "../../pipes/split.pipe";
import { IstToPktPipe } from "../../pipes/ist-to-pkt.pipe";

@Component({
    standalone: true,
    selector: 'app-recent-activity',
    templateUrl: './recent-activity.component.html',
    styleUrls: ['./recent-activity.component.scss'],
    imports: [CommonModule, SharedModule, CheckInplayTypePipe, OrdinalDatePipe, splitVSPipe, IstToPktPipe]
})
export class RecentActivityComponent implements OnInit,OnDestroy {
  casinoGameMenu: any;
  getCookieMatch: any;
  allMarkets: ActiveMarket[] =[];
  uniqueMarkets: ActiveMarket[] = [];
  public getRecentTopFiveList = [];
  getTopFiveList: any =[];
  selectedMatchcookie: any;
  providerList = [];
  constructor(public commonService: CommonService,private router:Router,
    private casinoService: CasinoService,private authService: AuthFacadeService,
    private marketFacadeService: MarketFacadeService) { }

  ngOnInit(): void {
    this.getmarket();
    this.getMarkets();
    this.getCasinoConfig();
    this.recentActivity();
  }
  getmarket() {
    const matches = this.marketFacadeService.marketList;
    this.allMarkets = matches.sort((a, b) => {
      return fancyRankOrder.get(b.mt) - fancyRankOrder.get(a.mt);
    }).sort(GetSortOrder('ed'));
    this.uniqueMarkets = Object.assign([], arrayUniqueByKey(this.allMarkets, 'eid'));
  }
  recentActivity() {
    this.getRecentTopFiveList = [];
    this.getTopFiveList = [];
    this.providerList = casinoGameMenuSettings.data.providerList ? casinoGameMenuSettings.data.providerList : [];
    this.casinoGameMenu = casinoGameMenuSettings.data.casinoMenu ? casinoGameMenuSettings.data.casinoMenu : [];
    const cookieValue = this.commonService.getCookieValue('selected_match_name');
    if (cookieValue.length > 0) {
    const getCookieMatch = JSON.parse(cookieValue);
    this.getCookieMatch = Object.assign([], getCookieMatch.sort(GetDateSortOrder('date', 'desc')));
    this.getCookieMatch = arrayUniqueByKey(this.getCookieMatch, 'id');
    const topfiveCookie = this.getCookieMatch.filter((month, idx) => idx < 5);
    this.commonService.setCookieValue('selected_match_name', JSON.stringify(topfiveCookie));
    for (let i = 0; i < topfiveCookie.length; i++) {
      if (topfiveCookie[i].type == "Match") {
        var selectedMatchName = this.allMarkets.filter(x => x.eid == topfiveCookie[i].id);
        if (selectedMatchName != null && selectedMatchName.length > 0) {
          this.getRecentTopFiveList.push(selectedMatchName[0]);
        }
        this.getTopFiveList = Object.assign([],this.getRecentTopFiveList);
      }
      else {
        var selectedCasino = this.casinoGameMenu.filter(x => x.angularCasinoGameId == topfiveCookie[i].id);
        if (selectedCasino != null && selectedCasino.length > 0) {
          this.getRecentTopFiveList.push(selectedCasino[0]);
        }
        this.getTopFiveList = Object.assign([],this.getRecentTopFiveList);
      }
      if (i == 4) {
        break;
      }
      }
    }
  }
  recentMarketClick(match: any, betId?) {
    const eventName = ((match.en.trim())).replace(/\s/g, '');
    if (betId && betId !== undefined) {
      this.router.navigate(['event', match.eid,betId, eventName]);
    } else {
      this.router.navigate(['event', match.eid, eventName]);
    }
    var matchCookie = [], selectedMatchcookie = [],selectedMatchName='';
      if (this.commonService.getCookieValue('selected_match_name')) {
        matchCookie = JSON.parse(this.commonService.getCookieValue('selected_match_name'));
      }
      if (matchCookie != null) {
        selectedMatchcookie = matchCookie;
      }
       selectedMatchName = match.eid;
      
      
      const matchObj = new Object({
        id: selectedMatchName,
        type: 'Match',
        date: new Date()
      });
      selectedMatchcookie.push(matchObj);
      var selectedMatchcookieStr = JSON.stringify(selectedMatchcookie);
    this.commonService.setCookieValue('selected_match_name', selectedMatchcookieStr);
    this.recentActivity();
  }
  recentCasinoClick(param) {
    this.commonService.setLoadingStatus(true);
    this.casinoService.getCasinoToken(param);
    var getCasinoCookie = [], selectedCasino = [];
    const CasinoObj = new Object({
      id:param.angularCasinoGameId,
      type:'Casino',
      date: new Date()
    });
    if (this.commonService.getCookieValue('selected_match_name')) {
      getCasinoCookie = JSON.parse(this.commonService.getCookieValue('selected_match_name'));
    }

    if (getCasinoCookie != null) {
      selectedCasino = getCasinoCookie;
    }

    selectedCasino.push(CasinoObj);
    this.commonService.setCookieValue('selected_match_name', JSON.stringify(selectedCasino));
    this.recentActivity();
  }
  getMarkets() {
    this.marketFacadeService.getMarkets$()
      .pipe(
        untilDestroyed(this),
        catchError(err => throwError(err))
      ).subscribe(markets => {
        if (markets && markets.length > 0) {
          this.getmarket();
          this.recentActivity();
        } 
      }, err => console.log('dashboard getMarkets', err));
  }
  getCasinoConfig() {
    this.authService.getCasinoConfig$()
      .pipe(
        untilDestroyed(this),
        catchError(err => throwError(err))
      ).subscribe(response => {
        if (response) {
          this.recentActivity();
        }
      }, err => console.log('getConfig', err));
  }
  getProviderName(providerId) {
    const obj = this.providerList.find(x => x.appProviderID == providerId);
    return obj !== null && obj !== undefined ? obj.appDisplayName : '';
  }
  ngOnDestroy(): void {
    
  }
}
