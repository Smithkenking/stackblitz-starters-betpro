import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { EstimatedProfitLoss } from '@clientApp-core/models/bet/estimated-profit-loss.model';
import { Stake } from '@clientApp-core/models/bet/stake.model';
import { MarketBet } from '@clientApp-core/models/market/market-bet.model';
import { MarketRates } from '@clientApp-core/models/market/market-rates.model';
import { MarketRunner } from '@clientApp-core/models/market/market-runner.model';
import { websiteSettings } from '@clientApp-core/services/authentication/authentication-facade.service';
import { BetFacadeService } from '@clientApp-core/services/bet/bet.facade.service';
import { CommonService } from '@clientApp-core/services/common/common.service';
import { apiEndPointData } from '@clientApp-core/services/config/connfig.service';
import { MarketRateFacadeService } from '@clientApp-core/services/market/market-rates/market-rate-facade.service';
import { MarketType } from '@clientApp-core/services/market/types/market';
import { MarketDetail } from '@clientApp-core/services/market/types/market-detail';
import { getRunnerById, setMarketRunnerInformation, setRateBoxTemp } from '@clientApp-core/services/shared/shared.service';
import { untilDestroyed } from 'ngx-take-until-destroy';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: '[app-login-Market-bet-details]',
  templateUrl: './login-Market-bet-details.component.html',
  styleUrls: ['./login-Market-bet-details.component.scss']
})
export class LoginMarketBetDetailsComponent implements OnInit {
  @Input() matchId: number;
  @Input() marketType: string;
  @Input() betId: number;
  @Input() marketRunner: MarketRunner[];
  @Input() currentMarketVolumns: MarketRates[];
  @Input() market: MarketType;
  @Input() sport: string;
  @Output() openPopup =  new EventEmitter();
  currentMarketVolumn: Partial<MarketRates>;
  marketRunners: MarketRunner[];
  marketClientBets: MarketBet[] = [];
  marketDetails: MarketDetail[] = [];
  calculatedProfitLoss: EstimatedProfitLoss[];
  estimateProfitLoss: string;
  vBet: Stake;
  vIsBack: boolean;
  vSelectedRunner = '';
  displayOverlay: boolean;
  currSeleItem: string;
  currSelectedItem: string;
  togglePanelView: boolean;
  vBetId: number;
  isShowAllLayRate: boolean = true;
  jodiMarketDetails: MarketDetail[] = [];
  showJodi = false;
  amt = 0;
  isShowJodiRunners: boolean;
  jodiMarketDetail: MarketDetail;
  excludeSports = [];
  excludeSport = [];
  isShowPlaceBetCounter: boolean = false;
  notifier = new Subject();
  isShowBetSlipBelowRunner: boolean;
  loaderPath:any;
  constructor(private marketRateFacadeService: MarketRateFacadeService,
    public betService: BetFacadeService, public commonService: CommonService) { }

  ngOnInit(): void {
    this.setmatkettemplate();
    this.subscribeStore();
    this.isShowJodiRunners = websiteSettings.data.isShowJodiRunners;
    this.excludeSports = apiEndPointData.data.excludeSports;
    this.excludeSport = this.excludeSports.map(x => x.name);
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
              // marketDetail.lblProfitLoss = value.estimatedProfitLoss.toString();
            } else if (this.betId === value.betId && value.betDetailId === 0 && value.estimatedProfitLoss == 0) {
              marketDetail.lblProfitLoss = '';
            }
          });
        });
      }
    });
    this.loaderPath = apiEndPointData.data.loaderPath;
    this.isShowBetSlipBelowRunner = apiEndPointData.data.isShowBetSlipBelowRunner;
    if (this.isShowBetSlipBelowRunner) {
      this.betSlipConfiguation();
    }
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
  betSlipConfiguation() {
    this.betService.getSelectedRunner$().subscribe(x => this.vSelectedRunner = x);
    this.betService.getStake$().pipe(takeUntil(this.notifier),untilDestroyed(this)).subscribe(bet => {
      if (bet && bet.betId === this.betId && this.betService.selectedBetDetailId === bet.betDetailId &&
        this.betService.lastSelectedItem === bet.currentSelectedItem) {
        this.togglePanelView = !this.togglePanelView;
        this.betService.selectedBetDetailId = bet.betDetailId;
        this.betService.lastSelectedItem = bet.currentSelectedItem;
        this.calculatedProfitLoss = [];
        this.resetBookValue();
      } else if (bet.betId === this.betId && bet.closeMe) {
        this.togglePanelView = false;
        this.vSelectedRunner = '';
        this.currSelectedItem = '';
        this.calculatedProfitLoss = [];
        this.resetBookValue();
      } else if (bet.betId === this.betId && !bet.closeMe) {
        this.betService.selectedBetDetailId = bet.betDetailId;
        this.betService.lastSelectedItem = bet.currentSelectedItem;
        this.togglePanelView = true;
      }
    });
    this.betService.getOvelayStatus$().pipe(takeUntil(this.notifier),untilDestroyed(this)).subscribe(display => {
      this.displayOverlay = display;
    });
    this.betService.getBetId$().pipe(takeUntil(this.notifier),untilDestroyed(this)).subscribe(betid => {
      if (betid) {
        this.vBetId = betid;
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
            return setMarketRunnerInformation(betDetail, filteredRunningMarket, this.currentMarketVolumn, this.marketClientBets, this.betId, this.calculatedProfitLoss, this.sport, this.excludeSport[0]);
          }).filter(betDetail => betDetail !== undefined);

          if (this.marketDetails !== undefined && this.marketDetails.length === 0) {
            this.marketDetails = marketDetails;
          } else if (marketDetails !== undefined
            && marketDetails.length > 0) {
            this.marketDetails = marketDetails;
          }
          if (this.isShowJodiRunners && this.showJodi) {
            this.getJodiRates();
          }
        }
      }
  }
  getAdjustmentFactor(adjustmentFactor: number) {
    if (adjustmentFactor) {
      return adjustmentFactor.toFixed(2) + '%, ';
    } else {
      return '';
    }
  }
  onChange(marketDetail: MarketDetail, isChecked: boolean) {
    if (isChecked) {
      this.jodiMarketDetails.push(marketDetail);
      this.amt++;
    } else {
      this.amt--
      let index = this.jodiMarketDetails.findIndex(x => x.betDetailId == marketDetail.betDetailId);
      this.jodiMarketDetails.splice(index);
    }
    this.amt >= 2 ? this.showJodi = true : this.showJodi = false;
  }
  disabledChBox(betDetailId: number) {
    if (this.showJodi) {
      let index = this.jodiMarketDetails.findIndex(x => x.betDetailId == betDetailId);
      return index === -1 ? true : false;
    } else {
      return false;
    }
  } 
  getJodiRates() {
    this.jodiMarketDetail = new MarketDetail();
    const jodiRunners = this.jodiMarketDetails.map(x => x.betDetailId);
    const jodiMarketDetails = this.marketDetails.filter(x => jodiRunners.some(y => x.betDetailId === y));
    const R1 = (+jodiMarketDetails[0].backRate1 + 1);
    const R2 = (+jodiMarketDetails[1].backRate1 + 1);
    const R1P = R1 * 100;
    const R2P = R2 * 100;
    const formula = (R1P / R2) + 100;
    const backRate = (R1P / formula);
    const layRate = (((+backRate - 1) / 10) + backRate).toFixed(2);
    this.jodiMarketDetail.backRate1 = backRate.toFixed(2).toString();
    this.jodiMarketDetail.layRate1 = layRate.toString();
    this.jodiMarketDetail.betTitle = jodiMarketDetails[0].betTitle + ' + ' + jodiMarketDetails[1].betTitle;
    this.jodiMarketDetail.betDetailId = jodiRunners;
    this.jodiMarketDetail.isJodiRates = true;
  }
  placeBet(marketDetail: MarketDetail, rate: string, isBack: boolean, currentItem: string) {
    // if (!this.currentMarketVolumn.mip) {
    //   this.marketRateFacadeService.setAudioType().next(AudioType.error);
    //   this.toastr.error(`You are not allowed to place bet for this market.`);
    //   return false;
    // }
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

  identify(index, item) {
    return item.betDetailId;
  }

  openLoginModel(){
    this.openPopup.emit();
  }
  omit_special_char(event)
  {   
     var k;  
     k = event.charCode;  //         k = event.keyCode;  (Both can be used)
     return((k > 64 && k < 91) || (k > 96 && k < 123) || k == 8 || k == 32 || (k >= 48 && k <= 57)); 
  }
  ngOnDestroy() {
    this.notifier.next();
    this.notifier.complete();
  }
}
