import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FanceType } from '@clientApp-core/enums/market-fancy.type';
import { websiteSettings } from '@clientApp-core/services/authentication/authentication-facade.service';
import { BetFacadeService } from '@clientApp-core/services/bet/bet.facade.service';
import { CommonService } from '@clientApp-core/services/common/common.service';
import { MarketRateFacadeService } from '@clientApp-core/services/market/market-rates/market-rate-facade.service';
import { MarketType } from '@clientApp-core/services/market/types/market';
import { showMarketInformation } from '@clientApp-core/services/shared/shared.service';
import { untilDestroyed } from 'ngx-take-until-destroy';
import * as M from "materialize-css/dist/js/materialize";
declare var $: any;
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-login-market-type',
  templateUrl: './login-market-type.component.html',
  styleUrls: ['./login-market-type.component.scss']
})
export class loginMarketTypeComponent implements OnInit,AfterViewInit {
  @Input() matchId: number;
  @Input() betId: number;
  @Input() matchInfo;
  @Input() marketRunner;
  @Input() currentMarketVolumn;
  @Input() categoryName: string;
  @Input() selectedCategory: string;
  @Input() sport: string;
  @Output() openPopup =  new EventEmitter();
  market$ = new BehaviorSubject<MarketType>(null);
  displayOverlay = false;
  isCollapsible: boolean = false;
  isLineMarket: boolean = false;
  confirmModalRef2;
  // isPremiumODDS: boolean = false;
  news: any = '';
  notifier = new Subject();
  @ViewChild('rules', { static: true }) template2: ElementRef;
  constructor(
    private marketRateFacadeService: MarketRateFacadeService,
    public betService: BetFacadeService,
    public commonService: CommonService
  ) { }

  ngOnInit(): void {
    this.subscribeStore();
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
      this.isLineMarket = currentmarketvolumn.mt == FanceType.LineMarket ? true : false;
      // this.isPremiumODDS = currentmarketvolumn.mt == FanceType.Sportbook ? true : false;
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
  }
  ngAfterViewInit(): void {
    this.confirmModalRef2 =  M.Modal.init(this.template2.nativeElement, {});
  }
  rulesPopUp(){
    this.confirmModalRef2.open();
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
