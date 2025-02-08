import { Component, OnInit,Input,OnDestroy,EventEmitter,Output, AfterViewInit } from '@angular/core';
import { ActiveMarket } from '@clientApp-core/models/market/activemarket.model';
import { GuestMLConfig, websiteSettings } from '@clientApp-core/services/authentication/authentication-facade.service';
import { BetFacadeService } from '@clientApp-core/services/bet/bet.facade.service';
import { CommonService } from '@clientApp-core/services/common/common.service';
import { DeviceInfoService } from '@clientApp-core/services/device-info/deviceinfo.services';
import { MarketFacadeService } from '@clientApp-core/services/market/market-facade.service';
import { MarketRateFacadeService } from '@clientApp-core/services/market/market-rates/market-rate-facade.service';
import { SessionService } from '@clientApp-core/services/session/session.service';
import { ParkBetState } from '@clientApp-store/store.state';
import { Store } from '@ngrx/store';
import * as SelectedMarket from '@clientApp-store/selected-market/actions/selected-market.actions';
import { arrayUniqueByKey, unionByBetDetailID, unionByBetId } from '@clientApp-core/services/shared/JSfunction.service';
import { MarketRates } from '@clientApp-core/models/market/market-rates.model';
import { MarketRunner } from '@clientApp-core/models/market/market-runner.model';
import { GetSortOrder, fancyRankOrder } from '@clientApp-core/utilities/app-configuration';
import * as M from "materialize-css/dist/js/materialize";
import { BehaviorSubject,Subject,Observable } from 'rxjs';
import { takeUntil } from 'rxjs/operators';


@Component({
  selector: 'app-virtual-market',
  templateUrl: './virtual-market.component.html',
  styleUrls: ['./virtual-market.component.scss']
})
export class VirtualMarketComponent implements OnInit,OnDestroy,AfterViewInit {
  @Input() matchInfo: any;
  @Output() openPopup =  new EventEmitter();
  @Input() tournamentNm: string;
  allMarket: ActiveMarket[] = [];
  currentMarketVolumn: MarketRates[];
  marketRunner: MarketRunner[];
  marketTypeCategory: any;
  matches: any[];
  marketTypeIds: any = [];
  marketCategory = [];
  allMatches: ActiveMarket[];
  selectedIndex: number = -1;
  selectedCategory: string = 'All';
  notifier = new Subject();
  showBallByBall: boolean = false;
  private _marketSubject = new BehaviorSubject<ActiveMarket>(null);
  constructor(private store: Store<ParkBetState>,
    public commonService: CommonService,
    private sessionService: SessionService,
    private marketRateService: MarketRateFacadeService,
public deviceInfoService: DeviceInfoService) { }

  ngOnInit(): void {
    this.subscribeStore();
    this.currentMarketVolumn = Object.assign([], this.commonService.curMarketsVol);
    this.marketRunner = Object.assign([], this.commonService.curMarketsRunners);
    this.allMarket = Object.assign([], this.commonService.curMarketsVol);
    this.selectedMarketData()
  }
  ngAfterViewInit() {
    this.showBallByBall = this.tournamentNm === 'Ball By Ball';
  }
  getCurrentMarket(): Observable<ActiveMarket> {
    return this._marketSubject.asObservable();
  }
  private subscribeStore() {

    this.marketRateService.getAdhocMatchInfo$().pipe(takeUntil(this.notifier)).subscribe(match => {
        //   this.sessionService.joinCentralGroup(match.mc);
        // this.store.dispatch(SelectedMarket.UpsertSelectedMarket({ market: match }));
        // this.sessionService.addMarketGroup('', 3, match.eid, match.mid, match.mc, 0, 0, 0);
    });
    this.marketRateService.getAddNewMarketInfo$().pipe(takeUntil(this.notifier)).subscribe(data => {
      this.commonService.curMarketsVol = Object.assign([], unionByBetId(this.commonService.curMarketsVol, data.marketInfo));
      this.commonService.curMarketsRunners = Object.assign([], unionByBetDetailID(this.commonService.curMarketsRunners,
        data.runnerInfo));

      this.currentMarketVolumn = Object.assign([], this.commonService.curMarketsVol);
      this.marketRunner = Object.assign([], this.commonService.curMarketsRunners);
      this.allMarket = Object.assign([], this.commonService.curMarketsVol);
      this.selectedMarketData()
    });
        // This trigger has used to change market bet allowed flag
        this.marketRateService.getMarketBetAllowChanges$().pipe(takeUntil(this.notifier)).subscribe((data: any) => {
          const index = this.currentMarketVolumn.findIndex(x => x.mid == data.mid);
          if (index !== undefined && index !== null && index >= 0) {
            this.currentMarketVolumn[index].mip = data.appIsBetAllow;
          }
        });
        // This trigger has used to change market volume amount
        this.marketRateService.getMarketRateVolumeChanges$().pipe(takeUntil(this.notifier)).subscribe((data: any) => {
          const index = this.currentMarketVolumn.findIndex(x => x.mid == data.appBetID);
          if (index !== undefined && index !== null && index >= 0) {
            this.currentMarketVolumn[index].mr = data.appMarketRate;
          }
        });
        //  This trigger has used to change market In-Play flag
        this.marketRateService.getInPlayChanges$().pipe(takeUntil(this.notifier)).subscribe((data: any) => {
          const index = this.currentMarketVolumn.findIndex(x => x.mid == data.appBetID);
          if (index !== undefined && index !== null && index >= 0) {
            this.currentMarketVolumn[index].mi = data.appIsInplay;
          }
        });
        //  This trigger has used to change market market status
        this.marketRateService.getMarketStatusChanges$().pipe(takeUntil(this.notifier)).subscribe((data: any) => {
          const index =this.currentMarketVolumn.findIndex(x => x.mid == data.appBetID);
          if (index !== undefined && index !== null && index >= 0) {
            this.currentMarketVolumn[index].ms = data.appBetStatus;
          }
        });
        // This trigger has used to chnage following things
    // 1.is show video flag
    // 2.is Commentary on
    // 3.is channel no.
    // 4.id of Commentary
    this.marketRateService.getMultiMatchWiseInfo$().pipe(takeUntil(this.notifier)).subscribe((data: any) => {
      if (data !== null && data !== undefined &&
        this.matchInfo !== null && this.matchInfo !== undefined) {
        if (data.appIsShowLive !== null && data.appIsShowLive !== undefined) {
          if (this.matchInfo.eid !== undefined && this.matchInfo.eid !== null
            && data.appMatchID !== null && data.appMatchID !== undefined) {
            if (this.matchInfo.eid === data.appMatchID) {
              this.matchInfo.ei = data.appIsShowLive;
              this.matchInfo.ep = data.appIsPlayVideoUrl;
              this.matchInfo.ev = data.appVideoUrl;
              // this.matchInfo$.next(this.matchInfo);
            }
          }

        }
        if (data.appChannelNo !== null && data.appMatchID !== null
          && data.appMatchID !== undefined) {
          if (this.matchInfo.eid !== undefined && this.matchInfo.eid !== null
            && this.matchInfo.eid === data.appMatchID) {
            this.matchInfo.ec = data.appChannelNo;
            // this.matchInfo$.next(this.matchInfo);
          }
        }
        if (data.appIsAutoCommentry != null && data.appCommentryID != null) {
          if (!data.appIsAutoCommentry) {
          }
        }
      }
    });
  }
  selectedMarketData() {
    if (this.allMarket && this.allMarket.length > 0) {
      let allMarket = [];
      if (this.matchInfo.eid != null && this.matchInfo.eid != undefined) {
        allMarket = this.allMarket.filter((game) => {
          return (game.eid === this.matchInfo.eid);
        });
      } else {
        allMarket = this.allMarket;
      }
      const centralizationIds = allMarket.map(match => match.mc).filter(function (el) {
        return el != null && el != undefined && el != '';
      }).toString();
      this.sessionService.joinMultiCentralGroup(centralizationIds);
      allMarket.forEach(market => {
        this.sessionService.addMarketGroup('', 3, market.eid, market.mid, market.mc, 0, 0, 0);
        // this.store.dispatch(SelectedMarket.UpsertSelectedMarket({ market: market }));
      });
      const marketTypeCategory = GuestMLConfig.data.marketType;
      if (marketTypeCategory !== null && marketTypeCategory !== undefined && marketTypeCategory !== '') {
          try {
            this.marketTypeCategory = JSON.parse(marketTypeCategory);
          } catch (e) {
            console.log('marketType parse error ', e);
            this.marketTypeCategory = [];
          }
        }
      if (this.commonService.isMarketLiabilityClick === true) {
        this.matches = this.defaultMarketSorting(allMarket);
        this.commonService.isMarketLiabilityClick = false;
      } else {
        this.matches = this.filteredMatches(allMarket); // filter and sort categorywise matches/market
        if (this.matches.length == 0) {
          this.matches = this.defaultMarketSorting(allMarket);
        }
      }
      this.marketTypeIds = [];
      this.matches = this.matches.map((market: ActiveMarket, index,array: any[]) => {
        return Object.assign({
          isShowFancyTitle: this.checkFancyTitleShow(market, index, array)
        }, market);
      });
      this.allMatches = this.matches;
      const isExitsCategoryName = this.matches.filter(bet => bet.hasOwnProperty('categoryName'));
      if (isExitsCategoryName.length > 0) {
        // const categories = isExitsCategoryName.map(match => match.categoryName);
        const categories =  this.matches.map((market: any) => {
          return Object.assign({ cn: market.categoryName, mt: market.mt, mscd: market.mscd });
        });
        this.marketCategory  = arrayUniqueByKey(categories, 'mscd')
        // console.log(c);
        // this.marketCategory = categories.filter((item, i, ar) => ar.indexOf(item) === i);
        if (this.marketCategory.length <= 1) {
          this.setIndex(-1, 'All');
          this.marketCategory = [];
        } else {
          if (typeof this.marketCategory[this.selectedIndex] !== 'undefined' && this.marketCategory[this.selectedIndex] !== null) {
            this.setIndex(this.selectedIndex, this.marketCategory[this.selectedIndex]['cn']);
          } else {
            this.setIndex(-1, 'All');
          }
          this.initMArketCategoryTabs();
        }
      } else {
        this.setIndex(-1, 'All');
        this.marketCategory = [];
      }
      this._marketSubject.next(this.matches[0]);
    }
  }
  defaultMarketSorting(filterData) {
    return filterData.sort((a, b) => {
      return fancyRankOrder.get(a.mt) - fancyRankOrder.get(b.mt);
    });
  }
  filteredMatches(filterData) {
    if (this.marketTypeCategory && this.marketTypeCategory.length > 0) {
      this.marketTypeCategory = this.marketTypeCategory.sort(GetSortOrder('do'));
      const result = [];
      const betIds = [];
      let MarketCategory = [].concat(...this.marketTypeCategory.map(({ MarketCategory }) => MarketCategory || []));
      MarketCategory = MarketCategory.sort(GetSortOrder('do'));
      if (MarketCategory && MarketCategory.length > 0) {
        MarketCategory.forEach(function (matchKey) { // sub-category loop
          filterData.forEach(function (item: ActiveMarket) { // matches list loop
                if(matchKey.mci == item.mscd){
                let obj = { categoryName: matchKey.mcn };
                obj = { ...obj, ...item };
                if (!betIds.includes(obj['mid'])) {
                  betIds.push(obj['mid'])
                  result.push(obj);
                  }
                }
          });
        });
      } else {
        const data = this.defaultMarketSorting(filterData);
        return data;
      }
      return result;
    } else {
      const data = this.defaultMarketSorting(filterData);
      return data;
    }
  }
  checkFancyTitleShow(currentValue, index, array) {
    if (index > 0) {
      let previousValue = array[index - 1];
      if (currentValue.mt === previousValue.mt) {
        if (currentValue.categoryName == previousValue.categoryName) {
          return false;
        } else {
          return true;
        }
      } else {
        return true;
      }
    } else {
      return true;
    }
  }
  setIndex(index: number, category: string) {
    this.selectedIndex = index;
    this.selectedCategory = category;
  }
  initMArketCategoryTabs() {
    let tabinstances: any;
    if (tabinstances) {
      tabinstances.destroy();
    }
    var elemsTabs = document.querySelectorAll('.tabs');
    tabinstances = M.Tabs.init(elemsTabs, {});
  }
  identify(index, item) {
    return item.mid;
  }
  trackByFun(index, item) {
    return index;
  }
  openLoginModel(){
    if (this.deviceInfoService.isMobile()) {
      document.querySelector(".sidenav").classList.remove('sidenav-close');
      document.querySelector(".sidenav").classList.remove('sidenav-open');
      if (document.querySelector(".custom-sidenav").classList.contains('sidenav-overlay')) {
        document.querySelector(".custom-sidenav").classList.remove('sidenav-overlay');
    }
    }
  this.commonService.setLoginPopupOpen(true);
  }
  ngOnDestroy() {
    this.notifier.next();
    this.notifier.complete(); 
  }
}
