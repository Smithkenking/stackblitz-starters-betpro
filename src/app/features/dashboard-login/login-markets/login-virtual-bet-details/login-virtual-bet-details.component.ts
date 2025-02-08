import { AfterViewInit, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FanceType } from '@clientApp-core/enums/market-fancy.type';
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
import { getRunnerById } from '@clientApp-core/services/shared/shared.service';
import { GetSortOrder } from '@clientApp-core/utilities/app-configuration';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: '[app-login-virtual-bet-details]',
  templateUrl: './login-virtual-bet-details.component.html',
  styleUrls: ['./login-virtual-bet-details.component.scss']
})
export class LoginVirtualBetDetailsComponent implements OnInit, OnDestroy,AfterViewInit {
  @Input() matchId: number;
  @Input() marketType: string;
  @Input() betId: number;
  @Input() marketRunner: MarketRunner[];
  @Input() currentMarketVolumns: MarketRates[];
  @Input() market: MarketType;
  @Output() openPopup =  new EventEmitter();
  @Input() tournamentNm: string;
  showBallByBall: boolean = false;
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
  jodiMarketDetails: MarketDetail[] = [];
  showJodi = false;
  amt = 0;
  jodiMarketDetail: MarketDetail;
  notifier = new Subject();
  isShowBetSlipBelowRunner: boolean;
  loaderPath: any
  constructor(private marketRateFacadeService: MarketRateFacadeService,
    public betService: BetFacadeService, public commonService: CommonService) { }

  ngAfterViewInit(): void {
    this.showBallByBall = this.tournamentNm === 'Ball By Ball';
  }

  ngOnInit(): void {
    this.setmatkettemplate();
    this.subscribeStore();
    this.betService.getEstimatedProfitLoss().pipe((takeUntil(this.notifier))).subscribe((profitLoss) => {
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
        return this.setRateBoxTemp(betDetail);
      }).filter(betDetail => betDetail !== undefined);
      if (this.marketDetails !== undefined && this.marketDetails.length === 0) {
        this.marketDetails = marketDetails;
      } else if (marketDetails !== undefined
        && marketDetails.length > 0) {
        this.marketDetails = marketDetails;
      }
    }
  }
  setRateBoxTemp(betDetail: MarketRunner) {
    const marketDetail = new MarketDetail();
    marketDetail.betDetailId = betDetail.rid;
    marketDetail.betTitle = betDetail.rn;
    marketDetail.lblProfitLoss = '';
    marketDetail.cn  = betDetail.cn ;
    marketDetail.sd  = betDetail.sd ;
    marketDetail.cfn  = betDetail.cfn ;
    marketDetail.jn  = betDetail.jn ;
    marketDetail.profitLoss = 0;
    marketDetail.liability = 0;
    for (let i = 0; i < 3; i++) {
      marketDetail[`backRate${i + 1}`] = '';
      marketDetail[`totalBackAmount${i + 1}`] = '';
      marketDetail[`layRate${i + 1}`] = '';
      marketDetail[`totalBackAmount${i + 1}`] = '';
    }
    return marketDetail;
  }
  subscribeStore() {
      this.marketRateFacadeService.getRunningMarketDetail$().pipe(takeUntil(this.notifier)).subscribe(runningMarket => {
        this.getRunningMarketDetails(runningMarket);
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
            return this.setMarketRunnerInformation(betDetail, filteredRunningMarket, this.currentMarketVolumn, this.marketClientBets, this.betId, this.calculatedProfitLoss);
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
  setMarketRunnerInformation(betDetail: MarketRunner,
    runningMarket: any
    , currentMarketVolumn: Partial<MarketRates>
  , marketClientBets: MarketBet[], betId: number, calculatedProfitLoss: EstimatedProfitLoss[], sport?: string, excludeSport?: string) {
    const marketDetail = new MarketDetail();
    const volumnData = currentMarketVolumn;
    marketDetail.betDetailId = betDetail.rid;
    marketDetail.betTitle = betDetail.rn;
    marketDetail.betDetailId = betDetail.rid;
    marketDetail.betTitle = betDetail.rn;
    marketDetail.betId =volumnData.mid;
    marketDetail.cn  = betDetail.cn ;
    marketDetail.sd  = betDetail.sd ;
    marketDetail.cfn  = betDetail.cfn ;
    marketDetail.jn  = betDetail.jn ;
    marketDetail.af  = betDetail.af ;
    marketDetail.tm = runningMarket?.tm ? runningMarket.tm : '';
    const user = JSON.parse(localStorage.getItem('token'));
      if (user == null || user == undefined || user == '') {
        volumnData.mr = 1;
      }
    let marketRate: any;
    if (runningMarket !== undefined
      && runningMarket !== null
      && !!runningMarket.rt
      && runningMarket.rt.length > 0) {
      marketRate = (runningMarket.rt).filter(rate => +rate.si === +betDetail.rsd);
    }
    let runnerBetsList: MarketBet[] = [];
    let runnerProfitLoss = 0.00;
    // update profit and loss for each runner with calculations.
    marketDetail.profitLoss = isNaN(runnerProfitLoss) ? 0 : runnerProfitLoss;
    const vDifferentPL = +marketDetail.lblProfitLoss - marketDetail.hdnProfitLoss;
    // tslint:disable-next-line:max-line-length
    if (calculatedProfitLoss != null && calculatedProfitLoss.length > 0) {
      // tslint:disable-next-line:max-line-length
      const filteredCalculatedProfitLoss = calculatedProfitLoss.filter(value => value.betId === betId && value.betDetailId === betDetail.rid);
      if (filteredCalculatedProfitLoss !== undefined && filteredCalculatedProfitLoss.length > 0) {
        marketDetail.hdnProfitLoss = filteredCalculatedProfitLoss[0].estimatedProfitLoss;
        marketDetail.lblProfitLoss = filteredCalculatedProfitLoss[0].estimatedProfitLoss.toString();
      } else {
        marketDetail.hdnProfitLoss = marketDetail.profitLoss;
        marketDetail.lblProfitLoss = marketDetail.profitLoss.toString();
      }
    } else {
      marketDetail.hdnProfitLoss = marketDetail.profitLoss;
      marketDetail.lblProfitLoss = marketDetail.profitLoss.toString();
    }
  
    if (marketDetail.profitLoss === 0 && vDifferentPL === 0) {
      marketDetail.lblProfitLoss = '';
    }
    if (marketDetail.profitLoss === +marketDetail.lblProfitLoss) {
      marketDetail.lblProfitLoss = '';
    }
    if (marketRate !== undefined && marketRate.length > 0) {
  
      const backRate = marketRate.filter(function (value) { return value.ib === true });
      const isLayRate = marketRate.filter(function (value) { return value.ib === false });
      if (backRate.length > 0 || isLayRate.length > 0) {
        let maxRate = 0;
        if (backRate.length > 0) { maxRate = Math.max.apply(Math, backRate.map(function (o) { return o.re; })); }
        const layRate = marketRate.filter((value) => {
          return value.ib === false
            && value.re > maxRate;
        });
        backRate.sort(GetSortOrder('re')).reverse();
        layRate.sort(GetSortOrder('re'));
        let marketRateForPosition: number;
        for (let i = 0; i < 3; i++) {
          try {
            let rate = '';
            let volumn = '';
            if (i < backRate.length) {
              let exitingVolume = 0;
              if (runnerBetsList != null && runnerBetsList !== undefined && runnerBetsList) {
                const exitRunnerbets = runnerBetsList.filter(value => {
                  return value.clientBetDetails.isBack
                    && +value.clientBetDetails.rate === backRate[i].re;
                });
                if (exitRunnerbets !== undefined && exitRunnerbets !== null && exitRunnerbets.length > 0) {
                  for (let index = 0; index < exitRunnerbets.length; index++) {
                    exitingVolume = exitingVolume + exitRunnerbets[index].clientBetDetails.stake;
                  }
  
                }
              }
  
              rate = backRate[i].re;
              // tslint:disable-next-line:max-line-length
              volumn = +((parseFloat(backRate[i].rv) * volumnData.mr) - (exitingVolume)).toFixed() <= 0 ? '0' : ((parseFloat(backRate[i].rv) * volumnData.mr) - (exitingVolume)).toFixed();
              marketDetail.appRemovalDate = backRate[i].rd;
              if (websiteSettings.data.IsRateWiseVolume && sport === excludeSport) {
                if (+rate > +websiteSettings.data.MaxRateForVolumeInto) {
                  volumn = (+volumn * (+websiteSettings.data.VolumeInto)).toString();
                }
              }
            }
            if (currentMarketVolumn.mt === FanceType.LineMarket) {
              marketDetail[`layRate${i + 1}`] = Math.round(+rate);;
              marketDetail[`totalLayAmount${i + 1}`] = volumn;
              if (!!rate) {
                marketRateForPosition = Math.round(+rate);
              }
            }else if (currentMarketVolumn.mt === FanceType.ManualOdds) {
              const y: number = +rate;
              var temp = y.toFixed(3);
              marketDetail[`backRate${i + 1}`] = temp.slice(-1) === '0' ? temp.slice(0, -1) : temp;
              marketDetail[`totalBackAmount${i + 1}`] = volumn;
            } else {
              marketDetail[`backRate${i + 1}`] = rate;
              marketDetail[`totalBackAmount${i + 1}`] = volumn;
            }
          } catch (ex) {
            console.log('Error in setmarketRunnerinformation vBackRate For Loop ' + ex);
          }
          try {
            let rate = '';
            let volumn = '';
            if (i < layRate.length) {
              let exitingVolume = 0;
              if (runnerBetsList != null && runnerBetsList !== undefined && runnerBetsList) {
                const exitRunnerbets = runnerBetsList.filter(value => {
                  return !value.clientBetDetails.isBack
                    && +value.clientBetDetails.rate === layRate[i].re;
                });
                if (exitRunnerbets !== undefined && exitRunnerbets !== null && exitRunnerbets.length > 0) {
                  for (let index = 0; index < exitRunnerbets.length; index++) {
                    exitingVolume = exitingVolume + exitRunnerbets[index].clientBetDetails.stake;
                  }
  
                }
              }
              rate = layRate[i].re;
              // tslint:disable-next-line:max-line-length
              volumn = +((parseFloat(layRate[i].rv) * volumnData.mr) - (exitingVolume)).toFixed() <= 0 ? '0' : ((parseFloat(layRate[i].rv) * volumnData.mr) - (exitingVolume)).toFixed();
              marketDetail.appRemovalDate = layRate[i].appRemovalDate;
              if (websiteSettings.data.IsRateWiseVolume && sport === excludeSport) {
                if (+rate > +websiteSettings.data.MaxRateForVolumeInto) {
                  volumn = (+volumn * (+websiteSettings.data.VolumeInto)).toString();
                }
              }
            }
            if (currentMarketVolumn.mt === FanceType.LineMarket) {
              marketDetail[`backRate${i + 1}`] = Math.round(+rate);;
              marketDetail[`totalBackAmount${i + 1}`] = volumn;
            } else if (currentMarketVolumn.mt === FanceType.ManualOdds) {
              const y: number = +rate;
              var temp = y.toFixed(3);
              marketDetail[`layRate${i + 1}`] = temp.slice(-1) === '0' ? temp.slice(0, -1) : temp;
              marketDetail[`totalLayAmount${i + 1}`] = volumn;
            } else {
              marketDetail[`layRate${i + 1}`] = rate;
              marketDetail[`totalLayAmount${i + 1}`] = volumn;
            }
  
  
          } catch (ex) {
            console.log('Error in setmarketRunnerinformation vLayRate For Loop ' + ex);
          }
  
        }
        marketDetail.marketSuspend = false;
        return marketDetail;
      }
    } else {
      marketDetail.marketSuspend = true;
      return marketDetail;
    }
  }
  betSlipConfiguation() {
    this.betService.getSelectedRunner$().subscribe(x => this.vSelectedRunner = x);
    this.betService.getStake$().pipe(takeUntil(this.notifier)).subscribe(bet => {
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
    this.betService.getOvelayStatus$().pipe(takeUntil(this.notifier)).subscribe(display => {
      this.displayOverlay = display;
    });
    this.betService.getBetId$().pipe(takeUntil(this.notifier)).subscribe(betid => {
      if (betid) {
        this.vBetId = betid;
      }
    });
  }
  placeBet(marketDetail: MarketDetail, rate: string, isBack: boolean, currentItem: string) {
    if(rate == ''){
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
  identify(index, item) {
    return item.betDetailId;
  }

  openLoginModel(){
    this.openPopup.emit();
  }

  ngOnDestroy() {
    this.notifier.next();
    this.notifier.complete();
  }

}
