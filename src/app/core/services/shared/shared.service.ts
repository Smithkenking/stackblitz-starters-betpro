import { Injectable } from '@angular/core';
import { BetStatus } from '@clientApp-core/enums/market-bet-status.type';
import { FanceType } from '@clientApp-core/enums/market-fancy.type';
import { MarketStatus } from '@clientApp-core/enums/market-status.type';
import { EstimatedProfitLoss } from '@clientApp-core/models/bet/estimated-profit-loss.model';
import { Stake } from '@clientApp-core/models/bet/stake.model';
import { MarketBet } from '@clientApp-core/models/market/market-bet.model';
import { MarketRates } from '@clientApp-core/models/market/market-rates.model';
import { MarketRunner } from '@clientApp-core/models/market/market-runner.model';
import { GetSortOrder } from '@clientApp-core/utilities/app-configuration';
import { AppInjector } from 'app/app-injector';
import { websiteSettings } from '../authentication/authentication-facade.service';
import { BetFacadeService } from '../bet/bet.facade.service';
import { MarketFacadeService } from '../market/market-facade.service';
import { MarketType } from '../market/types/market';
import { MarketDetail } from '../market/types/market-detail';

@Injectable({
  providedIn: 'root'
})
export class SharedService {
  constructor() { }
}

export function getmarketProfitLoss(bets, betDetailId, currentBet) {
  let decLilbility = 0;
  try {

    bets = bets.filter(bet => bet.clientBetDetails.betID === currentBet.betId
      && getSomething(bet, currentBet));

    if (bets.length > 0) {
      bets.forEach(function (bet) {
        if ((bet.clientBetDetails.betDetailId === betDetailId)
          && (bet.clientBetDetails.isBack === true)
          && (bet.clientBetDetails.isMatched === true)) {
          decLilbility = decLilbility + (bet.clientBetDetails.profit);
        }
        if ((bet.clientBetDetails.betDetailId === betDetailId)
          && (bet.clientBetDetails.isBack === false)
          && (bet.clientBetDetails.isMatched === true)) {
          decLilbility = decLilbility - (bet.clientBetDetails.profit);
        }
        if ((bet.clientBetDetails.betDetailId !== betDetailId)
          && (bet.clientBetDetails.isBack === true)
          && (bet.clientBetDetails.isMatched === true)) {
          decLilbility = decLilbility - (bet.clientBetDetails.stake);
        }
        if ((bet.clientBetDetails.betDetailId !== betDetailId)
          && (bet.clientBetDetails.isBack === false)
          && (bet.clientBetDetails.isMatched === true)) {
          decLilbility = decLilbility + (bet.clientBetDetails.stake);
        }
      });
    }
  } catch (ex) {
    console.log('error getmarketPLLiability : ' + ex);
  }
  return decLilbility;
}
export function getSportsBookProfitLoss(bets, betDetailId, currentBet) {
  let decLilbility = 0;
  try {

    bets = bets.filter(bet => bet.clientBetDetails.betID === currentBet.betId
      && getSomething(bet, currentBet));

    if (bets.length > 0) {
      bets.forEach(function (bet) {
        if ((bet.clientBetDetails.betDetailId === betDetailId)
          && (bet.clientBetDetails.isBack === true)
          && (bet.clientBetDetails.isMatched === true)) {
          decLilbility = decLilbility + (bet.clientBetDetails.profit);
        }
      });
    }
  } catch (ex) {
    console.log('error getSportsBookProfitLoss : ' + ex);
  }
  return decLilbility;
}
export function getSportsBookLiability(bets, betDetailId, currentBet) {
  let decLilbility = 0;
  try {

    bets = bets.filter(bet => bet.clientBetDetails.betID === currentBet.betId
      && getSomething(bet, currentBet));

    if (bets.length > 0) {
      bets.forEach(function (bet) {
        if ((bet.clientBetDetails.betDetailId === betDetailId)
          && (bet.clientBetDetails.isBack === true)
          && (bet.clientBetDetails.isMatched === true)) {
            decLilbility = decLilbility - (bet.clientBetDetails.stake);
        }
      });
    }
  } catch (ex) {
    console.log('error getSportsBookLiability : ' + ex);
  }
  return decLilbility.toString();
}
function getSomething(allBets: any, currentBet: any): boolean {
  return allBets.hasOwnProperty('matchBets')
    ? allBets.matchBets.betId === currentBet.betId : allBets.unMatchBets.betId === currentBet.betId;
}

export function showMarketInformation(currentMarketVolumn: MarketRates, RunningMarket: any, betId: number) {
  const market = new MarketType();
  market.mt = currentMarketVolumn.mt;
  market.isInPlay = currentMarketVolumn.mi;
  market.isBetAllowed = currentMarketVolumn.mip ? (currentMarketVolumn.mip.toString().toLowerCase() === 'true' ?  true : false) : false;
  market.name = currentMarketVolumn.mn;
  market.totalAmount = RunningMarket?.tm ? RunningMarket.tm : '';
  market.minStake = currentMarketVolumn.mms && currentMarketVolumn.mms !== -1 ? currentMarketVolumn.mms.toString() : 'No Limit';
  market.maxStake = currentMarketVolumn.mxs && currentMarketVolumn.mxs !== -1 ? currentMarketVolumn.mxs.toString() : 'No Limit';
  market.maxProfit = currentMarketVolumn.mmp && currentMarketVolumn.mmp !== -1 ? currentMarketVolumn.mmp.toString() : 'No Limit';
  market.time = getDateTimeString(new Date());
  const eStatus = +currentMarketVolumn.ms;
  const iStatus = RunningMarket?.ms ? +RunningMarket.ms : 0;
  market.iStatus = iStatus;
  const cashoutMarketCategoryId = websiteSettings.data.cashoutMarketCategoryId;
  if(websiteSettings.data.isShowCashout && websiteSettings.data.isShowCashoutClient && currentMarketVolumn.mt == FanceType.Market && !cashoutMarketCategoryId.split(",").includes(currentMarketVolumn.mscd.toString())){
    market.isShowCashout = true;
  } else if(websiteSettings.data.isShowCashout_ManualOdds && websiteSettings.data.isShowCashoutClient && currentMarketVolumn.mt == FanceType.ManualOdds && !cashoutMarketCategoryId.split(",").includes(currentMarketVolumn.mscd.toString())) {
    market.isShowCashout = true;
  } else if(websiteSettings.data.isShowCashout_SportBook && websiteSettings.data.isShowCashoutClient && currentMarketVolumn.mt == FanceType.Virtual && !cashoutMarketCategoryId.split(",").includes(currentMarketVolumn.mscd.toString())){
    market.isShowCashout = true;
  }
  const user = JSON.parse(localStorage.getItem('token'));
  let marketStatusWise: boolean = false;
  if (user == null || user == undefined || user == '') {
    marketStatusWise = true;
  } else {
    marketStatusWise = websiteSettings.data.marketStatusWise ? websiteSettings.data.marketStatusWise : false;
  }
  market.overlayMessage = '';
  if ((marketStatusWise ? iStatus : eStatus) === MarketStatus.BallStart) {
    market.overlayMessage = 'Ball Start';
    market.isOverlayMessageVisible = true;
    closeBetSlip(betId);
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
    closeBetSlip(betId);
  } else if (iStatus === MarketStatus.BallStart && eStatus !== MarketStatus.Closed) {
    market.overlayMessage = 'Ball Start';
    market.isOverlayMessageVisible = true;
    closeBetSlip(betId);
  } else if (iStatus === MarketStatus.Suspended && eStatus !== BetStatus.Closed) {
    market.overlayMessage = 'Market Suspended';
    market.isOverlayMessageVisible = true;
    closeBetSlip(betId);
    if(currentMarketVolumn.mt === FanceType.Virtual){
      unPinMarket(currentMarketVolumn.eid);
      market.overlayMessage = 'Bet Closed';
    }
  } else if (iStatus === MarketStatus.Closed) {
    market.isInPlay = false;
    market.overlayMessage = 'Market close';
    closeBetSlip(betId);
    market.isOverlayMessageVisible = true;
    if(currentMarketVolumn.mt === FanceType.Virtual){
      removeManyMaket(currentMarketVolumn.eid)
    } else {
      removeMarket(betId);
    }
  } else if (iStatus === MarketStatus.InActive) {
    market.overlayMessage = 'Market Inactive';
    closeBetSlip(betId);
    market.isOverlayMessageVisible = true;
  } else if (iStatus === MarketStatus.Settled && eStatus !== BetStatus.Settled) {
    market.overlayMessage = 'Market Settled';
    market.isOverlayMessageVisible = true;
    market.isInPlay = false;
    closeBetSlip(betId);
    removeMarket(betId);
  } else if (iStatus === 0) {
    market.overlayMessage = '';
    market.isOverlayMessageVisible = true;
  } 
  return market;
}
function removeManyMaket(matchId: any) {
  const marketFacadeService = AppInjector.get(MarketFacadeService);
  marketFacadeService.removeManyMaket(matchId);
}
function unPinMarket(matchId: any) {
  const marketFacadeService = AppInjector.get(MarketFacadeService);
  marketFacadeService.removeVirtualMaket(matchId);
}
export function setMarketRunnerInformation(betDetail: MarketRunner,
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
  if (marketClientBets != null && marketClientBets !== undefined && marketClientBets) {
    runnerBetsList = marketClientBets.filter(clientBet => (clientBet.hasOwnProperty('matchBets')
      && clientBet.clientBetDetails.betDetailId === betDetail.rid));
    const currentBet = { betId: betId, betName: betDetail.mn };
    runnerProfitLoss = getmarketProfitLoss(marketClientBets, betDetail.rid, currentBet);
  }
  if(runnerBetsList.length > 0 && currentMarketVolumn.mt == FanceType.Sportbook){
    const currentBet = { betId: betId, betName: betDetail.mn };
    marketDetail.profitLoss = getSportsBookProfitLoss(runnerBetsList, betDetail.rid, currentBet);
    marketDetail.hdnProfitLoss = getSportsBookProfitLoss(runnerBetsList, betDetail.rid, currentBet);
    marketDetail.liability = getSportsBookLiability(runnerBetsList, betDetail.rid, currentBet);
    marketDetail.lblLiability = '';
    marketDetail.lblProfitLoss = '';
    if (calculatedProfitLoss != null && calculatedProfitLoss.length > 0) {
      // tslint:disable-next-line:max-line-length
      const filteredCalculatedProfitLoss = calculatedProfitLoss.filter(value => value.betId === betId && value.betDetailId === betDetail.rid);
      if (filteredCalculatedProfitLoss !== undefined && filteredCalculatedProfitLoss.length > 0) {
        marketDetail.lblProfitLoss = (marketDetail.hdnProfitLoss + filteredCalculatedProfitLoss[0].estimatedProfitLoss).toString();
        marketDetail.lblLiability = (+marketDetail.liability) + filteredCalculatedProfitLoss[0].liability; 
      } else {
        marketDetail.lblProfitLoss = '';
        marketDetail.lblLiability = '';
      }
    }
    if (marketDetail.profitLoss === +marketDetail.lblProfitLoss) {
      marketDetail.lblProfitLoss = '';
      marketDetail.lblLiability = '';
    }
  }  else if(runnerBetsList.length == 0 && currentMarketVolumn.mt == FanceType.Sportbook){
    marketDetail.profitLoss = 0;
    marketDetail.hdnProfitLoss = 0;
    marketDetail.lblProfitLoss = '';
    marketDetail.liability = 0;
    marketDetail.lblLiability = '';
    if (calculatedProfitLoss != null && calculatedProfitLoss.length > 0) {
      // tslint:disable-next-line:max-line-length
      const filteredCalculatedProfitLoss = calculatedProfitLoss.filter(value => value.betId === betId && value.betDetailId === betDetail.rid);
      if (filteredCalculatedProfitLoss !== undefined && filteredCalculatedProfitLoss.length > 0) {
        marketDetail.lblProfitLoss = (filteredCalculatedProfitLoss[0].estimatedProfitLoss).toString();
        marketDetail.lblLiability = (parseFloat(marketDetail.liability) - filteredCalculatedProfitLoss[0].liability).toString(); 
      }
    } else {
      marketDetail.lblProfitLoss = '';
      marketDetail.lblLiability = '';
    }
  } else {
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
      if (currentMarketVolumn.mt === FanceType.LineMarket) {
        marketDetail.position = setPosition(marketClientBets, Math.round(marketRateForPosition), betId)
      }
      marketDetail.marketSuspend = false;
      return marketDetail;
    }
  } else {
    marketDetail.marketSuspend = true;
    return marketDetail;
  }
}
export function getRunnerById(marketRunner: MarketRunner[], betId: number, matchId: number) {
  return marketRunner.filter(x => x.mid == betId && x.eid == matchId);
}
export function setRateBoxTemp(betDetail: MarketRunner) {
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
function getDateTimeString(ed) {
  // tslint:disable-next-line:max-line-length
  const strDateTime = [getFormattedDatePart(ed.getDate()), '-', getFormattedDatePart(ed.getMonth() + 1), '-', getFormattedDatePart(ed.getFullYear()), ' ', getFormattedDatePart(ed.getHours()), ':', getFormattedDatePart(ed.getMinutes()), ':', getFormattedDatePart(ed.getSeconds()), ':', getFormattedDatePart(ed.getMilliseconds())].join('');
  return strDateTime;
}
function getFormattedDatePart(num) {
  return num < 10 ? '0' + num.toString() : num;
}
function closeBetSlip(betId: any) {
  const betService = AppInjector.get(BetFacadeService);
  const stake = new Stake();
  stake.closeMe = true;
  stake.betId = betId;
  betService.setStake().next(stake);
}
function removeMarket(betId: any) {
  const marketFacadeService = AppInjector.get(MarketFacadeService);
  marketFacadeService.removeMaket(betId);
}
function setPosition(marketClientBets: MarketBet[], rateParam: any, betId: number): any {
  let clientsBets: any = [];
  if (marketClientBets != null && marketClientBets !== undefined && marketClientBets.length > 0) {
    clientsBets = marketClientBets.filter(bet => bet.clientBetDetails.betID === betId);
  }
  if (clientsBets.length > 0) {
    const rate = rateParam;
    const sessionRateList = [];
    for (let i = rate - 5; i < rate + 5; i++) {
      sessionRateList.push({
        'appRate': String(Math.round(i)),
        'appPL': clientsBets.length > 0 ? setPlByRate(i, clientsBets) : 0
      });
    }
    return sessionRateList.sort(GetSortOrder('appRate'));
  }
  return null;
}
function setPlByRate(winnerRate, bets): any {
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
export function getBetsAverageOdds(myBets: any, selectedMarkets: any) {
  const runnerList = [];
  const runnerBetList = [];
  myBets.forEach(matchBet => {
    if (matchBet['betDetails'] && matchBet['betDetails'].length > 0) {
      matchBet['betDetails'].forEach(record => {
        record['active'] = true;
        if (record['details'] && record['details'].length > 0) {
          record['details'].forEach(element => {
            const currentObj = selectedMarkets.find(x => x.mid === element.matchBets.betId);
            if (currentObj && currentObj.mt === FanceType.Market && element.matchBets.betDetails) {
              record['active'] = false;
              const uniqId = element.matchBets.betDetails.betTitle + element.matchBets.betDetails.isBack;
              if (!runnerList.includes(uniqId)) {
                runnerList.push(uniqId);
                runnerBetList.push({ id: uniqId, data: [element] });
              } else {
                const ind = runnerList.indexOf(uniqId);
                runnerBetList[ind].data.push(element);
              }
            }
          });
        }
      });
    }
  });
  return runnerBetList;
}
