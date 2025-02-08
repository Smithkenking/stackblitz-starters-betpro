import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { AudioType } from '@clientApp-core/enums/audio.types';
import { EstimatedProfitLoss } from '@clientApp-core/models/bet/estimated-profit-loss.model';
import { Stake } from '@clientApp-core/models/bet/stake.model';
import { MarketBet } from '@clientApp-core/models/market/market-bet.model';
import { MarketRates } from '@clientApp-core/models/market/market-rates.model';
import { MarketRunner } from '@clientApp-core/models/market/market-runner.model';
import { websiteSettings } from '@clientApp-core/services/authentication/authentication-facade.service';
import { BetFacadeService } from '@clientApp-core/services/bet/bet.facade.service';
import { MarketRateFacadeService } from '@clientApp-core/services/market/market-rates/market-rate-facade.service';
import { MarketType } from '@clientApp-core/services/market/types/market';
import { MarketDetail } from '@clientApp-core/services/market/types/market-detail';
import { getRunnerById, setMarketRunnerInformation, setRateBoxTemp } from '@clientApp-core/services/shared/shared.service';
import { untilDestroyed } from 'ngx-take-until-destroy';
import { ToastrService } from 'ngx-toastr';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: '[app-login-line-market-bet-details]',
  templateUrl: './login-line-market-bet-details.component.html',
  styleUrls: ['./login-line-market-bet-details.component.scss']
})
export class LoginLineMarketBetDetailsComponent implements OnInit, OnDestroy {
  @Input() matchId: number;
  @Input() marketType: string;
  @Input() betId: number;
  @Input() marketRunner: MarketRunner[];
  @Input() currentMarketVolumns: MarketRates[];
  @Input() market: MarketType;
  @Output() openPopup =  new EventEmitter();
  currentMarketVolumn: Partial<MarketRates>;
  marketRunners: MarketRunner[];
  marketClientBets: MarketBet[] = [];
  marketDetails: MarketDetail[] = [];
  calculatedProfitLoss: EstimatedProfitLoss[];
  vBet: Stake;
  vIsBack: boolean;
  vSelectedRunner = '';
  displayOverlay: boolean;
  currSeleItem: string;
  currSelectedItem: string;
  togglePanelView: boolean;
  vBetId: number;
  isShowPlaceBetCounter: boolean = false;
  notifier = new Subject();
  market$ = new BehaviorSubject<MarketDetail>(null);
  constructor(private marketRateFacadeService: MarketRateFacadeService,
    public betService: BetFacadeService,
    private toastr: ToastrService) { }

  ngOnInit(): void {
    this.setmatkettemplate();
    this.subscribeStore();
    this.isShowPlaceBetCounter = websiteSettings.data.isShowPlaceBetCounter;
    this.betService.getEstimatedProfitLoss().pipe((takeUntil(this.notifier),untilDestroyed(this))).subscribe((profitLoss) => {
      if (profitLoss != null) {
        this.calculatedProfitLoss = profitLoss;
        profitLoss.forEach((value) => {
          this.marketDetails.forEach(marketDetail => {
            if (this.betId === value.betId && marketDetail.betDetailId === value.betDetailId) {
              if (marketDetail.profitLoss === +value.estimatedProfitLoss) {
                marketDetail.lblProfitLoss = '';
              } else {
                marketDetail.lblProfitLoss = value.estimatedProfitLoss.toString();
              }
            } else if (this.betId === value.betId && value.betDetailId === 0 && value.estimatedProfitLoss == 0) {
              marketDetail.lblProfitLoss = '';
            }
          });
        });
      }
    });
  }
  setmatkettemplate() {
    const curMarketRunners = getRunnerById(this.marketRunner, this.betId, this.matchId);
    const filteredBetDetails = curMarketRunners.filter(betDetail => betDetail.mid === this.betId);
    if (filteredBetDetails != null
      && filteredBetDetails.length > 0) {
      const marketDetails = filteredBetDetails.map(betDetail => {
        return setRateBoxTemp(betDetail);
      }).filter(betDetail => betDetail !== undefined);
      if (this.marketDetails !== undefined && this.marketDetails.length === 0) {
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
  }
  getMarketDetail(): Observable<MarketDetail> {
    return this.market$.asObservable();
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
          this.market$.next(this.marketDetails[0]);
        }
      }
  }
  placeBet(marketDetail: MarketDetail, rate: string, isBack: boolean, currentItem: string) {
    if(rate == ''){
      return false;
    } 
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
      placeBet.rate = +rate;
      placeBet.point = +rate;
      placeBet.currentProfitLoss = marketDetail.hdnProfitLoss;
      placeBet.currentSelectedItem = currentItem;
      this.vBet = placeBet;
      this.vIsBack = isBack;
      this.currSeleItem = currentItem;
      this.currSelectedItem = marketDetail.betDetailId.toString() + '_' + currentItem;
      placeBet.isJodiRates = marketDetail.isJodiRates;
      this.betService.setStake().next(placeBet);
      this.betService.setBetId().next(this.betId);
      if (this.vSelectedRunner !== this.betId.toString() + '_' + marketDetail.betDetailId.toString() + '_' +
        this.vIsBack.toString() + '_' + currentItem) {
        this.betService.setSelectedRunner().next(this.betId.toString() + '_' + marketDetail.betDetailId.toString() + '_' +
          this.vIsBack.toString() + '_' + currentItem);
      } else {
        this.currSelectedItem = '';
        this.resetBookValue();
        this.betService.setSelectedRunner().next();
      }
    }
  }
  resetBookValue() {
    const calculatedEstimatedProfitLoss: EstimatedProfitLoss[] = [];
    const estimatedProfitLoss = new EstimatedProfitLoss();
    estimatedProfitLoss.betId = this.betId;
    estimatedProfitLoss.betDetailId = 0;
    estimatedProfitLoss.estimatedProfitLoss = 0;
    calculatedEstimatedProfitLoss.push(estimatedProfitLoss);
    this.betService.sendEstimatedProfitLoss().next(calculatedEstimatedProfitLoss);
  }

  openLoginModel(){
    this.openPopup.emit();
  }

  ngOnDestroy() {
    this.notifier.next();
    this.notifier.complete();
  }

}
