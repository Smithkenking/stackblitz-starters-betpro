import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { MarketRunner } from '@clientApp-core/models/market/market-runner.model';
import { MarketRates } from '@clientApp-core/models/market/market-rates.model';
import { MarketType } from '@clientApp-core/services/market/types/market';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { MarketRateFacadeService } from '@clientApp-core/services/market/market-rates/market-rate-facade.service';
import { BetFacadeService } from '@clientApp-core/services/bet/bet.facade.service';
import { untilDestroyed } from 'ngx-take-until-destroy';
import { websiteSettings } from '@clientApp-core/services/authentication/authentication-facade.service';
import { takeUntil } from 'rxjs/operators';
import { showMarketInformation } from '@clientApp-core/services/shared/shared.service';
import { MarketStatus } from '@clientApp-core/enums/market-status.type';
declare var $: any;

@Component({
  selector: 'app-advance-session-type',
  templateUrl: './advance-session-type.component.html',
  styleUrls: ['./advance-session-type.component.scss']
})
export class AdvanceSessionTypeComponent implements OnInit,OnDestroy {
  @Input() matchId: number;
  @Input() betId: number;
  @Input() marketRunner: MarketRunner[];
  @Input() marketRate: MarketRates[];
  @Input() currentMarketVolumn: MarketRates[];
  @Input() isShowFancyTitle: boolean;
  @Input() categoryName: string;
  @Input() selectedCategory: string;
  @Input() marketCount: number;
  market: MarketType;
  marketNews: any = [];
  news: any = '';
  market$ = new BehaviorSubject<MarketType>(null);
  matches: any;
  notifier = new Subject();
  constructor(private marketRateFacadeService: MarketRateFacadeService
    , public betService: BetFacadeService
  ) { }

  ngOnInit(): void {
    this.subscribeStore();
  }
  subscribeStore() {
    // tslint:disable-next-line:max-line-length
    let currentmarketvolumn, marketRunner;
    currentmarketvolumn = this.currentMarketVolumn.find(c => c.mid == this.betId);
    marketRunner = this.marketRunner.filter(x => x.mid === this.betId);
     if (currentmarketvolumn && marketRunner && marketRunner.length > 0) {
       this.setmatkettemplate(currentmarketvolumn);
    }
      this.marketRateFacadeService.getRunningMarketDetail$().pipe(takeUntil(this.notifier),untilDestroyed(this)).subscribe((RunningMarket) => {
        if (currentmarketvolumn) {
          const filteredRunningMarkets = RunningMarket?.mi === +currentmarketvolumn.mc ? RunningMarket : null;
          if (filteredRunningMarkets !== undefined && filteredRunningMarkets !== null) {
            const market = showMarketInformation(currentmarketvolumn, filteredRunningMarkets, this.betId);
            this.market$.next(market);
          }
        }
      });
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
   // Set html of market
   setmatkettemplate(currentMarketVolumn: MarketRates) {
    const market = new MarketType();
    market.overlayMessage = '';
    market.isOverlayMessageVisible = true;
    this.market$.next(market);
  }
  getMarket(): Observable<MarketType> {
    return this.market$.asObservable();
  }
  ngOnDestroy() {
    this.notifier.next();
    this.notifier.complete();
  }
}
