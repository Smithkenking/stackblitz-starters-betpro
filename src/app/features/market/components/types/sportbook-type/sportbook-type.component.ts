import { AfterViewInit, Component, ElementRef, HostListener, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MarketStatus } from '@clientApp-core/enums/market-status.type';
import { websiteSettings } from '@clientApp-core/services/authentication/authentication-facade.service';
import { MarketRateFacadeService } from '@clientApp-core/services/market/market-rates/market-rate-facade.service';
import { MarketType } from '@clientApp-core/services/market/types/market';
import { showMarketInformation } from '@clientApp-core/services/shared/shared.service';
import { untilDestroyed } from 'ngx-take-until-destroy';
import { BehaviorSubject, Observable, Subject, Subscription } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';
import * as M from "materialize-css/dist/js/materialize";
import { BetFacadeService } from '@clientApp-core/services/bet/bet.facade.service';
import { ToastrService } from 'ngx-toastr';
import { AudioType } from '@clientApp-core/enums/audio.types';
import { CommonService } from '@clientApp-core/services/common/common.service';
import { SessionService } from '@clientApp-core/services/session/session.service';
import { MarketFacadeService } from '@clientApp-core/services/market/market-facade.service';
import { apiEndPointData } from '@clientApp-core/services/config/connfig.service';
@Component({
  selector: 'app-sportbook-type',
  templateUrl: './sportbook-type.component.html',
  styleUrls: ['./sportbook-type.component.scss']
})
export class SportbookTypeComponent implements OnInit,AfterViewInit, OnDestroy {
  @Input() matchId: number;
  @Input() betId: number;
  @Input() marketCount: number;
  @Input() marketIndex: number;
  @Input() marketRunner;
  @Input() currentMarketVolumn;
  @Input() matchIndex: number;
  @Input() categoryName: string;
  @Input() selectedCategory: string;
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
  @ViewChild('newcashOutModal', { static: true }) template1: ElementRef;
  cashout1$ = new BehaviorSubject<any>(null);
  constructor(
    public betService: BetFacadeService,
    private toastr: ToastrService,
    public commonService: CommonService,private sessionService :SessionService,private marketFacadeService : MarketFacadeService,
    private marketRateFacadeService: MarketRateFacadeService,
  ) { }
  @HostListener('document:click', ['$event']) onDocumentClick(event) {
    this.showLimitPopup=false;
  }
  ngOnInit(): void {
    this.isAcceptAnyPL= apiEndPointData.data.isAcceptAnyPL;
    this.subscribeStore();
  }
  ngAfterViewInit(): void {
    this.confirmModalRef1 =  M.Modal.init(this.template1.nativeElement, {});
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
      const market = showMarketInformation(currentmarketvolumn, {}, this.betId);
      this.market$.next(market);
    } else {
      this.marketFacadeService.removeMaket(this.betId);
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
            });;
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
  }
}
