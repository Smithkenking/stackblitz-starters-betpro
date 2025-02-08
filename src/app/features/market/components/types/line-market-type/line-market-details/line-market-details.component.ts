import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { MarketRateFacadeService } from '@clientApp-core/services/market/market-rates/market-rate-facade.service';
import { BetFacadeService } from '@clientApp-core/services/bet/bet.facade.service';
import { ToastrService } from 'ngx-toastr';
import { untilDestroyed } from 'ngx-take-until-destroy';
import { MarketDetail } from '@clientApp-core/services/market/types/market-detail';
import { EstimatedProfitLoss } from '@clientApp-core/models/bet/estimated-profit-loss.model';
import { Stake } from '@clientApp-core/models/bet/stake.model';
import { MarketBet } from '@clientApp-core/models/market/market-bet.model';
import { AudioType } from '@clientApp-core/enums/audio.types';
import { getRunnerById, setMarketRunnerInformation, setRateBoxTemp } from '@clientApp-core/services/shared/shared.service';
import { MarketRunner } from '@clientApp-core/models/market/market-runner.model';
import { MarketRates } from '@clientApp-core/models/market/market-rates.model';
import { websiteSettings } from '@clientApp-core/services/authentication/authentication-facade.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CommonService } from '@clientApp-core/services/common/common.service';
import { FanceType } from '@clientApp-core/enums/market-fancy.type';

@Component({
  selector: '[app-line-market-details]',
  templateUrl: './line-market-details.component.html',
  styleUrls: ['./line-market-details.component.scss']
})
export class LineMarketDetailsComponent implements OnInit,OnDestroy {
  @Input() matchId: number;
  @Input() marketType: string;
  @Input() betId: number;
  @Input() marketRunner: MarketRunner[];
  @Input() currentMarketVolumns: MarketRates[];
  currentMarketVolumn: Partial<MarketRates>;
  marketClientBets: MarketBet[] = [];
  marketDetails: MarketDetail[] = [];
  calculatedProfitLoss: EstimatedProfitLoss[];
  vBet: Stake;
  vIsBack: boolean;
  vSelectedRunner = '';
  currSeleItem: string;
  currSelectedItem: string;
  showPosition = false;
  preventDefaultEvent = false;

  position = { x: -100, y: -100 };
  notifier = new Subject();
  maxLiability: any;
  constructor(private marketRateFacadeService: MarketRateFacadeService,
    public betService: BetFacadeService,public commonService: CommonService,
    private toastr: ToastrService) { }

    ngOnInit() {
      this.setmatkettemplate();
      this.subscribeStore();
      this.betService.getEstimatedProfitLoss().pipe(takeUntil(this.notifier),untilDestroyed(this)).subscribe((profitLoss) => {
        if (profitLoss != null) {
          this.calculatedProfitLoss = profitLoss;
          profitLoss.forEach((value) => {
            this.marketDetails.forEach(marketDetail => {
              if (this.betId === value.betId && marketDetail.betDetailId === value.betDetailId) {
              }
            });
          });
        }
      });
    }
    setmatkettemplate() {
      const curMarketRunners = getRunnerById(this.marketRunner, this.betId, this.matchId);;
      const filteredBetDetails = curMarketRunners.filter(betDetail => betDetail.mid === this.betId);
      if (filteredBetDetails != null
        && filteredBetDetails.length > 0 ) {
      const marketDetails = filteredBetDetails.map(betDetail => {
         return setRateBoxTemp(betDetail);
      }).filter(betDetail => betDetail !== undefined);
      if (this.marketDetails  !== undefined &&  this.marketDetails.length === 0 ) {
        this.marketDetails = marketDetails;
      } else if (marketDetails !== undefined
        && marketDetails.length > 0) {
        this.marketDetails = marketDetails;
      }
    }
    }  
    subscribeStore() {
        this.marketRateFacadeService.getRunningMarketDetail$().pipe(takeUntil(this.notifier),untilDestroyed(this)).subscribe(runningMarket => {
          this.getRunningMarketDetails(runningMarket);
        });
      this.marketRateFacadeService.getMarketClientBetList$().pipe(takeUntil(this.notifier),untilDestroyed(this)).subscribe(marketClientBets => {
        this.marketClientBets = marketClientBets.filter(bet =>
          bet.clientBetDetails.matchID === this.matchId
          && bet.clientBetDetails.betID === this.betId);
          if (websiteSettings.data.isShowMaxLiability && this.marketClientBets && this.marketClientBets.length > 0) {
            this.calculateMaxLiability();
          }
      });
    }
    getRunningMarketDetails(runningMarket: any) {
      this.currentMarketVolumn = this.currentMarketVolumns.find(c => c.mid == this.betId);
        const marketRunners = getRunnerById(this.marketRunner, this.betId, this.matchId);
        if (this.currentMarketVolumn && marketRunners) {
          const filteredBetDetails = marketRunners.filter(betDetail => betDetail.mid === this.betId);
          const filteredRunningMarket = +runningMarket?.mi === +this.currentMarketVolumn.mc ? runningMarket : null;
          if (filteredBetDetails != null
            && filteredRunningMarket != null
            && filteredBetDetails.length > 0
            && filteredRunningMarket !== undefined) {
            const marketDetails = filteredBetDetails.map(betDetail => {
              // tslint:disable-next-line:max-line-length
              return setMarketRunnerInformation(betDetail, filteredRunningMarket, this.currentMarketVolumn, this.marketClientBets, this.betId, this.calculatedProfitLoss);
            }).filter(betDetail => betDetail !== undefined);
  
            if (this.marketDetails !== undefined && this.marketDetails.length === 0) {
              this.marketDetails = marketDetails;
            } else if (marketDetails !== undefined
              && marketDetails.length > 0) {
              this.marketDetails = marketDetails;
            }
          }
        }
    }  
    placeBet(marketDetail: MarketDetail, rate: number, isBack: boolean, currentItem: string) {
      if (!this.currentMarketVolumn.mip) {
        this.marketRateFacadeService.setAudioType().next(AudioType.error);
        this.toastr.error(`You are not allowed to place bet for this market.`,"Notification",{
          toastClass: "custom-toast-error"
        });
        return false;
      }
      if (!!rate && !this.betService.getBetStatus()) {
        const placeBet = new Stake();
        placeBet.matchId = this.matchId;
        placeBet.betId = this.betId;
        placeBet.betDetailId = marketDetail.betDetailId;
        placeBet.betTitle = marketDetail.betTitle;
        placeBet.marketType = this.currentMarketVolumn.mt;
        placeBet.isBack = isBack;
        placeBet.isRunnerTypeMarket = true;
        placeBet.rate = rate;
        placeBet.point = rate;
        placeBet.currentProfitLoss = marketDetail.hdnProfitLoss;
        placeBet.currentSelectedItem = currentItem;
        this.currSelectedItem = marketDetail.betDetailId.toString() + '_' + currentItem;
        this.vBet = placeBet;
        this.vIsBack = isBack;
        this.currSeleItem = currentItem;
        this.betService.setStake().next(placeBet);
        this.betService.setBetId().next(this.betId);
        if (this.vSelectedRunner !== this.betId.toString() + '_' + marketDetail.betDetailId.toString() + '_' +
        this.vIsBack.toString() + '_' + currentItem) {
        this.betService.setSelectedRunner().next(this.betId.toString() + '_' + marketDetail.betDetailId.toString() + '_' +
          this.vIsBack.toString() + '_' + currentItem);
        } else {
        this.currSelectedItem = '';
        this.betService.sendEstimatedProfitLoss().next([]);
        this.betService.setSelectedRunner().next();
      }
      }
    }
  
    identify(index, item) {
      return item.betDetailId;
    }
    onStart(event) {
      this.preventDefaultEvent = true;
    }
  
    onStop(event) {
      this.preventDefaultEvent = false;
    }
  calculateMaxLiability() {
    const fancyMarkBetIds = this.currentMarketVolumns.map(item => (item.mt === FanceType.LineMarket && item.mid && item.mid !== undefined) ? item.mid : undefined);
    let marketClientBets = this.commonService.marketClientBets;
    marketClientBets = marketClientBets.filter(bet => fancyMarkBetIds.find(fbetId => bet.clientBetDetails.betID === fbetId));
    if (marketClientBets != null && marketClientBets !== undefined && marketClientBets.length > 0) {
      if (marketClientBets.length > 0) {
        const minRate = Math.min.apply(Math, marketClientBets.map(rate => +rate.clientBetDetails.rate)) - 1;
        const maxRate = Math.max.apply(Math, marketClientBets.map(rate => +rate.clientBetDetails.rate)) + 1;
        const clientsBets = marketClientBets.filter(bet => bet.clientBetDetails.betID === this.betId);
        let A = 0;
        for (let i = minRate; i < maxRate; i++) {
          const B = this.setPlByRate(i, clientsBets);
          if (A > B) {
            A = B;
          }
        }
        this.maxLiability = A;
      }
    }
  }
  private setPlByRate(winnerRate, bets): any {
    let pl = 0;
    const calulatedpl = bets.map(bet => {
      bet.clientBetDetails.isBack ?
        winnerRate >= +bet.clientBetDetails.rate ?
          pl += bet.clientBetDetails.profit : pl -= bet.clientBetDetails.stake
        : winnerRate >= +bet.clientBetDetails.rate ?
          pl -= bet.clientBetDetails.stake : pl += bet.clientBetDetails.profit;
      return pl;
    });
    return calulatedpl[calulatedpl.length - 1];
  }
  ngOnDestroy() {
    this.notifier.next();
    this.notifier.complete();
  }
}
