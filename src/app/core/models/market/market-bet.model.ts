
export class MarketBet {
    Id: string;
    isWager?: boolean;
    matchID: number;
    match: any;
    isMatched: Boolean;
    matchBets: Bet;
    unMatchBets: Bet;
    clientBetDetails: ClientBetDetails;
  }
  export class Bet {
    betId: number;
    betName: string;
    isMatched: boolean;
    betDetails: BetDetails;
  }
  export class BetDetails {
    betTitle: string;
    betName: string;
    clientBetId: number;
    matchedDate: string;
    matchedTime: string;
    rate: number;
    stake: number;
    profit: number;
    isBack: boolean;
    isMatched:  boolean;
    betID: number;
    betDetailId: number;
    matchID: number;
    isOverfolw: any;
    overflowMessage: any;
    createdDate: string;
    isWager?: boolean;
  }

  export class ClientBetDetails {
    clientBetId: number;
    betDetailId: number;
    betTitle: string;
    rate: string;
    stake: any;
    profit: any;
    isBack: boolean;
    isMatched: boolean;
    betID: number;
    matchID: number;
    matchedDate: string;
  }
