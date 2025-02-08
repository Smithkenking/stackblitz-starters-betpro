import { Component, OnInit, Input, OnDestroy, HostListener } from '@angular/core';
import { MarketRunner } from '@clientApp-core/models/market/market-runner.model';
import { MarketRates } from '@clientApp-core/models/market/market-rates.model';
import { MarketType } from '@clientApp-core/services/market/types/market';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { BetFacadeService } from '@clientApp-core/services/bet/bet.facade.service';
import { MarketRateFacadeService } from '@clientApp-core/services/market/market-rates/market-rate-facade.service';
import { untilDestroyed } from 'ngx-take-until-destroy';
import { websiteSettings } from '@clientApp-core/services/authentication/authentication-facade.service';
import { takeUntil } from 'rxjs/operators';
import { showMarketInformation } from '@clientApp-core/services/shared/shared.service';
import { CommonService } from '@clientApp-core/services/common/common.service';
import { MarketStatus } from '@clientApp-core/enums/market-status.type';
declare var $: any;

@Component({
  selector: 'app-line-market-type',
  templateUrl: './line-market-type.component.html',
  styleUrls: ['./line-market-type.component.scss']
})
export class LineMarketTypeComponent implements OnInit,OnDestroy {
  @Input() matchId: number;
  @Input() betId: number;
  @Input() marketCount: number;
  @Input() marketIndex: number;
  @Input() marketRunner: MarketRunner[];
  @Input() currentMarketVolumn: MarketRates[];
  @Input() matchIndex: number;
  @Input() categoryName: string;
  @Input() selectedCategory: string;
  market: MarketType;
  isCollapsible: boolean = false;
  marketNews: any = [];
  news: any = '';
  showLimitPopup: boolean = false;
  notifier = new Subject();
  market$ = new BehaviorSubject<MarketType>(null);
  constructor(public betService: BetFacadeService
    , private marketRateFacadeService: MarketRateFacadeService, public commonService: CommonService) { }

  ngOnInit(): void {
    this.subscribeStore();
  }
  @HostListener('document:click', ['$event']) onDocumentClick(event) {
    this.showLimitPopup=false;
  }
  isCollapsibleMarket() {
    this.isCollapsible = !this.isCollapsible;
  }
  subscribeStore() {
    // tslint:disable-next-line:max-line-length
    let currentmarketvolumn, marketRunner;
    currentmarketvolumn = this.currentMarketVolumn.find(c => c.mid == this.betId);
    marketRunner = this.marketRunner.filter(x => x.mid === this.betId);
    if (currentmarketvolumn && marketRunner && marketRunner.length > 0) {
      const market = showMarketInformation(currentmarketvolumn, {}, this.betId);
      this.market$.next(market);
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
    this.marketRateFacadeService.getMarketNewsChanges$().pipe(takeUntil(this.notifier),untilDestroyed(this)).subscribe((data: any) => {
      var result = this.marketNews.filter(function (o1) {
        return !data.some(function (o2) {
          return o1.mc == o2.mc;
        });
      });
      this.marketNews = Object.assign([], (data.concat(this.marketNews)));
      this.getMarketNews();
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
  getMarketNews() {
    const currentmarketvolumn = this.currentMarketVolumn.find(c => c.mid == this.betId);
    if (currentmarketvolumn !== null && currentmarketvolumn !== undefined) {
      const marketNews = this.marketNews.filter(x => x.ci == currentmarketvolumn.mc);
      if (marketNews !== null && marketNews !== undefined) {
        this.news = marketNews;
      }
    }
  }
  hideMarketNews(val: any) {
    const currentDate: Date = new Date();
    const endDate: Date = val.td && val.td !== null && val.td !== undefined && val.td !== '' ? new Date(val.td) : new Date();
    if (currentDate.getTime() <= endDate.getTime()){
      return true;
    }
    this.marketNews = this.marketNews.filter(function( obj ) {
      return obj.td !== val.td && obj.ci == val.ci ;
    });
    this.news = Object.assign([], this.marketNews);
    return false;
  }
  getMarket(): Observable<MarketType> {
    return this.market$.asObservable();
  }

  ngOnDestroy() {
    this.notifier.next();
    this.notifier.complete();
  }
}
