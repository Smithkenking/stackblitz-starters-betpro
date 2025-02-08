import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, HostListener, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AudioType } from '@clientApp-core/enums/audio.types';
import { BetStatus } from '@clientApp-core/enums/market-bet-status.type';
import { FanceType } from '@clientApp-core/enums/market-fancy.type';
import { MarketStatus } from '@clientApp-core/enums/market-status.type';
import { Stake } from '@clientApp-core/models/bet/stake.model';
import { MarketRates } from '@clientApp-core/models/market/market-rates.model';
import { BetSerializer } from '@clientApp-core/serializers/market/market-bet-details.serializer';
import { websiteSettings } from '@clientApp-core/services/authentication/authentication-facade.service';
import { BetFacadeService } from '@clientApp-core/services/bet/bet.facade.service';
import { CommonService } from '@clientApp-core/services/common/common.service';
import { apiEndPointData } from '@clientApp-core/services/config/connfig.service';
import { DeviceInfoService } from '@clientApp-core/services/device-info/deviceinfo.services';
import { MarketFacadeService } from '@clientApp-core/services/market/market-facade.service';
import { MarketRateFacadeService } from '@clientApp-core/services/market/market-rates/market-rate-facade.service';
import { MarketType } from '@clientApp-core/services/market/types/market';
import { SessionService } from '@clientApp-core/services/session/session.service';
import { showMarketInformation } from '@clientApp-core/services/shared/shared.service';
import { untilDestroyed } from 'ngx-take-until-destroy';
import { ToastrService } from 'ngx-toastr';
import { BehaviorSubject, Subject, Subscription, Observable } from 'rxjs';
import { takeUntil, take } from 'rxjs/operators';
import * as M from "materialize-css/dist/js/materialize";

@Component({
  selector: 'app-virtual-type',
  templateUrl: './virtual-type.component.html',
  styleUrls: ['./virtual-type.component.scss']
})
export class VirtualTypeComponent implements OnInit,AfterViewInit, OnDestroy {
  @Input() matchId: number;
  @Input() betId: number;
  @Input() marketCount: number;
  @Input() marketIndex: number;
  @Input() marketRunner;
  @Input() currentMarketVolumn;
  @Input() matchIndex: number;
  @Input() categoryName: string;
  @Input() selectedCategory: string;
  @Input() tournamentNm: string;
  showBallByBall: boolean = false;
  displayOverlay = false;
  market$ = new BehaviorSubject<MarketType>(null);
  marketNews: any = [];
  news: any = '';
  showLimitPopup: boolean = false;
  notifier = new Subject();
  showNewCashOut = false;
  confirmModalRef1;
  varCashout: Subscription;
  isShowCashout = false;
  isAcceptAnyPL: boolean = apiEndPointData.data.isAcceptAnyPL;
  isShowCashoutIcon:any
  @ViewChild('newcashOutModal', { static: true }) template1: ElementRef;
  cashout1$ = new BehaviorSubject<any>(null);
  constructor(
    public betService: BetFacadeService,
    private toastr: ToastrService,
    public commonService: CommonService,private sessionService :SessionService,private marketFacadeService : MarketFacadeService,
    private marketRateFacadeService: MarketRateFacadeService,private cdr: ChangeDetectorRef
  ) { }
  @HostListener('document:click', ['$event']) onDocumentClick(event) {
    this.showLimitPopup=false;
  }
  ngOnInit(): void {
    this.isAcceptAnyPL= apiEndPointData.data.isAcceptAnyPL;
    this.subscribeStore();
  }
  ngAfterViewInit(): void {
    this.updateShowBallByBall();
    this.confirmModalRef1 =  M.Modal.init(this.template1.nativeElement, {});
  }
  updateShowBallByBall() {
    this.showBallByBall = this.tournamentNm === 'Ball By Ball';
    // this.cdr.detectChanges();  // Manually trigger change detection
  }
  subscribeStore() {
    // tslint:disable-next-line:max-line-length
    let currentmarketvolumn, marketRunner;
    currentmarketvolumn = this.currentMarketVolumn.find(c => c.mid == this.betId);
    marketRunner = this.marketRunner.filter(x => x.mid === this.betId);
    if (currentmarketvolumn  && marketRunner && marketRunner.length > 0) {
      if (currentmarketvolumn && marketRunner && marketRunner.length > 0) {
        this.sessionService.joinMultiCentralGroup(currentmarketvolumn.mc);
        if(+currentmarketvolumn.ms == MarketStatus.Closed){
          this.marketFacadeService.removeMaket(this.betId);
        }
      }
      const market = this.showMarketInformation(currentmarketvolumn, {}, this.betId);
      this.market$.next(market);
    } else {
      this.marketFacadeService.removeMaket(this.betId);
    }
      this.marketRateFacadeService.getRunningMarketDetail$().pipe(takeUntil(this.notifier)).subscribe((RunningMarket) => {
        if (currentmarketvolumn ) {
          const filteredRunningMarkets = RunningMarket?.mi === +currentmarketvolumn.mc ? RunningMarket : null;
          if (filteredRunningMarkets !== undefined && filteredRunningMarkets !== null) {
            const market = this.showMarketInformation(currentmarketvolumn, filteredRunningMarkets, this.betId);
            this.market$.next(market);
          }
        }
      });
    this.marketRateFacadeService.getMarketNewsChanges$().pipe(takeUntil(this.notifier)).subscribe((data: any) => {
      var result = this.marketNews.filter(function (o1) {
        return !data.some(function (o2) {
          return o1.mc == o2.mc;
        });
      });
      this.marketNews = Object.assign([], (data.concat(this.marketNews)));
      this.getMarketNews();
    });
    //  This trigger has used to change market market status
    this.marketRateFacadeService.getMarketStatusChanges$().pipe(takeUntil(this.notifier)).subscribe((data: any) => {
      const index =this.currentMarketVolumn.findIndex(x => x.mid == data.appBetID);
      if (index !== undefined && index !== null && index >= 0) {
        const marketStatusWise = websiteSettings.data.marketStatusWise ? websiteSettings.data.marketStatusWise : false;
        const market = this.market$.getValue();
        if (!marketStatusWise && market.iStatus === MarketStatus.Open) {
          market.overlayMessage = '';
          market.isOverlayMessageVisible = false;
          this.market$.next(market);
        }
      }
    });
    this.varCashout = this.marketRateFacadeService.getMarketCashout1().subscribe((data: any) => {
      if(data && data.ShowCashout && this.betId == data.markerid && data.libility != null ){
        this.addOrReplaceNewCS(data);
        // this.cashout1$.next(data);
      } else if(data && !data.ShowCashout && this.betId == data.markerid) {
         this.showNewCashOut = false;
        // this.cashout1$.next(null);
      }
      // this.cashout1$.next(data);
    });
  }
  showMarketInformation(currentMarketVolumn: MarketRates, RunningMarket: any, betId: number) {
    const market = new MarketType();
    market.mt = currentMarketVolumn.mt;
    market.isInPlay = currentMarketVolumn.mi;
    market.isBetAllowed = currentMarketVolumn.mip ? (currentMarketVolumn.mip.toString().toLowerCase() === 'true' ?  true : false) : false;
    market.name = currentMarketVolumn.mn;
    market.totalAmount = RunningMarket?.tm ? RunningMarket.tm : '';
    market.minStake = currentMarketVolumn.mms && currentMarketVolumn.mms !== -1 ? currentMarketVolumn.mms.toString() : 'No Limit';
    market.maxStake = currentMarketVolumn.mxs && currentMarketVolumn.mxs !== -1 ? currentMarketVolumn.mxs.toString() : 'No Limit';
    market.maxProfit = currentMarketVolumn.mmp && currentMarketVolumn.mmp !== -1 ? currentMarketVolumn.mmp.toString() : 'No Limit';
    market.time = this.getDateTimeString(new Date());
    const eStatus = +currentMarketVolumn.ms;
    const iStatus = RunningMarket?.ms ? +RunningMarket.ms : 0;
    market.iStatus = iStatus;
    const cashoutMarketCategoryId = websiteSettings.data.cashoutMarketCategoryId;
    if(websiteSettings.data.isShowCashout && websiteSettings.data.isShowCashoutClient && currentMarketVolumn.mt == FanceType.Market && !cashoutMarketCategoryId.split(",").includes(currentMarketVolumn.mscd.toString())){
      market.isShowCashout = true;
    } else if(websiteSettings.data.isShowCashout_ManualOdds && websiteSettings.data.isShowCashoutClient && currentMarketVolumn.mt == FanceType.ManualOdds && !cashoutMarketCategoryId.split(",").includes(currentMarketVolumn.mscd.toString())) {
      market.isShowCashout = true;
    } else if(websiteSettings.data.isShowCashout_SportBook && websiteSettings.data.isShowCashoutClient && currentMarketVolumn.mt == FanceType.Virtual && !cashoutMarketCategoryId.split(",").includes(currentMarketVolumn.mscd.toString())){
      market.isShowCashout = true;
    }
    let marketStatusWise: boolean = false;
      marketStatusWise = websiteSettings.data.marketStatusWise ? websiteSettings.data.marketStatusWise : false;
    market.overlayMessage = '';
    if ((marketStatusWise ? iStatus : eStatus) === MarketStatus.BallStart) {
      market.overlayMessage = 'Ball Start';
      market.isOverlayMessageVisible = true;
      this.closeBetSlip(betId);
    } else if (iStatus === MarketStatus.Open && eStatus === BetStatus.OverLimitSuspended) {
      if (currentMarketVolumn.mt === FanceType.Market) {
        market.overlayMessage = '';
      } else if (currentMarketVolumn.mt === FanceType.Session
        || currentMarketVolumn.mt === FanceType.AdvanceSession
        || currentMarketVolumn.mt === FanceType.Bookmakers
        || currentMarketVolumn.mt === FanceType.ManualOdds
        || currentMarketVolumn.mt === FanceType.Virtual) {
        market.overlayMessage = 'Ball Start';
      }
      market.isOverlayMessageVisible = true;
      this.closeBetSlip(betId);
    } else if (iStatus === MarketStatus.BallStart && eStatus !== MarketStatus.Closed) {
      market.overlayMessage = 'Ball Start';
      market.isOverlayMessageVisible = true;
      this.closeBetSlip(betId);
    } else if (iStatus === MarketStatus.Suspended && eStatus !== BetStatus.Closed) {
      market.overlayMessage = 'Market Suspended';
      market.isOverlayMessageVisible = true;
      this.closeBetSlip(betId);
      if(currentMarketVolumn.mt === FanceType.Virtual){
        this.marketFacadeService.removeVirtualMaket(currentMarketVolumn.eid);
        market.overlayMessage = 'Bet Closed';
      }
    } else if (iStatus === MarketStatus.Closed) {
      market.isInPlay = false;
      market.overlayMessage = 'Market close';
      this.closeBetSlip(betId);
      market.isOverlayMessageVisible = true;
      if(currentMarketVolumn.mt === FanceType.Virtual){
        this.marketFacadeService.removeManyMaket(currentMarketVolumn.eid);
      } else {
        this.marketFacadeService.removeMaket(betId);
      }
    } else if (iStatus === MarketStatus.InActive) {
      market.overlayMessage = 'Market Inactive';
      this.closeBetSlip(betId);
      market.isOverlayMessageVisible = true;
    } else if (iStatus === MarketStatus.Settled && eStatus !== BetStatus.Settled) {
      market.overlayMessage = 'Market Settled';
      market.isOverlayMessageVisible = true;
      market.isInPlay = false;
      this.closeBetSlip(betId);
      this.marketFacadeService.removeMaket(betId);
    } else if (iStatus === 0) {
      market.overlayMessage = '';
      market.isOverlayMessageVisible = true;
    } 
    return market;
  }
  closeBetSlip(betId: any) {
    const stake = new Stake();
    stake.closeMe = true;
    stake.betId = betId;
    this.betService.setStake().next(stake);
  }
  getDateTimeString(ed) {
    // tslint:disable-next-line:max-line-length
    const strDateTime = [this.getFormattedDatePart(ed.getDate()), '-', this.getFormattedDatePart(ed.getMonth() + 1), '-', this.getFormattedDatePart(ed.getFullYear()), ' ', this.getFormattedDatePart(ed.getHours()), ':', this.getFormattedDatePart(ed.getMinutes()), ':', this.getFormattedDatePart(ed.getSeconds()), ':', this.getFormattedDatePart(ed.getMilliseconds())].join('');
    return strDateTime;
  }
  getFormattedDatePart(num) {
    return num < 10 ? '0' + num.toString() : num;
  }
  getMarketNews() {
    const currentmarketvolumn = this.currentMarketVolumn.find(c => c.mid == this.betId);
    if (currentmarketvolumn !== null && currentmarketvolumn !== undefined) {
      const marketNews = this.marketNews.filter(x => x.ci == currentmarketvolumn.mc);
      if (marketNews !== null && marketNews !== undefined) {
        this.news = marketNews;
      }
    }
  }
  getMarket(): Observable<MarketType> {
    return this.market$.asObservable();
  }
  getCashoutDetails1(): Observable<any> {
    return this.cashout1$.asObservable();
  }
  addOrReplaceNewCS(data: any) {
    const index = this.marketRateFacadeService.marketNewCashout.findIndex(x => x.markerid == this.betId);
    if (index !== null && index !== undefined && index > -1) {
      this.marketRateFacadeService.marketNewCashout[index] = data;
    } else {
      this.marketRateFacadeService.marketNewCashout.push(data);
    }
    const marketcashout = Object.assign({}, this.marketRateFacadeService.marketNewCashout.find(x => x.markerid == this.betId));
    if (marketcashout && marketcashout?.order.some(x => x.stake >= 1) && marketcashout.libility != 0) {
      this.showNewCashOut = true;
      this.cashout1$.next(marketcashout);
    } else {
      this.showNewCashOut = false;
      // this.cashout1$.next(null);
    }
  }
  openConfirmNewCSModal() {
    if (websiteSettings.data.isShowCashoutConfirmDialog) {
      this.confirmModalRef1.open(); 
    } else {
      this.CashoutOrder();
    }
  }
  confirmnc(): void {
    this.CashoutOrder();
    this.confirmModalRef1.close();
  }
  declinenc(): void {
    this.isAcceptAnyPL =  false;
    this.confirmModalRef1.close();
  }
  CashoutOrder() {
    try {
      if (this.betService.getBetStatus()) {
        return false;
      }
      if (!websiteSettings.data.isShowCashoutConfirmDialog) {
        this.isAcceptAnyPL = apiEndPointData.data.isAcceptAnyPL;
      }
      const marketCashout = Object.assign({}, this.marketRateFacadeService.marketNewCashout.find(x => x.markerid == this.betId));
      const placeBet: any = {};
      placeBet.betId = this.betId;
      placeBet.liability = marketCashout.libility;
      // placeBet.profit = marketCashout.profit;
      placeBet.particalyCashout = 1;
      placeBet.isAcceptAnyPL = this.isAcceptAnyPL
      if (this.displayOverlay) { return false; }

      this.displayOverlay = true;
      this.betService.setBetStatus(true);
      this.marketRateFacadeService.PostNewCashOutOrder(placeBet).pipe(take(1)).subscribe(response => {
        if (response.isSuccess) {
          this.isAcceptAnyPL = false;
          this.marketRateFacadeService.setAudioType().next(AudioType.placeBet);
          this.toastr.success(response.result.message, "Notification", {
            toastClass: "custom-toast-success"
          });
          this.betService.setBetStatus(false);
          this.getMarketBets();

          let betlistData = response.result.betList ? response.result.betList : [];
          const betSerializer = new BetSerializer();
          const betList = betSerializer.fromJson(betlistData);
          this.marketRateFacadeService.setBetList$(betList);
        } else {
          this.marketRateFacadeService.setAudioType().next(AudioType.error);
          this.toastr.error(response.result.message, "Notification", {
            toastClass: "custom-toast-error"
          });
          this.betService.setBetStatus(false);
        }
      }, (error) => {
        this.displayOverlay = false;
        console.log('cashout place bet error', error);
        this.betService.setBetStatus(false);
        this.toastr.error('Opps something went wrong please try again !',"Notification",{
          toastClass: "custom-toast-error"
        });
      });
    } catch (ex) {
      this.displayOverlay = false;
      console.log(`error:=` + ex);
    }
  }
  getMarketBets() {
      this.marketRateFacadeService.getBetInfo(this.betId);
  }
  onChangeisAcceptAnyPL(isChecked: boolean) {
    this.isAcceptAnyPL = isChecked;
  }
  ngOnDestroy() {
    this.notifier.next();
    this.notifier.complete();
    this.varCashout?.unsubscribe();
  }
}
