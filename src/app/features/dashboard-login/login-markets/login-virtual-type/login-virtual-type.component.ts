import { AfterViewInit, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { BetStatus } from '@clientApp-core/enums/market-bet-status.type';
import { FanceType } from '@clientApp-core/enums/market-fancy.type';
import { MarketStatus } from '@clientApp-core/enums/market-status.type';
import { Stake } from '@clientApp-core/models/bet/stake.model';
import { MarketRates } from '@clientApp-core/models/market/market-rates.model';
import { BetFacadeService } from '@clientApp-core/services/bet/bet.facade.service';
import { CommonService } from '@clientApp-core/services/common/common.service';
import { MarketFacadeService } from '@clientApp-core/services/market/market-facade.service';
import { MarketRateFacadeService } from '@clientApp-core/services/market/market-rates/market-rate-facade.service';
import { MarketType } from '@clientApp-core/services/market/types/market';
import { BehaviorSubject, Subject, Observable } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-login-virtual-type',
  templateUrl: './login-virtual-type.component.html',
  styleUrls: ['./login-virtual-type.component.scss']
})
export class LoginVirtualTypeComponent implements OnInit, OnDestroy,AfterViewInit {
  @Input() matchId: number;
  @Input() betId: number;
  @Input() matchInfo;
  @Input() marketRunner;
  @Input() currentMarketVolumn;
  @Input() categoryName: string;
  @Input() selectedCategory: string;
  @Input() tournamentNm: string;
  showBallByBall: boolean = false;
  @Output() openPopup =  new EventEmitter();
  market$ = new BehaviorSubject<MarketType>(null);
  isLineMarket: boolean = false;
  isPremiumODDS: boolean = false;
  notifier = new Subject();
  constructor(private marketFacadeService : MarketFacadeService,
    private marketRateFacadeService: MarketRateFacadeService,
    public betService: BetFacadeService,
    public commonService: CommonService
  ) { }
  ngAfterViewInit(): void {
    this.showBallByBall = this.tournamentNm === 'Ball By Ball';
  }

  ngOnInit(): void {
    this.subscribeStore();
  }
  
  subscribeStore() {
    // tslint:disable-next-line:max-line-length
    let currentmarketvolumn, marketRunner;
    currentmarketvolumn = this.currentMarketVolumn.find(c => c.mid == this.betId);
    marketRunner = this.marketRunner.filter(x => x.mid === this.betId);
    if (currentmarketvolumn && marketRunner && marketRunner.length > 0) {
      this.isLineMarket = currentmarketvolumn.mt == FanceType.LineMarket ? true : false;
      this.isPremiumODDS = currentmarketvolumn.mt == FanceType.Virtual ? true : false;
      const market = this.showMarketInformation(currentmarketvolumn, {}, this.betId);
      this.market$.next(market);
    } else{
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
      this.marketRateFacadeService.getMultiMarketDetail$().pipe(takeUntil(this.notifier)).subscribe((data: any) => {
        currentmarketvolumn = this.currentMarketVolumn.find(c => c.mid == this.betId);
      marketRunner = this.marketRunner.filter(x => x.mid === this.betId);
      if (currentmarketvolumn && marketRunner && marketRunner.length > 0) {
        const market = this.showMarketInformation(currentmarketvolumn, {}, this.betId);
        this.market$.next(market);
      }
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
    market.overlayMessage = '';
    if (iStatus === MarketStatus.BallStart) {
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
  getMarket(): Observable<MarketType> {
    return this.market$.asObservable();
  }

  openLoginModel(){
    this.openPopup.emit();
  }

  ngOnDestroy() {
    this.notifier.next();
    this.notifier.complete();
  }
}
