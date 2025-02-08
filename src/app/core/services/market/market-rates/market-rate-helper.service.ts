import { BaseRequest } from '@clientApp-core/models/base/base-request.model';
import { ActiveMarket } from '@clientApp-core/models/market/activemarket.model';

export class MatchRequest implements BaseRequest<any> {
    constructor(public body: any, public queryParameter: any, public endPoint: string, public baseUrl: string = null) {}
 }
export function mapCurrentMarketRequest(marketList: ActiveMarket[]): BaseRequest<any> {
    const betIds = marketList.map((market) => market.mid).join(',');
    const body = { betIds: betIds};
    const request = new MatchRequest(body, {}, 'api/Market/Notification/Information');
    return request;
}

export function mapBetRequest(marketList: ActiveMarket[], betId?: any): BaseRequest<any> {
    let betIds;
    if (betId) {
        betIds = betId.toString();
    } else {
        betIds = marketList.map((market) => market.mid).join(',');
    }
    const body = { betIds: betIds,
                   matchBetCount: 0,
                   betCount: 0,
                   overFlowCount: 0,
                   IsLoad: true
                 };
    const request = new MatchRequest(body, {}, 'api/Bet/Matched/List');
    return request;
}
export function mapWagerBetRequest(marketList: ActiveMarket[], betId?: any): BaseRequest<any> {
    let betIds;
    if (betId) {
        betIds = betId.toString();
    } else {
        betIds = marketList.map((market) => market.mid).join(',');
    }
    const body = { betIds: betIds,
                   matchBetCount: 0,
                   betCount: 0,
                   overFlowCount: 0,
                   IsLoad: true
                 };
    const request = new MatchRequest(body, {}, 'api/Bet/Matched/ListWager');
    return request;
}

