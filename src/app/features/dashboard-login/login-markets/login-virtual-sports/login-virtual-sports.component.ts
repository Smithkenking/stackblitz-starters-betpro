import { Component, OnInit, OnDestroy, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { FanceType, GameType, OpenPage } from '@clientApp-core/enums/market-fancy.type';
import { AuthFacadeService, GuestMLConfig } from '@clientApp-core/services/authentication/authentication-facade.service';
import { arrayUniqueByKey } from '@clientApp-core/services/shared/JSfunction.service';
import { GetSortOrder, fancyRankOrder } from '@clientApp-core/utilities/app-configuration';
import { BehaviorSubject, Observable, throwError,Subject,Subscription } from 'rxjs';
import { catchError } from 'rxjs/operators';
declare var $: any;
import * as M from "materialize-css/dist/js/materialize";
import { CommonService } from '@clientApp-core/services/common/common.service';
import { MarketFacadeService } from '@clientApp-core/services/market/market-facade.service';
import { takeUntil } from 'rxjs/operators';
import { untilDestroyed } from 'ngx-take-until-destroy';
import { Stake } from '@clientApp-core/models/bet/stake.model';
import { BetFacadeService } from '@clientApp-core/services/bet/bet.facade.service';
import { Store, select } from '@ngrx/store';
import { ParkBetState } from '@clientApp-store/store.state';
import * as selectedMarket from '@clientApp-store/selected-market/selectors/selected-market.selectors';
import { DeviceInfoService } from '@clientApp-core/services/device-info/deviceinfo.services';
import { apiEndPointData } from '@clientApp-core/services/config/connfig.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ActiveMarket } from '@clientApp-core/models/market/activemarket.model';
import { MarketRateFacadeService } from '@clientApp-core/services/market/market-rates/market-rate-facade.service';

@Component({
  selector: 'app-login-virtual-sports',
  templateUrl: './login-virtual-sports.component.html',
  styleUrls: ['./login-virtual-sports.component.scss']
})
export class LoginVirtualSportsComponent implements OnInit, AfterViewInit, OnDestroy {
  allMatches: any = [];
  ballByBall = [];
  eventIds: string;
  matchInfo: any = [];
  allMarket: any = [];
  selectedIndex: number = 0;
  previousMarket: any;
  iframeUrl: any;
  isMatchStarted:boolean = false;
  sportTournamentList: any[]=[];
  sportTournamentId: any;
  market$ = new BehaviorSubject<any>(null);
  notifier = new Subject();
  togglePanelView: boolean;
  modalInstances: any;
  isOpenBottomBetSlip: boolean = false;
  isDetailBetSlip: boolean = false;
  tournamentId: any;
  tournamentNm: any;
  bet: Stake;
  lastSelectedItem: string;
  showBallByBallContainer: boolean = false;
  openpage: number;
  private subscription: Subscription;
  @ViewChild('betpanelModal', { static: true }) template: ElementRef;
  constructor(private store: Store<ParkBetState>,private authService: AuthFacadeService, public commonService: CommonService,
    private marketFacadeService: MarketFacadeService,  public router: Router, private betService: BetFacadeService,public deviceInfoService: DeviceInfoService,private route: ActivatedRoute,private marketRateFacadeService:MarketRateFacadeService) {
      this.subscription = this.route.params.subscribe((params) => {
        if (params && !this.isEmpty(params) && params.id == 'virtual-sports') {
          if (params && params.eventname) {
            this.tournamentId = +params.eventname;
            this.getTournament(); 
          }
          this.reloadMarketRates();
        }
        
      });
     }

     ngOnInit(): void {
      const allMatches = GuestMLConfig.data.allActiveMarketList ? GuestMLConfig.data.allActiveMarketList : [];
      this.getTournament();
      this.allMatches = allMatches.sort((a, b) => {
        return fancyRankOrder.get(b.mt) - fancyRankOrder.get(a.mt);
      }).sort(GetSortOrder('ed'));
      this.getGuestMLConfig();
      this.reloadMarketRates();
      this.removeMarketFromList();
      this.unPinMarkets();
    //   this.store.pipe(takeUntil(this.notifier),untilDestroyed(this),
    //   select(selectedMarket.getAllMarkets)
    // ).subscribe(markets => {
    //   if (markets && markets.length > 0) {
    //     const allMatches = markets.map(obj =>{
    //       if(Array.isArray(obj)){
    //         return Object.assign({}, obj)
    //       }
    //       return obj;
    //     });
    //     // this.allMatches = allMatches.sort((a, b) => {
    //     //   return fancyRankOrder.get(b.mt) - fancyRankOrder.get(a.mt);
    //     // });
    //     // if(this.router.url.indexOf('/event/virtual-sports') == 0){
    //     //   const virtualData = allMatches.filter(x => x.gt === GameType.Virtual && x.tid == this.sportTournamentId);
    //     //    this.allMatches = virtualData.sort((a, b) => {
    //     //   return fancyRankOrder.get(b.mt) - fancyRankOrder.get(a.mt);
    //     // });
    //     // } else {
    //     //    this.allMatches = allMatches.sort((a, b) => {
    //     //   return fancyRankOrder.get(b.mt) - fancyRankOrder.get(a.mt);
    //     // });
    //     // }
    //     const data = arrayUniqueByKey(this.allMatches, 'eid');
  
    //      let  newData  = data.map(obj => {
    //       if (obj.eid === this.previousMarket?.eid) {
    //         return  Object.assign({ isLive: true, isShowTimer : false, isUnlockbet: new Date(obj.ed) > new Date() }, obj);
    //       } else {
    //         return Object.assign({ isLive: false, isShowTimer : false, isUnlockbet: new Date(obj.ed) > new Date() }, obj);
    //       }
    //     });
    //     const index = newData.findIndex(x => x.isLive);
    //     if (index !== undefined && index !== null && index >= 0) {
    //       newData[index].isLive = true;
    //       if(newData.length > 1){
    //         newData[index+1].isShowTimer = true;
    //       }
    //       // setTimeout(() => {
    //       //   this.InitScroll();
    //       // }, 500);
    //     } else {
    //     }
    //     this.markets = newData;
    //     // if(this.router.url === '/event/virtual-sports'){
    //     //   this.markets = newData.filter(x => x.gt === GameType.Virtual && x.tid == this.sportTournamentId);
    //     // } else {
    //     //   this.markets = newData;
    //     // }
  
    //   } else {
    //     this.allMatches = [];
    //     this.markets = [];
    //   }
    // });
      // this.marketRateFacadeService.marketDateChange$().subscribe(data => {
      //   console.log('marketDateChange', data);
      // });
      this.marketRateFacadeService.getAddNewDashboardMarketInfo$().pipe(takeUntil(this.notifier), untilDestroyed(this)).subscribe(data => {
        this.allMatches =  this.allMatches.concat(data);
    });
    if(!apiEndPointData.data.isShowBetSlipBelowRunner){
      this.betService.getStake$().pipe(takeUntil(this.notifier),untilDestroyed(this)).subscribe(bet => {
        if (this.bet && this.bet.betDetailId === bet.betDetailId &&
          this.lastSelectedItem === bet.currentSelectedItem) {
          this.togglePanelView = !this.togglePanelView;
          this.bet = bet;
          this.betService.sendEstimatedProfitLoss().next([]);
          // this.resetBookValue();
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
          // this.resetBookValue();
        }
        this.openModal();
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
    
    cancelBet() {
      this.betService.setStake().next(this.bet);
      this.betService.setSelectedRunner().next();
    }
    openLoginModel(){
      this.cancelBet();
    this.commonService.setLoginPopupOpen(true);
    }
  ngAfterViewInit() {
    this.customscroll(".virtual-league");
    const options = {
      dismissible: false,
      onCloseEnd() {
        $('body').css('overflow', '')
      }
    }
    this.modalInstances = M.Modal.init(this.template?.nativeElement, options);
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
  getGuestMLConfig() {
    this.authService.getMarketConfig$().pipe(catchError(err => throwError(err))).subscribe((response: any) => {
      if (response) {
        this.allMatches = response.allActiveMarketList.sort((a, b) => {
          return fancyRankOrder.get(b.mt) - fancyRankOrder.get(a.mt);
        }).sort(GetSortOrder('ed'));
        this.getTournament(); 
        this.reloadMarketRates();
      }
    }, err => console.log('getGuestMLConfig', err));
  }
  private reloadMarketRates() {
    if (this.allMatches && this.allMatches.length > 0) {
   // let matches = this.allMatches.filter(market => market.mt === FanceType.Virtual);
   let matches = this.allMatches.filter(market => market.gt === GameType.Virtual && market.tid == this.sportTournamentId);
      if (matches && matches.length > 0) {
        const UniqueMarket = arrayUniqueByKey(matches, 'eid');
        // console.log(UniqueMarket.length)
        this.eventIds = UniqueMarket.map(z => z.eid).toString();
        this.getMatchWiseMarketData(this.eventIds);
      } else {
        this.previousMarket = null;
        // this.onTimesUp()
        this.matchInfo = [];
        this.allMarket = [];
      }
    }
  }
  onTournamentClick(tournament){
    this.selectedIndex = 0;
    this.matchInfo = [];
    this.tournamentNm = tournament.tn;
    this.sportTournamentId =  tournament.tid;
    this.previousMarket = null;
    this.openpage = tournament.op;
    // this.onTimesUp()
    this.showBallByBallContainer = tournament.tn === 'Ball By Ball';
    this.market$.next(null);
    this.router.navigate(['event', 'virtual-sports', tournament.tid]);
  }
  getTournament(){
    let sportTournamentList = GuestMLConfig.data.sportTournamentList ? GuestMLConfig.data.sportTournamentList : [];
    const allMatches = GuestMLConfig.data.allActiveMarketList ? GuestMLConfig.data.allActiveMarketList : [];
    this.allMatches = allMatches.sort((a, b) => {
      return fancyRankOrder.get(b.mt) - fancyRankOrder.get(a.mt);
    }).sort(GetSortOrder('ed'));
    sportTournamentList = sportTournamentList.filter(x=>x.isv);
    const self =this;
    var result = sportTournamentList.filter(function (o1) {
    return !self.allMatches.some(function (o2) {
      return o1.tid === o2.tid
    });
    });
    this.sportTournamentList = sportTournamentList.filter(function(objFromA) {
      return !result.find(function(objFromB) {
        return objFromA.tid === objFromB.tid
      })
    });
    // this.sportTournamentList = sportTournamentList;
    this.sportTournamentId = this.sportTournamentList && this.sportTournamentList.length > 0 ?
     (this.tournamentId ?  this.tournamentId :this.sportTournamentList[0].tid) : null;
     this.tournamentNm = this.sportTournamentList && this.sportTournamentList.length > 0 ?
     (this.tournamentId ?  (this.sportTournamentList.find(x=>x.tid ==this.tournamentId)?.tn) :this.sportTournamentList[0].tn) : null;
     this.openpage = this.sportTournamentList && this.sportTournamentList.length > 0 ?
    (this.sportTournamentId ?  (this.sportTournamentList.find(x=>x.tid ==this.sportTournamentId)?.op) :this.sportTournamentList[0].op) : OpenPage.Superover;
     this.showBallByBallContainer = this.tournamentNm === 'Ball By Ball';
  }
  getMarket(): Observable<any> {
    return this.market$.asObservable();
  }
  getMatchWiseMarketData(ids) {
    this.commonService.setLoadingStatus(true);
    this.authService.getDashboardMultiMarket(ids).pipe(catchError(err => throwError(err))).subscribe((result: any) => {
      this.commonService.setLoadingStatus(false);
      this.allMarket = result.marketInfo;
      this.commonService.curMarketsVol = Object.assign([], result.marketInfo);
      this.commonService.curMarketsRunners = Object.assign([], result.runnerInfo);
      let  newData  = result.matchInfo.map(obj => {
        if (obj.eid === this.previousMarket?.eid) {
          return  Object.assign({ isLive: true, isShowTimer : false, isUnlockbet: new Date(obj.ed) > new Date() }, obj);
        } else {
          return Object.assign({ isLive: false, isShowTimer : false, isUnlockbet: new Date(obj.ed) > new Date() }, obj);
        }
      });
      const index = newData.findIndex(x => x.isLive);
      if (index !== undefined && index !== null && index >= 0) {
        // if(this.selectedIndex != index + 1){
        // this.selectedIndex = index + 1;
        newData[index].isLive = true;
        newData[index+1].isShowTimer = true;
        this.isMatchStarted = newData[index].isLive;
        // }
      } else {
        // this.selectedIndex = 0;
      }
      this.matchInfo = Object.assign([], newData);
      this.market$.next(result);
      this.init();
      if(this.matchInfo && this.matchInfo.length > 0 && this.matchInfo[0].ev){
        if (this.deviceInfoService.isMobile()) {
          this.iframeUrl = '<iframe class="w-100" style="width:100%;height:auto;border:none;min-height:220px" src="' + this.matchInfo[0].ev
        + '" frameborder="0" allow="autoplay; encrypted-media"  scrolling="no" width="100%" height="auto" marginwidth="0" marginheight="0" allowfullscreen="true" webkitallowfullscreen="true" mozallowfullscreen="true"></iframe>';
        } else {
          this.iframeUrl = '<iframe class="w-100" src="' + this.matchInfo[0].ev
        + '" frameborder="0" allow="autoplay; encrypted-media"  scrolling="no" width="100%" height="400" marginwidth="0" marginheight="0" allowfullscreen="true" webkitallowfullscreen="true" mozallowfullscreen="true"></iframe>';
        }
      }
    }, err =>{ this.commonService.setLoadingStatus(false);console.log('getGuestMLConfig', err)});
  }
  removeMarketFromList() {
    this.marketFacadeService.getMarketToRemove$().pipe(takeUntil(this.notifier),untilDestroyed(this)).subscribe(id => {
      const matches = Object.assign([], this.allMarket.find(o2 => id === o2.mid));
      if (matches) {
       const obj = this.allMarket.find(x => x.eid == matches.eid);
       if(obj){
        this.matchInfo = this.matchInfo.filter(o2 => obj.eid !== o2.eid);
       }
       
        // const allMarket = Object.assign([], this.allMarket);
        // this.allMarket = allMarket.filter(o2 => id !== o2.mid);
        // // this.store.dispatch(SelectedMarket.RemoveSelectedMarket({ betId: id }));
        // const stake = new Stake();
        // stake.closeMe = true;
        // stake.betId = id;
        // this.betService.setStake().next(stake);
      }
    });
    this.marketFacadeService.getManyMarketToRemove$().pipe(takeUntil(this.notifier), untilDestroyed(this)).subscribe(id => {
      this.matchInfo = this.matchInfo.filter(x=> x.eid != id);
      // const bettids: string[]  = selectedMarket.map(x=>x.mid.toString());
      // if(bettids.length > 0){
      //   this.store.dispatch(SelectedMarket.RemoveSelectedMarketByMatchId({  betIds: bettids  }));
      // }
      
    });
  }
  unPinMarkets() {
    this.marketFacadeService.getMarketToUnpin$().subscribe(matchId => {
      const index = this.matchInfo.findIndex(x => x.eid == matchId);
      if (index !== undefined && index !== null && index >= 0) {
        // if(this.selectedIndex != index + 1){
          this.matchInfo  = this.matchInfo.map(obj => {
            if (obj.eid === matchId) {
              return  Object.assign({ isLive: true, isShowTimer : false, isUnlockbet: new Date(obj.ed) > new Date() }, obj);
            } else {
              return Object.assign({ isLive: false, isShowTimer : false, isUnlockbet: new Date(obj.ed) > new Date() }, obj);
            }
          
          });
          this.matchInfo[index].isLive = true;
          this.matchInfo[index+1].isShowTimer = true;
          if(this.openpage != OpenPage.Decimal){
            this.previousMarket = this.matchInfo[index];
            this.selectedIndex = index + 1;
          } else {
            this.previousMarket = null;
          }
          this.isMatchStarted = this.matchInfo[index+1].isLive;
          this.init();
      //  }
      }
      // const selectedMarket = this.allMatches.filter(x=>x.eid == matchId);
      // const bettids: string[]  = selectedMarket.map(x=>x.mid.toString());
      // this.store.dispatch(SelectedMarket.RemoveSelectedMarketByMatchId({  betIds: bettids  }));
      // const markets = Object.assign([], this.allMatches.filter(x => x.eid == matchId));
      // if (markets && markets.length > 0) {
      //   this.previousMarket = markets[0];
        // markets.forEach(x => {
        //   this.store.dispatch(SelectedMarket.RemoveSelectedMarket({ betId: x.mid }));
        // });
        // const stake = new Stake();
        // stake.closeMe = true;
      // }
    });
  }
  eventClick(market,index){
    this.selectedIndex = index;
    this.isMatchStarted = this.matchInfo[index].isLive;
    if(this.openpage == OpenPage.Decimal){
      this.previousMarket = null;
      const matchInfo = this.allMarket.filter(x=>x.eid == market.eid);
      if(matchInfo && matchInfo.length > 0 && matchInfo[0].ev){
        if (this.deviceInfoService.isMobile()) {
          this.iframeUrl = '<iframe class="w-100" style="width:100%;height:auto;border:none;min-height:220px" src="' + matchInfo[0].ev
        + '" frameborder="0" allow="autoplay; encrypted-media"  scrolling="no" width="100%" height="auto" marginwidth="0" marginheight="0" allowfullscreen="true" webkitallowfullscreen="true" mozallowfullscreen="true"></iframe>';
        } else {
          this.iframeUrl = '<iframe class="w-100" src="' + matchInfo[0].ev
        + '" frameborder="0" allow="autoplay; encrypted-media"  scrolling="no" width="100%" height="400" marginwidth="0" marginheight="0" allowfullscreen="true" webkitallowfullscreen="true" mozallowfullscreen="true"></iframe>';
        }
      }
    }

  }
  
  private init() {
    var elemsTabs = document.querySelectorAll('.tabs');
    var tabinstances = M.Tabs.init(elemsTabs, {});
    const scroll: any = document.querySelector(".select-events");
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
  }
  
  trackByFn(index, item) {
    return item.eid; // or index 
  }
  isEmpty(obj) {
    for (var key in obj) {
      if (obj.hasOwnProperty(key))
        return false;
    }
    return true;
  }
  ngOnDestroy() {
    this.notifier.next();
    this.notifier.complete();
    this.subscription.unsubscribe();
  }
}
