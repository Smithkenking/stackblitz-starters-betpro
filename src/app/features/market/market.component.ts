import { Component, OnInit, OnDestroy, AfterViewInit, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { ParkBetState } from '@clientApp-store/store.state';
import { MarketFacadeService } from '@clientApp-core/services/market/market-facade.service';
import { untilDestroyed } from 'ngx-take-until-destroy';
import * as selectedMarket from '@clientApp-store/selected-market/selectors/selected-market.selectors';
import { take, catchError, takeUntil } from 'rxjs/operators';
import { throwError, Subject, Observable, BehaviorSubject,Subscription } from 'rxjs';
import { MarketRateFacadeService } from '@clientApp-core/services/market/market-rates/market-rate-facade.service';
import { StoreService } from '@clientApp-core/services/store/store.service';
import { SessionService } from '@clientApp-core/services/session/session.service';
import { BetFacadeService } from '@clientApp-core/services/bet/bet.facade.service';
import * as SelectedMarket from '@clientApp-store/selected-market/actions/selected-market.actions';
import { Stake } from '@clientApp-core/models/bet/stake.model';
import { DeviceInfoService } from '@clientApp-core/services/device-info/deviceinfo.services';
declare var $: any;
import * as M from "materialize-css/dist/js/materialize";
import { Match } from '@clientApp-core/models/market/match.model';
import { CommonService } from '@clientApp-core/services/common/common.service';
import { fancyRankOrder, GetSortOrder } from '@clientApp-core/utilities/app-configuration';
import { AuthFacadeService, websiteSettings } from '@clientApp-core/services/authentication/authentication-facade.service';
import { apiEndPointData } from '@clientApp-core/services/config/connfig.service';
import { arrayUniqueByKey, unionByBetDetailID, unionByBetId, unionByMatchId } from '@clientApp-core/services/shared/JSfunction.service';
import { ActiveMarket } from '@clientApp-core/models/market/activemarket.model';
import { ActivatedRoute, Router } from '@angular/router';
import { ChipFacadeService } from '@clientApp-core/services/chip/chip-facade.service';
import { FanceType, GameType, OpenPage } from '@clientApp-core/enums/market-fancy.type';
import { OneClickComponent } from '@clientApp-shared/components/one-click/one-click.component';
@Component({
  selector: 'app-market',
  templateUrl: './market.component.html',
  styleUrls: ['./market.component.scss']
})
export class MarketComponent implements OnInit, AfterViewInit, OnDestroy {
  eventId: any;
  ballByBall = [];
  markets: any[] = [];
  allMatches: ActiveMarket[] = [];
  allMarkets: ActiveMarket[] = [];
  markets$: Observable<any>[];
  sportTournamentList: any[]=[];
  sportTournamentId: any;
  matchBetCount = 0;
  unMatchBetCount = 0;
  channelno: any;
  host = websiteSettings.data.appVideoLink;
  StreamNamePreFix = websiteSettings.data.appStreamPreFix;
  matchInfo: Match;
  yt: any;
  showTV = false;
  tournamentNm: any;
  openpage: number;
  isShowBetSlipBelowRunner: boolean;
  ipAddress: string = '';
  matchedUnmatchedModalInstance: any;
  notifier = new Subject();
  videoUrl = 'assets/flashphoner/player.html';
  matchId: any;
  isChatEnable = apiEndPointData.data.isChatEnable;
  isNewsExits: boolean;
  virtualVideoUrl: any;
  previousMarket: any;
  team1: string = '';
  team2: string = '';
  selectedVSCat:number=0;
  eventIds: string = "";
  loading = false;
  selectedIndex: number = 0;
  market$ = new BehaviorSubject<any>(null);
  isMatchStarted:boolean = false;
  private subscription: Subscription;
  tournamentId: any;
  @ViewChild('oneclick', { static: true }) oneclickRef: OneClickComponent;
  @ViewChild('matchedunmatched', { static: true }) matchedUnmatchedModal: ElementRef;
  showBallByBallContainer: boolean;
  constructor(private store: Store<ParkBetState>,
    private marketFacadeService: MarketFacadeService,
    private storeService: StoreService,
    private marketRateFacadeService: MarketRateFacadeService,
    private betService: BetFacadeService,
    public commonService: CommonService,
    private sessionService: SessionService, private ref: ChangeDetectorRef,
    public deviceInfoService: DeviceInfoService,private chipService: ChipFacadeService,
    private authService: AuthFacadeService, private route: ActivatedRoute,  public router: Router) {
    this.allMarkets = this.marketFacadeService.marketList;
    this.subscription = this.route.params.subscribe((params) => {
      if (params && !this.isEmpty(params) && params.id !== 'virtual-sports') {
        this.eventId = +params.id;
        let selectedMatch = [], selectedMarketId = [];
        const selectedMatches = localStorage.getItem('selected_matches');
        if (params && params.mid) {
          localStorage.removeItem('selected_betId');
          const marketId = +params.mid;
          selectedMarketId.push(marketId);
          localStorage.setItem('selected_betId', JSON.stringify(selectedMarketId));
        }
        if (selectedMatches != null) {
          if (!JSON.parse(selectedMatches).includes(this.eventId)) {
            selectedMatch.push(this.eventId);
            localStorage.setItem('selected_matches', JSON.stringify(selectedMatch));
          }
        } else {
          selectedMatch.push(this.eventId);
          localStorage.setItem('selected_matches', JSON.stringify(selectedMatch));
        }

        if (this.eventId) { this.reloadMarketRates(); }
      } else if (this.router.url == "/favorite-sports") {
        this.reloadMarketRates();
      } else {
        if (params && params.eventname) {
          this.tournamentId = +params.eventname;
          this.getTournament(); 
        }
        localStorage.removeItem('selected_matches');
        this.reloadMarketRates();
      }
    });
    this.marketRateFacadeService.getMatchBetCount$().pipe(takeUntil(this.notifier), untilDestroyed(this)).subscribe(matchcount => {
      this.matchBetCount = matchcount;
    });
    this.marketRateFacadeService.getUnMatchBetCount$().pipe(takeUntil(this.notifier), untilDestroyed(this)).subscribe(unmatchcount => {
      this.unMatchBetCount = unmatchcount;
    });
    this.unPinMarkets();
    this.marketRateFacadeService.eventDateChangeStatus$().subscribe(data => {
      // console.log('eventDateChange', data);
        if (this.allMatches && this.allMatches.length > 0) {
          this.allMatches = this.allMatches.map(obj =>
            obj.eid === data.eid ? { ...obj, ed: data.ed } : obj
        );
      }
    });
    this.marketRateFacadeService.getAddNewDashboardMarketInfo$().subscribe(data => {
      this.allMarkets =  this.allMarkets.concat(data);
      this.marketFacadeService.marketList = Object.assign([],this.allMarkets);
    });
    // this.marketRateFacadeService.marketDateChange$().subscribe(data => {
    //   console.log('marketDateChange', data);
    //   const index = this.allMatches.findIndex(x=> x.mid == data.mid);
    //   if (index !== undefined && index !== null && index >= 0) {
    //     this.allMatches[index].ed = data.ed;
    //   }
    // });
  }

  ngOnInit() {
    this.getTournament(); 
    this.getConfig();
    this.getMarkets();
    this.store.pipe(takeUntil(this.notifier),untilDestroyed(this),
      select(selectedMarket.getAllMarkets)
    ).subscribe(markets => {
      if (markets && markets.length > 0) {
        const allMatches = markets.map(obj =>{
          if(Array.isArray(obj)){
            return Object.assign({}, obj)
          }
          return obj;
        });
        if(this.router.url.indexOf('/event/virtual-sports') == 0){
          const virtualData = allMatches.filter(x => x.gt === GameType.Virtual && x.tid == this.sportTournamentId); 
           this.allMatches = virtualData.sort((a, b) => {
          return fancyRankOrder.get(b.mt) - fancyRankOrder.get(a.mt);
        });  
        } else {
           this.allMatches = allMatches.sort((a, b) => {
          return fancyRankOrder.get(b.mt) - fancyRankOrder.get(a.mt);
        }); 
        }
      
        const data = arrayUniqueByKey(this.allMatches, 'eid');
        
         let  newData  = data.map(obj => {
          if (obj.eid === this.previousMarket?.eid) {
            return  Object.assign({ isLive: true, isShowTimer : false, isUnlockbet: new Date(obj.ed) > new Date() }, obj);
          } else {
            return Object.assign({ isLive: false, isShowTimer : false, isUnlockbet: new Date(obj.ed) > new Date() }, obj);
          }
        });
        const index = newData.findIndex(x => x.isLive);
        if (index !== undefined && index !== null && index >= 0) {
          newData[index].isLive = true;
          if(newData.length > 1){
            newData[index+1].isShowTimer = true;
          }
        } else {
        }
        this.markets = newData;   
        const ballByBall = this.markets.filter(x=>x.isLive);
        this.ballByBall = ballByBall.length > 0 ? ballByBall : newData[0];
        // console.log(this.markets) 
        // console.log(this.allMatches) 
      } else {
        this.allMatches = [];
        this.markets = [];
      }
    });
    this.allMarkets = this.marketFacadeService.marketList;
    this.removeMarketFromList();
    this.isShowBetSlipBelowRunner = websiteSettings.data.isShowBetSlipBelowRunner;
    this.host = websiteSettings.data.appVideoLink;
    this.StreamNamePreFix = websiteSettings.data.appStreamPreFix;
    // this.setLiveTvMode(this.deviceInfoService.isMobile());
    this.marketFacadeService.getVideo$().subscribe(matchid => {
      if (this.matchId !== matchid) {
        this.showTV = false;
      }
      this.matchId = matchid;
      this.matchInfo = Object.assign([], this.marketRateFacadeService.curMatchInfo.find(x => x.eid == matchid));
      if (this.matchInfo && this.matchInfo.ei && this.matchInfo.ep === true && this.matchInfo.ev !== '') {
        this.showTV = !this.showTV;
        if (this.videoUrl !== this.matchInfo.ev) {
          this.videoUrl = this.matchInfo.ev;
        }
        var field = 'twitch.tv';
        var url = this.matchInfo.ev;
        if (url.indexOf(field) > -1) {
          if (url.indexOf('parent=#domain#') > -1) {
            const splitArr = url.split('parent=#domain#');
            const origin = window.location.origin.replace(/^https?\:\/\//i, "");
            this.videoUrl = splitArr[0] + 'parent=' + origin;
          }
        }

      }
      else if (this.matchInfo && this.matchInfo.ei && this.matchInfo.ec != null) {
        this.showTV = !this.showTV;
        this.channelno = this.matchInfo.ec;
        const channelnoList = apiEndPointData.data.channelnoList ? apiEndPointData.data.channelnoList : [];
        const isNumberExitst = channelnoList.includes(+this.channelno);
        if (isNumberExitst == null || isNumberExitst == undefined || !isNumberExitst) {
          if (this.commonService.ipAddress && this.commonService.ipAddress.length > 0) {
            this.videoUrl = websiteSettings.data.externalVideoUrl + this.matchInfo.ec + "&ip=" + this.commonService.ipAddress;
          } else {
            this.getIp();
          }
        } else {
          this.videoUrl = 'assets/flashphoner/player.html';
        }
      } else {
        this.showTV = false;
      }
      this.yt = '<iframe class="w-100" src="' + this.videoUrl
        + '" frameborder="0" allow="autoplay; encrypted-media"  scrolling="no" width="100%" height="220" allowfullscreen="true" webkitallowfullscreen="true" mozallowfullscreen="true"></iframe>';
    });
    this.isNewsExits = this.commonService.isNewsExits;
    this.getNews();
    this.reloadMarketRates();
  }
  ngAfterViewInit() {
    this.matchedUnmatchedModalInstance = M.Modal.init(this.matchedUnmatchedModal.nativeElement, {});
    var elcollapsible = document.querySelectorAll('.collapsible');
    var icollapsible = M.Collapsible.init(elcollapsible, {});
    this.init();
    if (this.router.url.indexOf('/event/virtual-sports') == 0){
    this.getAllChips()
  }
  // setTimeout(() => {
  //   var element = document.querySelector(".select-events a.active");
  //   element?.scrollIntoView({behavior: "smooth" ,inline: "center"});
  // }, 1000);
  }
  private init() {
    var elemsTabs = document.querySelectorAll('.tabs');
    var tabinstances = M.Tabs.init(elemsTabs, {});
    this.customscroll(".select-events");
    this.customscroll(".virtual-league");
   
    if(this.deviceInfoService.isMobile()){
    setTimeout(() => {
      var element = document.querySelector(".select-events a.active");
      element?.scrollIntoView({behavior: "smooth" ,inline: "center"});
    }, 500);
  }
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
  getIp() {
    const self = this, url = websiteSettings.data.ipAddApi ? websiteSettings.data.ipAddApi : apiEndPointData.data.ipAddApi;
    var ip = $.getJSON(url, function (data: any) {
      self.commonService.ipAddress = data.ip;
      self.videoUrl = websiteSettings.data.externalVideoUrl + self.matchInfo.ec + "&ip=" + data.ip;
      self.yt = '<iframe class="w-100" src="' + self.videoUrl
        + '" frameborder="0" allow="autoplay; encrypted-media"  scrolling="no" width="100%" height="205" marginheight="0" marginwidth="0" allowfullscreen="true" webkitallowfullscreen="true" mozallowfullscreen="true"></iframe>';
    }).fail(function (ex) {
      console.log('market comp getIp', ex.responseText);
    });
  }
  setLiveTvMode(value) {
    if (value) {
      this.commonService.isShowLiveTvCenter = true;
    } else { this.commonService.isShowLiveTvCenter = false; }
  }
  getConfig() {
    this.authService.getConfig$()
      .pipe(takeUntil(this.notifier),
        untilDestroyed(this),
        catchError(err => throwError(err))
      ).subscribe(response => {
        if (response) {
          this.commonService.configData = response;
          this.getTournament(); 
          this.isShowBetSlipBelowRunner = websiteSettings.data.isShowBetSlipBelowRunner;
          this.host = websiteSettings.data.appVideoLink;
          this.StreamNamePreFix = websiteSettings.data.appStreamPreFix;
          this.reloadMarketRates();
          // setTimeout(() => {
          //   this.init();
          // }, 1000);
        }
      }, err => console.log('getConfig', err));
  }
  onTournamentClick(tournament){
    this.allMatches = [];
    this.markets = [];
    this.marketRateFacadeService.curMatchInfo =[];
    this.marketRateFacadeService.curMarketsVol = [];
    this.marketRateFacadeService.curMarketsRunners =[];
    this.tournamentNm = tournament.tn;
    this.sportTournamentId =  tournament.tid;
    this.previousMarket = null;
    this.selectedIndex = 0;
    this.openpage = tournament.op;
    this.showBallByBallContainer = tournament.tn === 'Ball By Ball';
    // this.onTimesUp()
    this.market$.next(null);
    this.router.navigate(['event', 'virtual-sports', tournament.tid]);
  }
  getTournament(){
    let sportTournamentList = websiteSettings.data.sportTournamentList ? websiteSettings.data.sportTournamentList : []
    sportTournamentList = sportTournamentList.filter(x=>x.isv);
    const self =this;
    var result = sportTournamentList.filter(function (o1) {
     return !self.allMarkets.some(function (o2) {
       return o1.tid === o2.tid
     });
   });
    this.sportTournamentList = sportTournamentList.filter(function(objFromA) {
      return !result.find(function(objFromB) {
        return objFromA.tid === objFromB.tid
      })
    });
    this.sportTournamentId = this.sportTournamentList && this.sportTournamentList.length > 0 ?
     (this.tournamentId ?  this.tournamentId :this.sportTournamentList[0].tid) : null;
     this.tournamentNm = this.sportTournamentList && this.sportTournamentList.length > 0 ?
     (this.tournamentId ?  (this.sportTournamentList.find(x=>x.tid ==this.tournamentId).tn) :this.sportTournamentList[0].tn) : null;
     this.openpage = this.sportTournamentList && this.sportTournamentList.length > 0 ?
     (this.sportTournamentId ?  (this.sportTournamentList.find(x=>x.tid ==this.sportTournamentId)?.op) :this.sportTournamentList[0].op) : OpenPage.Superover;
     this.showBallByBallContainer = this.tournamentNm === 'Ball By Ball';
  }
  getMarkets() {
    this.marketFacadeService.getMarkets$()
      .pipe(takeUntil(this.notifier), untilDestroyed(this), take(1),
        catchError(err => throwError(err))
      ).subscribe(response => {
        if (response && response.length > 0) {
          this.allMarkets = response.sort((a, b) => {
            return fancyRankOrder.get(b.mt) - fancyRankOrder.get(a.mt);
          }).sort(GetSortOrder('ed'));
          this.getTournament(); 
          this.reloadMarketRates();
        }
      }, err => console.log('market page getMarkets', err));
  }
  private reloadMarketRates() {
    if (this.allMarkets && this.allMarkets.length > 0) {
      const selectedMatches = localStorage.getItem('selected_matches');
      const multiselected_matchIds = localStorage.getItem('multiselected_matchIds');
      const selectedbetId = JSON.parse(localStorage.getItem('selected_betId'));
      if (this.router.url == "/favorite-sports" && multiselected_matchIds != null && JSON.parse(multiselected_matchIds).length > 0) {
        const matchIds = JSON.parse(multiselected_matchIds);
              matchIds.push(this.eventId);
          let matches = this.allMarkets.filter(market => matchIds.includes(market.eid));
          if (matches && matches.length > 0) {
            this.storeService.removeAllStoreData();
            const centralizationIds = matches.map(match => match.mc).toString();

              this.sessionService.joinMultiCentralGroup(centralizationIds);
            matches.forEach(market => {
              this.sessionService.addMarketGroup('', 3, market.eid, market.mid, market.mc, 0, 0, 0);
              this.store.dispatch(SelectedMarket.UpsertSelectedMarket({ market: market }));
            });
          }
        } else if (this.router.url.indexOf('/event/virtual-sports') == 0  && this.sportTournamentList && this.sportTournamentList.length > 0) {
          let matches = this.allMarkets.filter(market => market.gt === GameType.Virtual && market.tid == this.sportTournamentId);
          if (matches && matches.length > 0) {
           let UniqueMarket =  arrayUniqueByKey(matches, 'eid');
            this.eventIds = UniqueMarket.map(z => z.eid).toString();
            if(this.eventIds && this.eventIds.length > 0){
            this.getMatchWiseMarketData(this.eventIds);
            this.storeService.removeAllStoreData();
            matches.forEach(market => {
              this.sessionService.addMarketGroup('', 3, market.eid, market.mid, market.mc, 0, 0, 0);
              this.store.dispatch(SelectedMarket.UpsertSelectedMarket({ market: market }));
            });
            // if (!websiteSettings.data.appIsRealBalanceUse) {
            //   this.marketRateFacadeService.getWagerBetInfo();
            // } else {
              this.marketRateFacadeService.getBetInfo();
            // }
          }
          } else {
            this.storeService.removeAllStoreData();
          }
        }else {
          if (selectedMatches != null) {
            let matches = this.allMarkets.filter(market => JSON.parse(selectedMatches).includes(market.eid));
            if (matches && matches.length > 0) {
              if (selectedbetId && selectedbetId !== undefined) {
                matches = matches.filter((game) => {
                  return (game.mid === selectedbetId[0]);
                });
              }
              this.storeService.removeAllStoreData();
              const centralizationIds = matches.map(match => match.mc).filter(function (el) {
                return el != null && el != undefined && el != '';
              }).toString();
                this.sessionService.joinMultiCentralGroup(centralizationIds);
              matches.forEach(market => {
                if(market.gt == 2){
                  this.commonService.isShowLiveTvCenter = true;
                }
                this.sessionService.addMarketGroup('', 3, market.eid, market.mid, market.mc, 0, 0, 0);
                this.store.dispatch(SelectedMarket.UpsertSelectedMarket({ market: market }));
              });
            }
          }
        }
      
      }
  }
  // getClientLimitData() {
  //   this.marketRateFacadeService.getClientLimitRequest();
  // }
  removeMarketFromList() {
    this.marketFacadeService.getMarketToRemove$().pipe(takeUntil(this.notifier), untilDestroyed(this)).subscribe(id => {
      const matches = this.allMatches.filter(o2 => id === o2.mid);
      if (matches && matches.length > 0) {
        // const eId = matches[0].eid.toString() + ',';
        // console.log("b",this.eventIds);
        // this.eventIds = this.eventIds.replace(eId, "");
        // console.log(this.eventIds);
        // this.previousMarket = this.allMarkets.filter(o2 => id === o2.mid);
        this.store.dispatch(SelectedMarket.RemoveSelectedMarket({ betId: id }));
        const stake = new Stake();
        stake.closeMe = true;
        stake.betId = id;
        this.betService.setStake().next(stake);
      }
    });
    this.marketFacadeService.getManyMarketToRemove$().pipe(takeUntil(this.notifier), untilDestroyed(this)).subscribe(id => {
      const selectedMarket = this.allMatches.filter(x=>x.eid == id);
      const bettids: string[]  = selectedMarket.map(x=>x.mid.toString());
      if(bettids.length > 0){
        this.store.dispatch(SelectedMarket.RemoveSelectedMarketByMatchId({  betIds: bettids  }));
      }
      
    });
  }
  unPinMarkets() {
    this.marketFacadeService.getMarketToUnpin$().pipe(takeUntil(this.notifier)).subscribe(matchId => {
      const index = this.markets.findIndex(x => x.eid == matchId);
      if (index !== undefined && index !== null && index >= 0) {
          this.markets  = this.markets.map(obj => {
            if (obj.eid === matchId) {
              return  Object.assign({ isLive: true, isShowTimer : false, isUnlockbet: new Date(obj.ed) > new Date() }, obj);
            } else {
              return Object.assign({ isLive: false, isShowTimer : false, isUnlockbet: new Date(obj.ed) > new Date() }, obj);
            }
          
          });
          this.markets[index].isLive = true;
          if(this.markets.length > 1){
            this.markets[index+1].isShowTimer = true;
          }
          if(this.openpage != OpenPage.Decimal){
            this.previousMarket = this.markets[index];
            this.selectedIndex = index + 1;
          } else {
            this.previousMarket = null;
          }
          this.ballByBall = this.markets.filter(x=>x.isLive);
          this.init();
      }
    });
  }
  trackByFn(index, item) {
    return item.eid; // or index 
  }
  openMatchedUnmatchedModal() {
    this.matchedUnmatchedModalInstance.open();
    var elemsTabs = document.querySelectorAll('.tabs');
    var tabinstances = M.Tabs.init(elemsTabs, {});
  }
  hideModal() {
    this.matchedUnmatchedModalInstance.close();
  }
  getAcceptAnyOdd() {
    this.betService.getAcceptAnyOddtRequest().pipe(takeUntil(this.notifier), untilDestroyed(this), catchError(err => throwError(err))).subscribe(data => {
      if (data) {
        this.commonService.isCheckAcceptAnyOdds = data.appIsAcceptAnyOdds;
      }

    }, err => console.log('getAcceptAnyOddtRequest', err));
  }
  removeMarketFromSignalr() {
    if (this.allMatches && this.allMatches.length > 0) {
      this.allMatches.forEach(x => {
        this.sessionService.removeMarket(x.eid, x.mid);
      });
    }
  }
  getNews() {
    this.authService.getNews$()
      .pipe(takeUntil(this.notifier),
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
  isEmpty(obj) {
    for (var key in obj) {
      if (obj.hasOwnProperty(key))
        return false;
    }
    return true;
  }
  getMarket(): Observable<any> {
    return this.market$.asObservable();
  }
  getMatchWiseMarketData(eventIds) {
    // this.eventIds = eventIds;
    this.loading = true;
    this.commonService.setLoadingStatus(true);
    this.marketRateFacadeService.GetEventWiseMarketInfoMultipleRequest(eventIds).pipe(takeUntil(this.notifier),untilDestroyed(this), catchError(err => throwError(err))).subscribe(data => {
      this.commonService.setLoadingStatus(false);
      if (data.matchInfo && data.marketInfo && data.runnerInfo) {
        this.marketRateFacadeService.curMatchInfo = Object.assign([], unionByMatchId(this.marketRateFacadeService.curMatchInfo, data.matchInfo));
        this.marketRateFacadeService.curMarketsVol = Object.assign([], unionByBetId(this.marketRateFacadeService.curMarketsVol, data.marketInfo));
        this.marketRateFacadeService.curMarketsRunners = Object.assign([], unionByBetDetailID(this.marketRateFacadeService.curMarketsRunners,
          data.runnerInfo));
          this.loading = false;
          this.videoUrl = this.marketRateFacadeService.curMatchInfo[0].ev;
          this.market$.next(data);
          this.marketRateFacadeService.multimarket$.next(data);
          this.init();
      }
    }, err => {this.commonService.setLoadingStatus(false);this.loading = false;console.log('GetEventWiseMarketInfoMultipleRequest', err)});
  }
  
  getAllChips() {
    this.chipService.getChips$().pipe(take(1)).subscribe(chipResponse => {
      this.commonService.chipList = chipResponse;
    });
  }
  eventClick(market:any,index){
    this.selectedIndex = index;
    this.isMatchStarted = this.markets[index].isLive;
    if(this.openpage == OpenPage.Decimal){
      this.previousMarket = null;
      const curMatchInfo = this.marketRateFacadeService.curMatchInfo;
      const matchInfo = curMatchInfo.filter(x=>x.eid == market.eid);
      if(matchInfo && matchInfo.length > 0 && matchInfo[0].ev){
        this.videoUrl = matchInfo[0].ev;
      }
    }
  }
  ngOnDestroy() {
    this.notifier.next();
    this.notifier.complete();
    this.subscription.unsubscribe();
  }
}
