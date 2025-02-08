import { Component, OnInit, Input, ViewChild, OnDestroy, ElementRef, HostListener, AfterViewInit } from '@angular/core';
import { MarketRateFacadeService } from '@clientApp-core/services/market/market-rates/market-rate-facade.service';
import { BetFacadeService } from '@clientApp-core/services/bet/bet.facade.service';
import { ToastrService } from 'ngx-toastr';
import { DeviceInfoService } from '@clientApp-core/services/device-info/deviceinfo.services';
import { MarketType } from '@clientApp-core/services/market/types/market';
import { Observable, BehaviorSubject, Subscription, Subject, throwError } from 'rxjs';
import { MarketCashout } from '@clientApp-core/models/market/market-cashout.model';
import { AudioType } from '@clientApp-core/enums/audio.types';
import { take, takeUntil } from 'rxjs/operators';
import { untilDestroyed } from 'ngx-take-until-destroy';
import { websiteSettings } from '@clientApp-core/services/authentication/authentication-facade.service';
import { showMarketInformation } from '@clientApp-core/services/shared/shared.service';
import { CommonService } from '@clientApp-core/services/common/common.service';
import * as M from "materialize-css/dist/js/materialize";
import { MarketStatus } from '@clientApp-core/enums/market-status.type';
import { FanceType } from '@clientApp-core/enums/market-fancy.type';
import { apiEndPointData } from '@clientApp-core/services/config/connfig.service';
declare var $: any;

@Component({
  selector: 'app-market-type',
  templateUrl: './market-type.component.html',
  styleUrls: ['./market-type.component.scss']
})
export class MarketTypeComponent implements OnInit,AfterViewInit,OnDestroy {
  @Input() matchId: number;
  @Input() betId: number;
  @Input() marketCount: number;
  @Input() marketIndex: number;
  @Input() marketRunner;
  @Input() currentMarketVolumn;
  @Input() matchIndex: number;
  @Input() sport: string;
  @Input() categoryName: string;
  @Input() selectedCategory: string;

  market$ = new BehaviorSubject<MarketType>(null);
  cashout$ = new BehaviorSubject<MarketCashout>(null);
  cashout1$ = new BehaviorSubject<any>(null);
  marketcashout: MarketCashout;
  deviceInfo = '';
  isShowCashout = false;
  showCashOut = true;
  displayOverlay = false;
  confirmModalRef;
  varCashout: Subscription;
  varCashout1: Subscription;
  marketNews: any = [];
  news: any = '';
  showLimitPopup: boolean = false;
  notifier = new Subject();
  newCashoutData:any = [];
  isDisplayCashout:boolean= false;
  showNewCashOut = false;
  confirmModalRef1;
  confirmModalRef2;
  isAcceptAnyPL: boolean = apiEndPointData.data.isAcceptAnyPL;
  @ViewChild('cashOutModal', { static: true }) template: ElementRef;
  @ViewChild('newcashOutModal', { static: true }) template1: ElementRef;
  @ViewChild('rules', { static: true }) template2: ElementRef;
  constructor(
    private marketRateFacadeService: MarketRateFacadeService,
    public betService: BetFacadeService,
    private toastr: ToastrService,
    public deviceInfoService: DeviceInfoService,
    public commonService: CommonService
  ) { }
  @HostListener('document:click', ['$event']) onDocumentClick(event) {
    this.showLimitPopup=false;
  }
  ngOnInit(): void {
    this.isAcceptAnyPL = apiEndPointData.data.isAcceptAnyPL;
    this.subscribeStore();
    this.deviceInfo = 'browser=' + this.deviceInfoService.getDeviceInfo().browser
      + ':: device=' + this.getDevice() + ':: os=' + this.deviceInfoService.getDeviceInfo().os;
    this.showCashOut = websiteSettings.data.isShowCashout;
  }
  ngAfterViewInit(): void {
    this.confirmModalRef =  M.Modal.init(this.template.nativeElement, {});
    this.confirmModalRef1 =  M.Modal.init(this.template1.nativeElement, {});
    this.confirmModalRef2 =  M.Modal.init(this.template2.nativeElement, {});
  }
  subscribeStore() {
    // tslint:disable-next-line:max-line-length
    let currentmarketvolumn, marketRunner;
    currentmarketvolumn = this.currentMarketVolumn.find(c => c.mid == this.betId);
    marketRunner = this.marketRunner.filter(x => x.mid === this.betId);
    if (currentmarketvolumn  && marketRunner && marketRunner.length > 0) {
      const market = showMarketInformation(currentmarketvolumn, {}, this.betId);
      this.market$.next(market);
    }
      this.marketRateFacadeService.getRunningMarketDetail$().pipe(takeUntil(this.notifier),untilDestroyed(this)).subscribe((RunningMarket) => {
        if (currentmarketvolumn ) {
          const filteredRunningMarkets = RunningMarket?.mi === +currentmarketvolumn.mc ? RunningMarket : null;
          if (filteredRunningMarkets !== undefined && filteredRunningMarkets !== null) {
            const market = showMarketInformation(currentmarketvolumn, filteredRunningMarkets, this.betId);
            this.market$.next(market);
          }
        }
      });
    this.varCashout = this.marketRateFacadeService.getMarketCashout().pipe(takeUntil(this.notifier),untilDestroyed(this)).subscribe((data: MarketCashout) => {
      if (data && data !== null && data !== undefined) {
        if (data.closeMe && this.betId === data.betId) {
          this.addOrReplace(data);
          this.isShowCashout = true;
        } else {
          this.isShowCashout = false;
          this.marketcashout = null;
        }
      } else {
        this.isShowCashout = false;
        this.marketcashout = null;
      }
    });
    this.varCashout1 = this.marketRateFacadeService.getMarketCashout1().subscribe((data: any) => {
      if(data && data.ShowCashout && this.betId == data.markerid && data.libility != null ){
        this.addOrReplaceNewCS(data);
        // this.cashout1$.next(data);
      } else if(data && !data.ShowCashout && this.betId == data.markerid) {
         this.showNewCashOut = false;
        // this.cashout1$.next(null);
      }
      // this.cashout1$.next(data);
    });
    this.marketRateFacadeService.getMarketNewsChanges$().pipe(takeUntil(this.notifier),untilDestroyed(this)).subscribe((data: any) => {
      var result = this.marketNews.filter(function (o1) {
        return !data.some(function (o2) {
          return o1.mc == o2.mc;
        });
      });
      this.marketNews = Object.assign([], (data.concat(this.marketNews)));
      this.getMarketNews();
    });
    //  This trigger has used to change market market status
    this.marketRateFacadeService.getMarketStatusChanges$().pipe(takeUntil(this.notifier),untilDestroyed(this)).subscribe((data: any) => {
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
  getDevice() {
    if (this.deviceInfoService.isDesktop()) {
      return 'Desktop';
    } else if (this.deviceInfoService.isMobile()) {
      return 'Mobile';
    } else if (this.deviceInfoService.isTablet()) {
      return 'Tablet';
    } else {
      return 'unknown';
    }
  }
  getMarket(): Observable<MarketType> {
    return this.market$.asObservable();
  }
  getCashoutDetails(): Observable<MarketCashout> {
    return this.cashout$.asObservable();
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
  addOrReplace(object: MarketCashout) {
    const index = this.marketRateFacadeService.marketCashout.findIndex(x => x.betId == object.betId);
    if (index !== null && index !== undefined && index > -1) {
      this.marketRateFacadeService.marketCashout[index] = object;
    } else {
      this.marketRateFacadeService.marketCashout.push(object);
    }
    this.marketcashout = Object.assign([], this.marketRateFacadeService.marketCashout.find(x => x.betId == this.betId));
    if (this.marketcashout.cashout > 1 && this.marketcashout.plCashout !== 0) {
      this.cashout$.next(this.marketcashout);
    } else {
      this.cashout$.next(null);
    }
  }

  openConfirmModal() {
    if (websiteSettings.data.isShowCashoutConfirmDialog) {
      this.confirmModalRef.open(); 
    } else {
      this.PostCashout();
      // this.onCashoutClick();
    }
  }
  confirm(): void {
    this.PostCashout();
    // this.onCashoutClick();
    this.confirmModalRef.close();
  }
  decline(): void {
    this.confirmModalRef.close();
  }
  onCashoutClick(){
    try {
      if (this.betService.getBetStatus()) {
        return false;
      }
      const marketCashout = Object.assign([], this.newCashoutData[0]);
      const placeBet = new MarketCashout();
      placeBet.betId = this.betId;
      placeBet.betDetailID = marketCashout.betDetailId;
      placeBet.isback = marketCashout.hedgeSide === "BACK" ? true : false;
      placeBet.rate = marketCashout.odd;
      placeBet.stack = marketCashout.hedgeStake;
      placeBet.fancyType = FanceType.Market;
      placeBet.point = 0;
      placeBet.p1 = 0;
      placeBet.p2 = 0;
      placeBet.ltp = 0;
      placeBet.plCashout = 0;
      placeBet.DeviceInfo = this.deviceInfo;

      if (this.displayOverlay) { return false; }

      this.displayOverlay = true;
      this.betService.setBetStatus(true);
      this.marketRateFacadeService.PostCashOut(placeBet).pipe(take(1)).subscribe(response => {
        const result = response.split(';');
        if (result.length > 0) {
          if (result[0] !== 'false') {
            this.marketRateFacadeService.setAudioType().next(AudioType.placeBet);
            this.toastr.success(result[1],"Notification",{
              toastClass: "custom-toast-success"
            });
            this.betService.setBetStatus(false);
            this.getMarketBets();
          } else {
            this.marketRateFacadeService.setAudioType().next(AudioType.error);
            this.toastr.error(result[1],"Notification",{
              toastClass: "custom-toast-error"
            });
            this.betService.setBetStatus(false);
          }
        } else {
          this.marketRateFacadeService.setAudioType().next(AudioType.error);
          this.betService.setBetStatus(false);
        }
        this.displayOverlay = false;
        this.betService.setBetStatus(false);  
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
  PostCashout() {
    try {
      if (this.betService.getBetStatus()) {
        return false;
      }
      const marketCashout = Object.assign([], this.marketRateFacadeService.marketCashout.find(x => x.betId == this.betId));
      const placeBet = new MarketCashout();
      placeBet.betId = this.betId;
      placeBet.betDetailID = marketCashout.betDetailID;
      placeBet.isback = marketCashout.isback;
      placeBet.rate = marketCashout.rate;
      placeBet.stack = marketCashout.stack;
      placeBet.fancyType = marketCashout.fancyType;
      placeBet.point = marketCashout.point;
      placeBet.p1 = marketCashout.p1;
      placeBet.p2 = marketCashout.p2;
      placeBet.ltp = marketCashout.ltp;
      placeBet.plCashout = marketCashout.plCashout;
      placeBet.DeviceInfo = this.deviceInfo;

      if (this.displayOverlay) { return false; }

      this.displayOverlay = true;
      this.betService.setBetStatus(true);
      this.marketRateFacadeService.PostCashOut(placeBet).pipe(take(1)).subscribe(response => {
        const result = response.split(';');
        if (result.length > 0) {
          if (result[0] !== 'false') {
            this.marketRateFacadeService.setAudioType().next(AudioType.placeBet);
            this.toastr.success(result[1],"Notification",{
              toastClass: "custom-toast-success"
            });
            this.betService.setBetStatus(false);
            this.getMarketBets();
          } else {
            this.marketRateFacadeService.setAudioType().next(AudioType.error);
            this.toastr.error(result[1],"Notification",{
              toastClass: "custom-toast-error"
            });
            this.betService.setBetStatus(false);
          }
        } else {
          this.marketRateFacadeService.setAudioType().next(AudioType.error);
          this.betService.setBetStatus(false);
        }
        this.displayOverlay = false;
        this.betService.setBetStatus(false);  
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
  openConfirmNewCSModal() {
    if (websiteSettings.data.isShowCashoutConfirmDialog) {
      this.confirmModalRef1.open(); 
    } else {
      this.PostnewCashout();
    }
  }
  
  confirmnc(): void {
    this.PostnewCashout();
    this.confirmModalRef1.close();
  }
  declinenc(): void {
    this.isAcceptAnyPL =  false;
    this.confirmModalRef1.close();
  }
  rulesPopUp(){
    this.confirmModalRef2.open();
  }
  PostnewCashout() {
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
      this.marketRateFacadeService.PostNewCashOut(placeBet).pipe(take(1)).subscribe(response => {
        const result = response.split(';');
        if (result.length > 0) {
          if (result[0] !== 'false') {
            this.isAcceptAnyPL =  false;
            this.marketRateFacadeService.setAudioType().next(AudioType.placeBet);
            this.toastr.success(result[1],"Notification",{
              toastClass: "custom-toast-success"
            });
            this.betService.setBetStatus(false);
            this.getMarketBets();
          } else {
            this.marketRateFacadeService.setAudioType().next(AudioType.error);
            this.toastr.error(result[1],"Notification",{
              toastClass: "custom-toast-error"
            });
            this.betService.setBetStatus(false);
          }
        } else {
          this.marketRateFacadeService.setAudioType().next(AudioType.error);
          this.betService.setBetStatus(false);
        }
        this.displayOverlay = false;
        this.betService.setBetStatus(false);  
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
    if (!websiteSettings.data.appIsRealBalanceUse) {
      this.marketRateFacadeService.getWagerBetInfo(this.betId);
    } else {
      this.marketRateFacadeService.getBetInfo(this.betId);
    }
  }
  onChangeisAcceptAnyPL(isChecked: boolean) {
    this.isAcceptAnyPL = isChecked;
  }
  ngOnDestroy() {
    this.notifier.next();
    this.notifier.complete();
    this.varCashout.unsubscribe();
    this.varCashout1.unsubscribe();
  }
}
