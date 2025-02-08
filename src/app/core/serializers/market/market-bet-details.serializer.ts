import { BaseSerializer } from '@clientApp-core/serializers/base/base.serializer';
import * as fromMarketBet from '@clientApp-core/models/market/market-bet.model';
import { guid } from '@clientApp-core/utilities/app-util';


export class BetSerializer implements BaseSerializer {
  fromJson(data: any): fromMarketBet.MarketBet[] {
   const result = data.map( item => {
      const marketBet = new fromMarketBet.MarketBet();
      marketBet.Id = guid();
      const clientBetDetails = new fromMarketBet.ClientBetDetails();
      clientBetDetails.clientBetId = item.appClientBetID;
      clientBetDetails.betDetailId = item.appBetDetailID;
      clientBetDetails.betTitle = item.appBetTitle;
      clientBetDetails.rate = parseFloat(item.appRate).toFixed(2);
      clientBetDetails.stake = item.appStake;
      clientBetDetails.profit = item.appProfit;
      clientBetDetails.isBack = item.appIsBack;
      clientBetDetails.isMatched = item.appIsMatched;
      clientBetDetails.betID = item.appBetID;
      clientBetDetails.matchID = item.appMatchID;
      clientBetDetails.matchedDate = this.getDateintoString(item.appMatchedDate);
      marketBet.clientBetDetails = clientBetDetails;
      marketBet.matchID = item.appMatchID;
      marketBet.match = item.appMatch;
      marketBet.isMatched = item.appIsMatched;
    const betDetails = new fromMarketBet.BetDetails();
      betDetails.betTitle = item.appBetTitle;
      betDetails.createdDate = item.appCreatedDate;
      betDetails.betDetailId = item.appBetDetailID;
      betDetails.betName = item.appBetName;
      betDetails.clientBetId = item.appClientBetID;
      betDetails.matchedDate = item.appMatchedDate != null ? item.appMatchedDate : '-';
      betDetails.matchedTime = item.appMatchedTime != null ? item.appMatchedTime : '-';
      betDetails.rate = item.appRate;
      betDetails.stake =  item.appStake;
      betDetails.profit =  item.appProfit;
      betDetails.isBack =  item.appIsBack;
      betDetails.isMatched =  item.appIsMatched;
      betDetails.betID =  item.appBetID;
      betDetails.matchID = item.appMatchID;
      betDetails.isWager = false;

      if (item.appIsMatched) {
        marketBet.matchBets =  new fromMarketBet.Bet();
        marketBet.matchBets.betId = item.appBetID;
        marketBet.matchBets.betName = item.appBetName;
        marketBet.matchBets.betDetails = item.appIsMatched;
        marketBet.matchBets.betDetails = betDetails;
      } else {
        marketBet.unMatchBets =  new fromMarketBet.Bet();
        marketBet.unMatchBets.betId = item.appBetID;
        marketBet.unMatchBets.betName = item.appBetName;
        marketBet.unMatchBets.betDetails = item.appIsMatched;
        betDetails.isOverfolw = item.appIsOverfolw;
        betDetails.overflowMessage = item.appOverflowMessage;
        marketBet.unMatchBets.betDetails = betDetails;
      }
      return marketBet;
    });
    return result;
  }
  toJson(market: any): any {
    return {uniqueRequestId: guid(), ...market};
  }

  // set Date formate
  getDateintoString(pDate) {
  if (pDate != null) {
      // tslint:disable-next-line:radix
      const date = new Date(parseInt(pDate.substr(6)));
      // tslint:disable-next-line:max-line-length
      const formatted = ('0' + date.getDate()).slice(-2) + '-' + ('0' + (date.getMonth() + 1)).slice(-2) + '-' + date.getFullYear() + ' ' + ('0' + date.getHours()).slice(-2) + ':' + ('0' + date.getMinutes()).slice(-2) + ':' + ('0' + date.getSeconds()).slice(-2);
      return formatted;
  }
  return '';
}
}
