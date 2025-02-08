import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { AudioType } from '@clientApp-core/enums/audio.types';
import { FanceType } from '@clientApp-core/enums/market-fancy.type';
import { MarketStatus } from '@clientApp-core/enums/market-status.type';
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
import { getmarketProfitLoss, getRunnerById, setMarketRunnerInformation, setRateBoxTemp } from '@clientApp-core/services/shared/shared.service';
import { untilDestroyed } from 'ngx-take-until-destroy';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: '[app-sportbook-bet-details]',
  templateUrl: './sportbook-bet-details.component.html',
  styleUrls: ['./sportbook-bet-details.component.scss']
})
export class SportbookBetDetailsComponent implements OnInit, OnDestroy {
  @Input() matchId: number;
  @Input() marketType: string;
  @Input() betId: number;
  @Input() marketRunner: MarketRunner[];
  @Input() currentMarketVolumns: MarketRates[];
  @Input() market: MarketType;
  currentMarketVolumn: Partial<MarketRates>;
  marketRunners: MarketRunner[];
  marketClientBets: MarketBet[] = [];
  marketDetails: MarketDetail[] = [];
  calculatedProfitLoss: EstimatedProfitLoss[] = [];
  vBet: Stake;
  vIsBack: boolean;
  vSelectedRunner = '';
  currSeleItem: string;
  currSelectedItem: string;
  isShowPlaceBetCounter: boolean = false;
  loaderPath: any;
  notifier = new Subject();
  togglePanelView: boolean;
  vBetId: number;
  isShowBetSlipBelowRunner: boolean;
  displayOverlay: boolean;
  constructor(private marketRateFacadeService: MarketRateFacadeService,
    public betService: BetFacadeService, public commonService: CommonService,
    private toastr: ToastrService) { }

  ngOnInit(): void {
    this.setmatkettemplate();
    this.subscribeStore();
    this.isShowPlaceBetCounter = websiteSettings.data.isShowPlaceBetCounter;
    this.loaderPath = apiEndPointData.data.loaderPath;
    this.betService.getEstimatedProfitLoss().pipe((takeUntil(this.notifier),untilDestroyed(this))).subscribe((profitLoss) => {
      if (profitLoss != null) {
        if (this.betId === profitLoss[0]?.betId) {
          this.calculatedProfitLoss = profitLoss;
        }
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
    this.isShowBetSlipBelowRunner = websiteSettings.data.isShowBetSlipBelowRunner;
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
    this.marketRateFacadeService.getMarketClientBetList$().pipe(takeUntil(this.notifier),untilDestroyed(this)).subscribe(marketClientBets => {
      this.marketClientBets = marketClientBets.filter(bet =>
        bet.clientBetDetails.matchID === this.matchId
        && bet.clientBetDetails.betID === this.betId);
      this.resetProfitandLoss();
      if (websiteSettings.data.isShowCashout_SportBook && this.currentMarketVolumn.mt == FanceType.Virtual &&
        this.marketDetails !== undefined) {
          this.getnewCashout();
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
          if (websiteSettings.data.isShowCashout_SportBook && this.currentMarketVolumn.mt == FanceType.Virtual && runningMarket && runningMarket.rt && runningMarket.rt !== '' &&
        runningMarket.rt !== null && runningMarket.rt !== undefined &&
        this.marketDetails !== undefined && +runningMarket.ms == MarketStatus.Open) {
          this.getnewCashout();
        }
        }
      }
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
  resetProfitandLoss() {
    try {
      let runnerBetsList: MarketBet[] = [];
      let runnerProfitLoss = 0.00;
      this.marketDetails.forEach(marketDetail => {
        if (this.marketClientBets != null && this.marketClientBets !== undefined && this.marketClientBets) {
          runnerBetsList = this.marketClientBets.filter(clientBet => (clientBet.hasOwnProperty('matchBets')
            && clientBet.clientBetDetails.betDetailId === marketDetail.betDetailId));
          const currentBet = { betId: this.betId, betName: marketDetail.betTitle };
          runnerProfitLoss = getmarketProfitLoss(this.marketClientBets, marketDetail.betDetailId, currentBet);
          marketDetail.profitLoss = isNaN(runnerProfitLoss) ? 0 : runnerProfitLoss;
          const vDifferentPL = +marketDetail.lblProfitLoss - marketDetail.hdnProfitLoss;
          if (this.calculatedProfitLoss != null && this.calculatedProfitLoss.length > 0) {
            // tslint:disable-next-line:max-line-length
            const filteredCalculatedProfitLoss = this.calculatedProfitLoss.filter(value => value.betId === this.betId && value.betDetailId === marketDetail.betDetailId);
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
        }
      });
    } catch (ex) {
      console.log('error:=' + ex);
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
  // new keshav sir cashout 
  getnewCashout() {
    let casoutData = [], runners = [], orders = [];
    const marketDetails = this.marketDetails.forEach((betDetail: any) => {
      let runnerBetsList: MarketBet[] = [], backOrders = [], layOrders = [];
      if (this.marketClientBets != null && this.marketClientBets !== undefined && this.marketClientBets) {
        runnerBetsList = this.marketClientBets.filter(clientBet => (clientBet.hasOwnProperty('matchBets')
          && clientBet.clientBetDetails.betDetailId === betDetail.betDetailId));
        const exitRunnerbetsBack = runnerBetsList.filter(value => {
          return value.clientBetDetails.isBack;
        });
        if (exitRunnerbetsBack !== undefined && exitRunnerbetsBack !== null && exitRunnerbetsBack.length > 0) {
          for (let index = 0; index < exitRunnerbetsBack.length; index++) {
            orders.push(
              {
                betdetailid: betDetail.betDetailId,
                stake: exitRunnerbetsBack[index].clientBetDetails.stake,
                odd: +exitRunnerbetsBack[index].clientBetDetails.rate,
                profit: exitRunnerbetsBack[index].clientBetDetails.profit,
                isback: true
              });
          }
        }
        const exitRunnerbetsLay = runnerBetsList.filter(value => {
          return !value.clientBetDetails.isBack;
        });
        if (exitRunnerbetsLay !== undefined && exitRunnerbetsLay !== null && exitRunnerbetsLay.length > 0) {
          for (let index = 0; index < exitRunnerbetsLay.length; index++) {
            orders.push(
              {
                betdetailid: betDetail.betDetailId,
                stake: exitRunnerbetsLay[index].clientBetDetails.stake,
                odd: +exitRunnerbetsLay[index].clientBetDetails.rate,
                profit: exitRunnerbetsLay[index].clientBetDetails.profit,
                isback: false
              })
          }
        }
      }
      runners.push({
        betdetailid: betDetail.betDetailId,
        currentOdd: { back: +betDetail.backRate1, lay: +betDetail.layRate1 }
      },)
    });
    var marketData = {
      markerid: this.betId,
      runners: runners,
      orders: orders,
    };
    this.hedgeRunners(marketData, 1);
  }
  hedgeRunners(vmarketData, vCashoutPer) {
    let marketData: any = this.libilitycheck(vmarketData, true);
    var isShow = false, self = this;
    marketData.runners.map(function (vruner) {
      var vresult = self.newhedgeRunner(vruner, vCashoutPer);
      if (vresult != null && vresult.canHedge) {
        isShow = true;
        var tempback = vresult.hedgeSide == 'BACK' ? true : false;
        marketData.orders.push({ betdetailid: vruner.betdetailid, stake: vresult.hedgeStake, odd: vresult.odd, isback: tempback, profit : parseFloat(( (vresult.odd-1)* vresult.hedgeStake).toFixed(2)),iscashoutbet: 1, ts: vresult.hedgeTotalStake });
      }
    });
    marketData = this.libilitycheck(marketData, false);
    var vTotalCount= marketData.orders.filter(function(vinfo){return vinfo.iscashoutbet==1 ; });
    var vCount= marketData.orders.filter(function(vinfo){return vinfo.iscashoutbet==1  && vinfo.stake>=1 && vinfo.odd >=1.01  ; });
    
    var vLibility=0;
    if(isShow)
    {
      if(!vTotalCount.length ==vCount.length)
      {
      isShow=false;
      }
      else
      {
      if(parseFloat( marketData.libility)<0)
      {
        if(parseFloat( marketData.newlibility)<0 && parseFloat( marketData.libility) <=parseFloat( marketData.newlibility) )
        {
          vLibility=parseFloat( marketData.newlibility);
        }
        else  if(parseFloat( marketData.libility) <=parseFloat( marketData.newlibility) && parseFloat( marketData.newprofit)>0 && parseFloat( marketData.newprofit) <=parseFloat( marketData.profit))
        {
          vLibility=parseFloat( marketData.newprofit);
        }
        else
        {
          isShow=false;
        }
      }
      else if(parseFloat( marketData.profit)>parseFloat( marketData.newprofit))
      {
        isShow=true;
      }
      else
        {
          isShow=false;
        }
      }
    }
    
      var vCashout={
        ShowCashout:isShow,
        markerid : marketData.markerid,
        libility:vLibility,
        order:marketData.orders.filter(function(vinfo){return vinfo.iscashoutbet==1; })};
    // console.log(JSON.stringify(vCashout));
    this.marketRateFacadeService.setMarketCashout1().next(vCashout);
  }
  newhedgeRunner(runner, percentageToHedge) {
    var bPl = runner.backompressOrders.totalprofit;
    var lPl = runner.laycompressOrders.totalprofit
    var hedgeSide = lPl > bPl ? 'BACK' : 'LAY';
    var sideIsLay = hedgeSide === 'LAY';
    var co = sideIsLay ? runner.currentOdd.lay : runner.currentOdd.back;
    var a1 = sideIsLay ? bPl : lPl;
    var a2 = sideIsLay ? lPl : bPl;
    const hedgetotal: any = ((a1 - a2) / co).toFixed(2);
    const hedgeS = (hedgetotal * percentageToHedge).toFixed(2);
    return {
      canHedge: +hedgeS > 0 ? true : false,
      odd: +co,
      hedgeSide: hedgeSide,
      hedgeStake: +hedgeS,
      hedgeTotalStake: +hedgetotal
    };
  };
  libilitycheck(marketData, isold) {
    const self = this;
    marketData.runners.map(function (vrunners) {
      vrunners.backompressOrders = self.newcompressOrders(marketData.orders.filter(function (vinfo) { return vinfo.betdetailid == vrunners.betdetailid && vinfo.isback == true; }));
      vrunners.laycompressOrders = self.newcompressOrders(marketData.orders.filter(function (vinfo) { return vinfo.betdetailid == vrunners.betdetailid && vinfo.isback == false; }));
    });
    var _loss = 0;
    var _profit = 0;
    marketData.runners.map(function (vrunners) {
      var matchedLiability = 0;
      // vrunners.backompressOrders.stake-vrunners.laycompressOrders.profit;
      if (vrunners.backompressOrders != undefined && vrunners.backompressOrders != null) {
        // matchedLiability += sumByKey(vrunners.backompressOrders,"profit");
        matchedLiability += vrunners.backompressOrders.profit;
      }
      if (vrunners.laycompressOrders != undefined && vrunners.laycompressOrders != null) {
        // matchedLiability -=sumByKey(vrunners.laycompressOrders,"profit");
        matchedLiability -= vrunners.laycompressOrders.profit;
      }
      var _OtherServer = marketData.runners.filter(function (value) { return value.betdetailid != vrunners.betdetailid });
      if (_OtherServer != undefined && _OtherServer != null) {
        for (var i = 0; i < _OtherServer.length; i++) {
          matchedLiability -= _OtherServer[i].backompressOrders.stake;
          matchedLiability += _OtherServer[i].laycompressOrders.stake;
          // matchedLiability -= sumByKey(_OtherServer[i].backompressOrders,"stake");
          // matchedLiability += sumByKey(_OtherServer[i].laycompressOrders,"stake");
        }
      }
      matchedLiability=parseFloat(matchedLiability.toFixed(2));
      if (matchedLiability <_loss)
      {
        _loss=matchedLiability  ;
      }
      if (_profit==0 && matchedLiability > _profit )
      {
        _profit=matchedLiability ;
      }
      else if (matchedLiability >0 && matchedLiability < _profit )
      {
        _profit=matchedLiability ;
      }
    });
    if (isold) {
      marketData.libility = _loss;
      marketData.profit = _profit;
    }
    else {
      marketData.newlibility = _loss;
      marketData.newprofit = _profit;
    }
    return marketData;
  }
  newcompressOrders(orders) {
    const result = orders.reduce(this.sumOrders, { stake: 0, odd: 0 , profit: 0 });
    // return { ...result, odd:result.odd ==0?0: result.odd / orders.length };
    var vodds=result.odd ==0?0: parseFloat((result.odd / orders.length).toFixed(2));
    return {
      odd:vodds,
      stake: parseFloat(result.stake.toFixed(2)),
      profit: parseFloat(result.profit.toFixed(2)),
      totalprofit: parseFloat((vodds*result.stake).toFixed(2))
    }
  }
  sumOrders(acc, next) {
    return ({
      stake: acc.stake + next.stake,
      odd: acc.odd + next.odd,
      profit :acc.profit + next.profit, 
    });
  };
  // end new keshav sir cashout 
  ngOnDestroy() {
    this.betService.sendEstimatedProfitLoss().next([]);
    this.notifier.next();
    this.notifier.complete();
  }

}
