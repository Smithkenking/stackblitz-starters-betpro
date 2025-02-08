import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MarketRates } from '@clientApp-core/models/market/market-rates.model';
import { MarketRateFacadeService } from '@clientApp-core/services/market/market-rates/market-rate-facade.service';
import { MarketType } from '@clientApp-core/services/market/types/market';
import { showMarketInformation } from '@clientApp-core/services/shared/shared.service';
import { untilDestroyed } from 'ngx-take-until-destroy';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-login-advance-session-type',
  templateUrl: './login-advance-session-type.component.html',
  styleUrls: ['./login-advance-session-type.component.scss']
})
export class LoginAdvanceSessionTypeComponent implements OnInit {
  @Input() matchId: number;
  @Input() betId: number;
  @Input() marketRunner;
  @Input() currentMarketVolumn;
  @Input() marketCount: number;
  @Input() isShowFancyTitle: boolean;
  @Input() categoryName: string;
  @Input() selectedCategory: string;
  @Output() openPopup =  new EventEmitter();
  market: MarketType;
  market$ = new BehaviorSubject<MarketType>(null);
  notifier = new Subject();
  constructor(private marketRateFacadeService: MarketRateFacadeService
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
  }
   // Set html of market
   setmatkettemplate(currentMarketVolumn: MarketRates) {
    const market = new MarketType();
    market.overlayMessage = '';
    market.isOverlayMessageVisible = true;
    market.mt = currentMarketVolumn.mt;
    this.market$.next(market);

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
