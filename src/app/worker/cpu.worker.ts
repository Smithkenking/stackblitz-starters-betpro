/// <reference lib="webworker" />

import { MarketDetail } from "@clientApp-core/services/market/types/market-detail";
import { GetSortOrder } from "@clientApp-core/utilities/app-configuration";

function setDashboardMarketRunnerInformation(runningMarket: any) {
  const marketDetails: MarketDetail[] = [];
  const marketRates = [];
  if (runningMarket !== undefined && runningMarket !== null
    && !!runningMarket.rt && runningMarket.rt.length > 0) {
    const mapSelectionBFIds = runningMarket.rt.map(match => match.si);
    const selectionBFIds = mapSelectionBFIds.filter((x, i, a) => a.indexOf(x) == i);
    const runner1Rates = (runningMarket.rt).filter(rate => rate.si === selectionBFIds[0]);
    const runner2Rates = (runningMarket.rt).filter(rate => rate.si === selectionBFIds[1]);
    const runner3Rates = (runningMarket.rt).filter(rate => rate.si === selectionBFIds[2]);
    if (runner1Rates && runner1Rates.length > 0) {
      marketRates.push(runner1Rates);
    }
    if (runner2Rates && runner2Rates.length > 0) {
      marketRates.push(runner2Rates);
    }
    if (runner3Rates && runner3Rates.length > 0) {
      marketRates.push(runner3Rates);
    }
  }
  if (marketRates !== undefined && marketRates.length > 0) {
    marketRates.forEach(marketRate => {
      const backRate = marketRate.filter(function (value) { return value.ib === true});
      const layRate = marketRate.filter(function (value) { return value.ib === false});
      const marketDetail = new MarketDetail();
      if (backRate.length > 0 || layRate.length > 0) {
        backRate.sort(GetSortOrder('re')).reverse();
        layRate.sort(GetSortOrder('re'));

        for (let i = 0; i < 3; i++) {
          try {
            let rate = '';
            let volumn = '';
            if (i < backRate.length) {
              rate = backRate[i].re;
              volumn = backRate[i].rv;
            }
            marketDetail[`backRate${i + 1}`] = +rate === 0 ? '' : rate;
            marketDetail[`totalBackAmount${i + 1}`] = +volumn === 0 ? '' : volumn;

          } catch (ex) {
            console.log('Error in setmarketRunnerinformation vBackRate For Loop - Dashboard' + ex);
          }
          try {
            let rate = '';
            let volumn = '';
            if (i < layRate.length) {
              rate = layRate[i].re;
              volumn = layRate[i].rv;
            }
            marketDetail[`layRate${i + 1}`] = +rate === 0 ? '' : rate;
            marketDetail[`totalLayAmount${i + 1}`] = +volumn === 0 ? '' : volumn;

          } catch (ex) {
            console.log('Error in setmarketRunnerinformation vLayRate For Loop - Dashboard ' + ex);
          }
        }
        marketDetails.push(marketDetail);
      }
    });
    return marketDetails;
  } else {
    return marketDetails;
  }
}
addEventListener('message', ({ data }) => {
  const runningMarket = data;
  const marketDetail = setDashboardMarketRunnerInformation(runningMarket);
  postMessage({marketDetail:marketDetail,mi:runningMarket.mi});
});
