import { AfterViewInit, Component, ElementRef, EventEmitter, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { ParkBetState } from '@clientApp-store/store.state';
import { Store } from '@ngrx/store';
import { BehaviorSubject, Observable, Subject,Subscription } from 'rxjs';
import { MarketRateFacadeService } from '@clientApp-core/services/market/market-rates/market-rate-facade.service';
import { Match } from '@clientApp-core/models/market/match.model';
import { fancyRankOrder, GetSortOrder } from '@clientApp-core/utilities/app-configuration';
import { CommonService } from '@clientApp-core/services/common/common.service';
import { MarketFacadeService } from '@clientApp-core/services/market/market-facade.service';
import { SessionService } from '@clientApp-core/services/session/session.service';
import { AuthFacadeService, GuestMLConfig } from '@clientApp-core/services/authentication/authentication-facade.service';
import { MarketRates } from '@clientApp-core/models/market/market-rates.model';
import { MarketRunner } from '@clientApp-core/models/market/market-runner.model';
declare var $: any;
import * as M from "materialize-css/dist/js/materialize";
import { takeUntil } from 'rxjs/operators';
import { untilDestroyed } from 'ngx-take-until-destroy';
import * as SelectedMarket from '@clientApp-store/selected-market/actions/selected-market.actions';
import { Stake } from '@clientApp-core/models/bet/stake.model';
import { BetFacadeService } from '@clientApp-core/services/bet/bet.facade.service';
import { ActiveMarket } from '@clientApp-core/models/market/activemarket.model';
import { mapGroupByKey, unionByBetDetailID, unionByBetId } from '@clientApp-core/services/shared/JSfunction.service';
import { ActivatedRoute } from '@angular/router';
import { EstimatedProfitLoss } from '@clientApp-core/models/bet/estimated-profit-loss.model';
import { apiEndPointData } from '@clientApp-core/services/config/connfig.service';
@Component({
  selector: 'app-dashboard-market',
  templateUrl: './dashboard-market.component.html',
  styleUrls: ['./dashboard-market.component.scss']
})
export class DashboardMarketComponent implements OnInit,AfterViewInit, OnDestroy {
  @Output() openPopup =  new EventEmitter();
  market: any=[];
  notifier = new Subject();
  matchInfo$ = new BehaviorSubject<Match>(null);
  allMatches: ActiveMarket[];
  dashMarket: any = [];
  null: any = [];
  isDarkTheme: boolean = false;
  marketTypeCategory: any;
  matches: any[];
  marketTypeIds: any = [];
  marketCategory = [];
  selectedIndex: number = -1;
  private _marketSubject = new BehaviorSubject<ActiveMarket>(null);
  matchInfo: any[] & Match;
  currentMarketVolumn: MarketRates[];
  marketRunner: MarketRunner[];
  allMarket: ActiveMarket[] = [];
  selectedMatchId: any;
  team1: string = '';
  team2: string = '';
  team1_name1: string = '';
  team1_name2: string = '';
  team2_name1: string = '';
  team2_name2: string = '';
  selectedCategory: string = 'All';
  markets: any = [];
  bet: Stake;
  togglePanelView: boolean;
  lastSelectedItem: string;
  modalInstances: any;
  eventId: any;
  marketId: any;
  tournament: string = '';
  isShowBetSlipBelowRunner: boolean;
  isOpenBottomBetSlip: boolean = false;
  isDetailBetSlip: boolean = false;
  private subscription: Subscription;
  @ViewChild('betpanelModal', { static: true }) template: ElementRef;
  allMarkets: ActiveMarket[];
  tournamentName: string;
  constructor(private store: Store<ParkBetState>,
              public commonService: CommonService,
              private marketFacadeService: MarketFacadeService,
              private sessionService: SessionService,
              private _authService: AuthFacadeService,
              private betService: BetFacadeService,
              private marketRateService: MarketRateFacadeService,
              private route: ActivatedRoute) {
       this.subscription = this.route.params.subscribe((params) => {
        this.eventId = +params.id;
        if (params && params.mid) {
          this.marketId = +params.mid;
        }
        if (this.eventId) { this.getMatchWiseMarketData(); }
      });
    this.commonService.getDarkThemeStatus().subscribe(isChecked => {
      this.isDarkTheme = isChecked;
    });


   }

  ngOnInit() {
    this.isShowBetSlipBelowRunner = apiEndPointData.data.isShowBetSlipBelowRunner;
    this.subscribeStore();
    const darkThemeCurrentState = this.commonService.getCookieValue('isCheckedDarkTheme');
    this.isDarkTheme = (darkThemeCurrentState != null && darkThemeCurrentState != undefined && darkThemeCurrentState != '') ? JSON.parse(darkThemeCurrentState).isCheckedDarkTheme : false;
    this.removeMarketFromList();
    if(!apiEndPointData.data.isShowBetSlipBelowRunner){
      this.betService.getStake$().pipe(takeUntil(this.notifier),untilDestroyed(this)).subscribe(bet => {
        if (this.bet && this.bet.betDetailId === bet.betDetailId &&
          this.lastSelectedItem === bet.currentSelectedItem) {
          this.togglePanelView = !this.togglePanelView;
          this.bet = bet;
          this.betService.sendEstimatedProfitLoss().next([]);
          this.resetBookValue();
        } else if (this.bet && bet.betId === this.bet.betId && bet.closeMe) {
          this.togglePanelView = false;
          this.betService.sendEstimatedProfitLoss().next([]);
        } else if (!bet.closeMe) {
          this.bet = bet;
          this.lastSelectedItem = bet.currentSelectedItem;
          this.togglePanelView = true;
          this.betService.sendEstimatedProfitLoss().next([]);
        } else if (bet.betId === undefined && bet.closeMe) {
          this.togglePanelView = false;
          this.betService.sendEstimatedProfitLoss().next([]);
          this.resetBookValue();
        }
        this.openModal();
      });
    }
  }
  ngAfterViewInit() {
    this.marketCategoryEvents();
    this.initMArketCategoryTabs();
    const options = {
      dismissible: false,
      onCloseEnd() {
        $('body').css('overflow', '')
      }
    }
    this.modalInstances = M.Modal.init(this.template?.nativeElement, options);
  }
  getTournamentName() {
    this.allMarkets = GuestMLConfig.data.allActiveMarketList ? GuestMLConfig.data.allActiveMarketList : [];
    if (this.allMarkets && this.allMarkets.length > 0) {
      const obj = this.allMarkets.find(x => x.eid === this.market.eid);
      this.tournamentName = obj && obj.tn ? obj.tn : '';
    } else {
      this.tournamentName = this.market && this.market.tn ? this.market.tn : '';
    }
  }
  getTeamName() {
    try {
      const marketInfo = this.dashMarket.marketInfo[0];
      this.tournament = marketInfo ? marketInfo.tn : '';
      this.market = this.dashMarket.matchInfo[0];
      const str = this.market && this.market.en ? this.market.en : "";
      let vrunnerName:any = [];
      if (str.includes(" V ")) {
        vrunnerName = this.market && this.market.en ? this.market.en.split(' V ') : [];
      } else if (str.includes(" @ ")) {
        vrunnerName = this.market && this.market.en ? this.market.en.split(' @ ') : [];
       } else {
        vrunnerName = this.market && this.market.en ? this.market.en.split(' v ') : [];
      }
      if (vrunnerName !== null && vrunnerName !== undefined && vrunnerName.length > 0) {
        const team1 = vrunnerName[0];
        const team2 = vrunnerName[1];
        this.team1 = vrunnerName[0];
        this.team2 = vrunnerName[1];
        this.team1_name1 = team1 ? team1.split(/ (.+)/)[0] : '';
        this.team1_name2 = team1 ? team1.split(/ (.+)/)[1] : '';
        this.team2_name1 = team2 ? team2.split(/ (.+)/)[0] : '';
        this.team2_name2 = team2 ? team2.split(/ (.+)/)[1] : '';
      } else {
        this.team1_name1 = this.market && this.market.en ? this.market.en : '';
      }
      } catch (ex) {
        console.log(ex)
      }
  }
  getMatchWiseMarketData() {
    this._authService.getDashboardMarket(this.eventId).pipe(takeUntil(this.notifier)).subscribe((result: any) => {
      this.allMarket = Object.assign([], result.marketInfo);
      this.dashMarket = result;
      this.getTeamName();  
      this.matchInfo = Object.assign([], this.dashMarket.matchInfo[0]);     
      this.currentMarketVolumn = Object.assign([], this.dashMarket.marketInfo);
      this.commonService.curMarketsVol = Object.assign([], this.dashMarket.marketInfo);
      this.commonService.curMarketsRunners = Object.assign([], this.dashMarket.runnerInfo);
      this.marketRunner = Object.assign([], this.dashMarket.runnerInfo);
      this.matchInfo$.next(this.matchInfo);
      this.selectedMarketData();
      this._marketSubject.next(this.eventId);
    });
  }
  private subscribeStore() {

    this.marketRateService.getAdhocMatchInfo$().pipe(takeUntil(this.notifier)).subscribe(match => {
      const matches = this.allMarket.filter(o2 => match.mid === o2.mid);
      if (matches && matches.length === 0 && this.allMarket.find(x => x.eid === match.eid)) {
          this.sessionService.joinCentralGroup(match.mc);
        this.store.dispatch(SelectedMarket.UpsertSelectedMarket({ market: match }));
        this.sessionService.addMarketGroup('', 3, match.eid, match.mid, match.mc, 0, 0, 0);
        this.allMarket.push(match);
        this.resetMarketCategory();
      }
    });
    this.marketRateService.getAddNewMarketInfo$().pipe(takeUntil(this.notifier)).subscribe(data => {
      this.commonService.curMarketsVol = Object.assign([], unionByBetId(this.commonService.curMarketsVol, data.marketInfo));
      this.commonService.curMarketsRunners = Object.assign([], unionByBetDetailID(this.commonService.curMarketsRunners,
        data.runnerInfo));

      this.currentMarketVolumn = Object.assign([], this.commonService.curMarketsVol);
      this.marketRunner = Object.assign([], this.commonService.curMarketsRunners);
      this.matchInfo$.next(this.matchInfo);
      this._marketSubject.next(this.market);
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
              this.matchInfo$.next(this.matchInfo);
            }
          }

        }
        if (data.appChannelNo !== null && data.appMatchID !== null
          && data.appMatchID !== undefined) {
          if (this.matchInfo.eid !== undefined && this.matchInfo.eid !== null
            && this.matchInfo.eid === data.appMatchID) {
            this.matchInfo.ec = data.appChannelNo;
            this.matchInfo$.next(this.matchInfo);
          }
        }
        if (data.appIsAutoCommentry != null && data.appCommentryID != null) {
          if (!data.appIsAutoCommentry) {
          }
        }
      }
    });
  }
  getMatchInfo$(): Observable<Match> {
    return this.matchInfo$.asObservable();
  }

  openLoginModel(){
    this.cancelBet();
  this.commonService.setLoginPopupOpen(true);
  }

  getCurrentMarket(): Observable<ActiveMarket> {
    return this._marketSubject.asObservable();
  }

  selectedMarketData() {
    if (this.allMarket && this.allMarket.length > 0) {
      let allMarket = [];
      if (this.marketId != null && this.marketId != undefined) {
        allMarket = this.allMarket.filter((game) => {
          return (game.mid === this.marketId);
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
      // const am = Object.assign([], this.allMatches);
      // let matchesGroup = mapGroupByKey(am, 'mt');
      // this.markets =  Object.keys(matchesGroup).map(key => ({
      //   marketType: +key,
      //   matches: matchesGroup[key]
      //   })).sort((a, b) => {
      //     return fancyRankOrder.get(a.marketType) - fancyRankOrder.get(b.marketType);
      //   });
      const isExitsCategoryName = this.matches.filter(bet => bet.hasOwnProperty('categoryName'));
      if (isExitsCategoryName.length > 0) {
        const categories = isExitsCategoryName.map(match => match.categoryName);
        this.marketCategory = categories.filter((item, i, ar) => ar.indexOf(item) === i);
        if (this.marketCategory.length <= 1) {
          this.setIndex(-1, 'All');
          this.marketCategory = [];
        } else {
          if (typeof this.marketCategory[this.selectedIndex] !== 'undefined' && this.marketCategory[this.selectedIndex] !== null) {
            this.setIndex(this.selectedIndex, this.marketCategory[this.selectedIndex]);
          } else {
            this.setIndex(-1, 'All');
          }
          this.initMArketCategoryTabs();
        }
      } else {
        this.setIndex(-1, 'All');
        this.marketCategory = [];
      }
    }
  }
  removeMarketFromList() {
    this.marketFacadeService.getMarketToRemove$().pipe(takeUntil(this.notifier),untilDestroyed(this)).subscribe(id => {
      const matches = Object.assign([], this.allMatches.filter(o2 => id === o2.mid));
      if (matches && matches.length > 0) {
        const allMarket = Object.assign([], this.allMarket);
        this.allMarket = allMarket.filter(o2 => id !== o2.mid);
        this.resetMarketCategory();
        const stake = new Stake();
        stake.closeMe = true;
        stake.betId = id;
        this.betService.setStake().next(stake);
      }
    });
  }
  cancelBet() {
    this.betService.setStake().next(this.bet);
    this.betService.setSelectedRunner().next();
  }
  resetMarketCategory() {
    this.matches = this.filteredMatches(this.allMarket); // filter and sort categorywise matches/market
    if (this.matches.length == 0) {
      this.matches = this.defaultMarketSorting(this.allMarket);
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
      const categories = isExitsCategoryName.map(match => match.categoryName);
      this.marketCategory = categories.filter((item, i, ar) => ar.indexOf(item) === i);
      if (this.marketCategory.length <= 1) {
        this.setIndex(-1, 'All');
        this.marketCategory = [];
      } else {
        if (typeof this.marketCategory[this.selectedIndex] !== 'undefined' && this.marketCategory[this.selectedIndex] !== null) {
          this.setIndex(this.selectedIndex, this.marketCategory[this.selectedIndex]);
        } else {
          this.setIndex(-1, 'All');
        }
        this.initMArketCategoryTabs();
      }
    } else {
      this.setIndex(-1, 'All');
      this.marketCategory = [];
    }
  }
  setIndex(index: number, category: string) {
    this.selectedIndex = index;
    this.selectedCategory = category;
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

  trackByFun(index, item) {
    return index;
  }

  identify(index, item) {
    return item.mid;
  }
  
  trackByFunction(index, item) {
    return index;
  }
  marketCategoryEvents() {
    var scrollTop = 0, self = this, isMultiMarket = false;
    $(window).scroll(function(){
      scrollTop = $(window).scrollTop();
      const selectedMatches = localStorage.getItem('selected_matches');
      if (selectedMatches != null && selectedMatches != undefined && JSON.parse(selectedMatches).length > 1) {
        isMultiMarket = true;
      } else {
        isMultiMarket = false;
      }
      const offsetHeight = document.getElementById('categories') ? document.getElementById('categories').offsetTop : null;
      const widgetScoreoffsetHeight = document.getElementById('widgetIframe1') ? document.getElementById('widgetIframe1').offsetTop : null;
      if(document.getElementById('categories')){
       if ($(window).width() < 767) { 
         if (scrollTop >= offsetHeight && !isMultiMarket) {
           if (!self.commonService.isNewsExits) {
            $('#categories').addClass('pos-fix');
            $('#categories').addClass('pos-fix-nonews');
            $('#category-tab').addClass('tab-category');
           } 
        }
         else if ((scrollTop < offsetHeight || scrollTop < widgetScoreoffsetHeight) && !isMultiMarket) {
          if (!self.commonService.isNewsExits) {
            $('#categories').removeClass('pos-fix');
            $('#categories').removeClass('pos-fix-nonews');
            $('#category-tab').removeClass('tab-category');
           } 
         }
       } else {
        if (scrollTop >= offsetHeight && !isMultiMarket) {
          $('#categories').addClass('pos-fix');
          $('#category-tab').addClass('tab-category');
         }
         else if (scrollTop < offsetHeight && !isMultiMarket) {
          $('#categories').removeClass('pos-fix');
          $('#category-tab').removeClass('tab-category');
         } 
       }
      }
      });
      const scroll:any = document.querySelector(".select-category");
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
  initMArketCategoryTabs() {
    let tabinstances: any;
    if (tabinstances) {
      tabinstances.destroy();
    }
    var elemsTabs = document.querySelectorAll('.tabs');
    tabinstances = M.Tabs.init(elemsTabs, {});
  }
  removeMarketFromSignalr() {
    if (this.allMarket && this.allMarket.length > 0) {
      this.allMarket.forEach(x => {
        this.sessionService.removeMarket(x.eid, x.mid);
      });
    }
  }
  openModal() {
    // if(this.isShowBetSlipBelowRunner){
    //   if (this.togglePanelView && this.bet) {
    //     this.modalInstances.open();
    //   } else {
    //     this.modalInstances.close();
    //   }
    // } else { 
      if ($(window).width() < 767) {
        if (this.togglePanelView && this.bet) {
          this.modalInstances.open();
        } else {
          this.modalInstances?.close();
        }
      } else {
    if (this.togglePanelView && this.bet) {
        this.isOpenBottomBetSlip = true;
        this.isDetailBetSlip = true;
      } else {
        this.isDetailBetSlip = false;
        this.isOpenBottomBetSlip = false;
      }
    }
    // }
  }
  toggleBetSlip() {
    this.isOpenBottomBetSlip = !this.isOpenBottomBetSlip;
    if (this.isDetailBetSlip && !this.isOpenBottomBetSlip) {
      this.cancelBet();
    }
  }
  onPinClick(matchId: number) {
    let multiSelectedMatch: any;
    multiSelectedMatch = JSON.parse(localStorage.getItem('multiselected_matchIds'));

    if (multiSelectedMatch === null) {
      multiSelectedMatch = [];
      multiSelectedMatch.push(matchId);
      document.getElementById('marketPin' + matchId).classList.add('active');
    } else {
      let obj: any;
      obj = multiSelectedMatch.find(x => x == matchId);
      if (obj) {
        multiSelectedMatch = multiSelectedMatch.filter(x => x !==  obj);
        document.getElementById('marketPin' + matchId).classList.remove('active');
      } else {
        if (multiSelectedMatch.length <= 4) {
          document.getElementById('marketPin' + matchId).classList.add('active');
          multiSelectedMatch.push(matchId);
        }
        // document.getElementById('marketPin' + matchId).classList.add('active');
        // multiSelectedMatch.push(matchId);
      }
    }
    this.commonService.setEventCounts('Favourite',multiSelectedMatch.length);
    localStorage.setItem('multiselected_matchIds', JSON.stringify(multiSelectedMatch));
  }
  resetBookValue() {
    const calculatedEstimatedProfitLoss: EstimatedProfitLoss[] = [];
    const estimatedProfitLoss = new EstimatedProfitLoss();
    estimatedProfitLoss.betId = this.bet.betId;
    estimatedProfitLoss.betDetailId = 0;
    estimatedProfitLoss.estimatedProfitLoss = 0;
    calculatedEstimatedProfitLoss.push(estimatedProfitLoss);
    this.betService.sendEstimatedProfitLoss().next(calculatedEstimatedProfitLoss);
  }
  ngOnDestroy() {
    this.removeMarketFromSignalr();
    this.selectedMatchId = null;
    this.notifier.next();
    this.notifier.complete(); 
    this.subscription.unsubscribe();
  }
}
