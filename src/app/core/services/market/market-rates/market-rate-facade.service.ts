
import { Injectable } from '@angular/core';
import { Observable, Subject, ReplaySubject, throwError, BehaviorSubject } from 'rxjs';
import { take, catchError, map } from 'rxjs/operators';
import { Store, select } from '@ngrx/store';
import { MarketRateService } from './market-rate.service';
import { Match } from '@clientApp-core/models/market/match.model';
import { SessionService } from '@clientApp-core/services/session/session.service';
import { ParkBetState } from '@clientApp-store/store.state';
import * as fromMarketRate from './market-rate-helper.service';
import { MarketRates } from '@clientApp-core/models/market/market-rates.model';
import { BetSerializer } from '@clientApp-core/serializers/market/market-bet-details.serializer';
import { MarketBet } from '@clientApp-core/models/market/market-bet.model';
import { StoreService } from '@clientApp-core/services/store/store.service';
import * as fromSelectedMarket from '@clientApp-store/selected-market/selectors/selected-market.selectors';
import { MarketFacadeService } from '@clientApp-core/services/market/market-facade.service';
import { AuthFacadeService, getBlockedMarketData } from '@clientApp-core/services/authentication/authentication-facade.service';
import { MarketRunner } from '@clientApp-core/models/market/market-runner.model';
import { MarketCashout } from '@clientApp-core/models/market/market-cashout.model';
import { AudioType } from '@clientApp-core/enums/audio.types';
import { HttpClient } from '@angular/common/http';
import { apiEndPointData } from '@clientApp-core/services/config/connfig.service';
import { ActiveMarket } from '@clientApp-core/models/market/activemarket.model';
import { WagerBetSerializer } from '@clientApp-core/serializers/market/market-wager-bet-details.serializer';
import { EventType, GameType } from '@clientApp-core/enums/market-fancy.type';
import {  Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class MarketRateFacadeService {

  private _matchSubject = new Subject<any>();
  private _runningDashboardMarketSubject = new ReplaySubject();
  private _runningMarketSubject = new ReplaySubject();
  private _centralScoreSubject = new ReplaySubject(1);
  private _shortScoreSubject = new ReplaySubject(1);
  private _adhocMatchSubject = new Subject<any>();
  private _marketCommentarySubject = new Subject<any>();
  private _marketBetListSubject = new Subject<any>();
  private _currentMarketSubject = new Subject<any>();
  private _matchWiseMarketSubject = new Subject<any>();
  private _currentMarketVolumeSubject = new BehaviorSubject<any>(null);
  private  _marketBetAllowChanges = new Subject<any>();
  private  _marketRateVolumeChanges = new Subject<any>();
  private  _inPlayChanges = new Subject<any>();
  private  _marketStatusChanges = new Subject<any>();
  private  _multiMatchWiseInfo = new Subject<any>();
  private _marketCashoutSubject = new BehaviorSubject<any>(null);
  private _marketCashout1Subject = new BehaviorSubject<any>(null);
  private _placedBetCashoutSubject = new Subject<any>();
  private _placedBetNewCashoutSubject = new Subject<any>();
  private _matchBetCountSubject = new Subject<number>();
  private _unMatchBetCountSubject = new Subject<number>();
  private _setAudioTypeSubject = new Subject<AudioType>();
  private _addNewMarketSubject = new Subject<any>();
  private _addNewDashboardMarketSubject = new Subject<any>();
  private _clientLimitChangesSubject = new Subject<any>();
  private _marketLimitChangesSubject = new Subject<any>();
  private _getBetListSubject = new Subject<any>();
  private _getMarketClientBetListSubject = new Subject<any>();
  private _deleteBetListSubject = new Subject<any>();
  private _marketNewsChangesSubject = new ReplaySubject(1);
  private _ewclChangesSubject = new Subject<any>();
  private _mwclLimitChangesSubject = new Subject<any>();
  private _balanceSubject = new Subject<any>();
  private _liabilitySubject = new Subject<any>();
  private _walletSubject = new Subject<any>();
  private _notificationSubject = new Subject<any>();
  private _depositStatusSubject = new Subject<any>();
  private _eventDateChangeSubject = new Subject<any>();
  private _marketDateChangeSubject = new Subject<any>();
  multimarket$ = new Subject<any>();
  curMatchInfo: Match[] = [];
  curMarketsVol: MarketRates[] = [];
  curMarketsRate: MarketRates[] = [];
  curMarketsRunners: MarketRunner[] = [];
  marketCashout: MarketCashout[] = [];
  marketNewCashout: any[] = [];
  marketScore: any[] = [];
  clientLimit: any = [];

  constructor(private httpClient: HttpClient,private marketRateService: MarketRateService
    , private marketFacadeService: MarketFacadeService
    , private sessionService: SessionService
    , private store: Store<ParkBetState>
    , private _authService: AuthFacadeService
    , private storeService: StoreService,public router: Router) {
    this.init();
  }
  eventDateChangeStatus$(): Observable<any> {
    return this._eventDateChangeSubject.asObservable();
  }
  marketDateChange$(): Observable<any> {
    return this._marketDateChangeSubject.asObservable();
  }
  getAddNewDashboardMarketInfo$(): Observable<any> {
    return this._addNewDashboardMarketSubject.asObservable();
  }
  getdepositRequestStatus$(): Observable<any> {
    return this._depositStatusSubject.asObservable();
  }
  getewclChanges$(): Observable<any> {
    return this._ewclChangesSubject.asObservable();
  }
  getmwclChanges$(): Observable<any> {
    return this._mwclLimitChangesSubject.asObservable();
  }
  getClientLimitChanges$(): Observable<any> {
    return this._clientLimitChangesSubject.asObservable();
  }
  getMarketLimitChanges$(): Observable<any> {
    return this._marketLimitChangesSubject.asObservable();
  }
  getBetList$(): Observable<any> {
    return this._getBetListSubject.asObservable();
  }
  deleteBetList$(): Observable<any> {
    return this._deleteBetListSubject.asObservable();
  }
  setMarketClientBetList(): Subject<any> {
    return this._getMarketClientBetListSubject;
  }
  getMarketClientBetList$(): Observable<any> {
    return this._getMarketClientBetListSubject.asObservable();
  }
  getMarketBetAllowChanges$(): Observable<any> {
    return this._marketBetAllowChanges.asObservable();
  }
  getMarketRateVolumeChanges$(): Observable<any> {
    return this._marketRateVolumeChanges.asObservable();
  }
  getMultiMatchWiseInfo$(): Observable<any> {
    return this._multiMatchWiseInfo.asObservable();
  }
  getInPlayChanges$(): Observable<any> {
    return this._inPlayChanges.asObservable();
  }
  getMarketStatusChanges$(): Observable<any> {
    return this._marketStatusChanges.asObservable();
  }
  getRunningDashboardMarketDetail$(): Observable<any> {
    return this._runningDashboardMarketSubject.asObservable();
  }
  getRunningMarketDetail$(): Observable<any> {
    return this._runningMarketSubject.asObservable();
  }
  getAddNewMarketInfo$(): Observable<any> {
    return this._addNewMarketSubject.asObservable();
  }
  getAdhocMatchInfo$(): Observable<any> {
    return this._adhocMatchSubject.asObservable();
  }

  getMatchInfo$(): Observable<Match> {
    return this._matchSubject.asObservable();
  }

  getCurrentMarketVolume$(): Observable<MarketRates[]> {
    return this._currentMarketVolumeSubject.asObservable();
  }

  getMatchWiseMarket$(matchId: number): Observable<any> {
    this.MatchWiseMarketRequest(matchId);
    return this._matchWiseMarketSubject.asObservable();
  }
  getBetInfo$(): Observable<MarketBet[]> {
    return this._marketBetListSubject.asObservable();
  }

  getCurrentMarket$(): Observable<MarketRates[]> {
    return this._currentMarketSubject.asObservable();
  }
  getMarketCashout(): Observable<MarketCashout> {
    return this._marketCashoutSubject.asObservable();
  }

  setMarketCashout(): BehaviorSubject<MarketCashout> {
    return this._marketCashoutSubject;
  }
  getMarketCashout1(): Observable<any> {
    return this._marketCashout1Subject.asObservable();
  }

  setMarketCashout1(): BehaviorSubject<any> {
    return this._marketCashout1Subject;
  }
  getMatchBetCount$(): Observable<number>  {
    return this._matchBetCountSubject.asObservable();
  }
  setMatchBetCount(): Subject<number>  {
      return this._matchBetCountSubject;
  }
  getUnMatchBetCount$(): Observable<number>  {
    return this._unMatchBetCountSubject.asObservable();
  }
  setUnMatchBetCount(): Subject<number>  {
      return this._unMatchBetCountSubject;
  }
  getAudioType$(): Observable<AudioType> {
    return this._setAudioTypeSubject.asObservable();
  }
  setAudioType(): Subject<AudioType> {
      return this._setAudioTypeSubject;
  }
  getMarketNewsChanges$(): Observable<any> {
    return this._marketNewsChangesSubject.asObservable();
  }
  getBalance$(): Observable<any> {
    return this._balanceSubject.asObservable();
  }
  getLiability$(): Observable<any> {
    return this._liabilitySubject.asObservable();
  }
  getWallet$(): Observable<any> {
    return this._walletSubject.asObservable();
  }
  getNotificationFromSignalr$(): Observable<any> {
    return this._notificationSubject.asObservable();
  }
  getMultiMarketDetail$(): Observable<any> {
    return this.multimarket$.asObservable();
  }
  getshortScoreDetail$(): Observable<any> {
    return this._shortScoreSubject.asObservable();
  }
  MatchWiseMarketRequest(matchId: number): Observable<any> {
    return this.httpClient
     .post(apiEndPointData.data.cau + 'api/Market/GetEventWiseMarketInfo',{"matchId": matchId })
     .pipe(map((data: any) => { return data.result }),catchError(err => throwError(err)));
  }
  GetEventWiseMarketInfoMultipleRequest(matchIds: string): Observable<any> {
    return this.httpClient
     .post(apiEndPointData.data.cau + 'api/Market/GetEventWiseMarketInfoMultiple',{"matchIds": matchIds })
     .pipe(map((data: any) => { return data.result }),catchError(err => throwError(err)));
  }

   currentMarket() {
    const markets = this.getSelectedMarket();
    const betIds = markets.map((market) => market.mid).join(',');
    const body = { betIds: betIds};
    return this.httpClient
    .post(apiEndPointData.data.cau + 'api/Market/Notification/Information', body)
    .pipe(catchError(err => throwError(err)))
    .subscribe((currentMarket) => {
      this._currentMarketSubject.next(currentMarket);
      this._currentMarketVolumeSubject.next(currentMarket);
    }, err => console.log('currentMarketRequest', err));
  }

  getBetInfo(betId?: any) {
    const betRequest = fromMarketRate.mapBetRequest(this.getSelectedMarket(),betId);
    const betSerializer = new BetSerializer();
    return this.marketRateService
    .post<any, MarketBet[]>(betRequest, betSerializer)
    .pipe(catchError(err => throwError(err)))
    .subscribe((betInfo) => this._marketBetListSubject.next(betInfo), err => console.log('MarketBetInfo', err));
  }
  getWagerBetInfo(betId?: any) {
    const betRequest = fromMarketRate.mapWagerBetRequest(this.getSelectedMarket(),betId);
    const betSerializer = new WagerBetSerializer();
    return this.marketRateService
    .post<any, MarketBet[]>(betRequest, betSerializer)
    .pipe(catchError(err => throwError(err)))
    .subscribe((betInfo) => this._marketBetListSubject.next(betInfo), err => console.log('getWagerBetInfo', err));
  }
  getAllBetList() {
    return this.httpClient
     .post(apiEndPointData.data.cau + 'api/Market/GetAllBetList', {})
     .pipe(map((data: any) => { return data.result }), catchError(err => { return throwError(err) }));
  }
  getAllBetListWager() {
    return this.httpClient
     .post(apiEndPointData.data.cau + 'api/Market/GetAllBetListWager', {})
     .pipe(map((data: any) => { return data.result }), catchError(err => { return throwError(err) }));
  }
  checkCurrentLogin() {
    this._authService.IsAuthorized$().pipe(take(1)).subscribe((data:any) => {
      if (data.isAuthorized) {
        if (data.isNewToken) {
          const user = JSON.parse(localStorage.getItem('token'));
          if (user != null) {
           user.access_token = data.token;
           user.expireOn = data.expireOn;
           localStorage.setItem('token', JSON.stringify(user));
          }
        }
  } else {
    this.storeService.clearStore(); // logout
  }
    }, error => {this.storeService.clearStore();  console.log('checkCurrentLogin', error); } );
  }

private  getSelectedMarket(): ActiveMarket[] {
  let selectedMarkets: ActiveMarket[] ;
  this.store
  .pipe(select(fromSelectedMarket.getAllMarkets), take(1), catchError(err => throwError(err)))
  .subscribe(markets => selectedMarkets = markets, err => console.log('getSelectedMarket', err));
  return selectedMarkets;
}
PostNewCashOut(marketCashout: any): Observable<any> {

  this.PostNewCashOutRequest(marketCashout);
 return this._placedBetNewCashoutSubject.asObservable();
}
PostNewCashOutOrder(marketCashout: any): Observable<any> {

  this.PostCashOutOrderRequest(marketCashout);
 return this._placedBetNewCashoutSubject.asObservable();
}
PostCashOut(marketCashout: MarketCashout): Observable<any> {

  this.PostCashOutRequest(marketCashout);
 return this._placedBetCashoutSubject.asObservable();
}
setBetList$(betList) {
  this._getBetListSubject.next(betList);
}
PostNewCashOutRequest(marketCashout: any): any {
  const params = {
    "betId": marketCashout.betId,
    "liability": marketCashout.liability,
    // "profit": marketCashout.profit,
    "particalyCashout": marketCashout.particalyCashout,
    "isAcceptAnyPL": marketCashout.isAcceptAnyPL
}
  this.httpClient
    .post(apiEndPointData.data.cau + 'api/Cashout/InsertPlaceBetCashout', params)
    .pipe(catchError(err => throwError(err)))
    .subscribe((res) => this._placedBetNewCashoutSubject.next(res), err => console.log('PostCashOut', err));
}
PostCashOutOrderRequest(marketCashout: any): any {
  const params = {
    "betId": marketCashout.betId,
    "liability": marketCashout.liability,
    // "profit": marketCashout.profit,
    "particalyCashout": marketCashout.particalyCashout,
    "isAcceptAnyPL": marketCashout.isAcceptAnyPL
}
  this.httpClient
    .post(apiEndPointData.data.cau + 'api/Cashout/CashoutOrder', params)
    .pipe(catchError(err => throwError(err)))
    .subscribe((res) => this._placedBetNewCashoutSubject.next(res), err => console.log('PostCashOutNew', err));
}
PostCashOutRequest(marketCashout: MarketCashout): any {
  const params = {
    betId: marketCashout.betId,
    betDetailId: marketCashout.betDetailID,
    isBack: marketCashout.isback,
    rate: marketCashout.rate,
    stake: marketCashout.stack,
    fancyType: marketCashout.fancyType,
    point: marketCashout.point,
    p1: marketCashout.p1,
    p2: marketCashout.p2,
    ltp: marketCashout.ltp,
    plCashout: marketCashout.plCashout,
    DeviceInfo: marketCashout.DeviceInfo
};
  this.httpClient
    .post(apiEndPointData.data.cau + 'api/Cashout/InsertPlaceBetCashout', params)
    .pipe(catchError(err => throwError(err)))
    .subscribe((res) => this._placedBetCashoutSubject.next(res), err => console.log('PostCashOut', err));
}
getClientLimitRequest(matchId: number){
  return this.httpClient.post(apiEndPointData.data.cau + 'api/Market/GetClientLimit', {matchId:matchId})
    .pipe(map((data: any) => { return data }),catchError(err => throwError(err)));;
  }
  getMarketWiseNews(matchId: string){
    this.httpClient.post(apiEndPointData.data.cau + 'api/Market/MarketWiseNews',{eid: matchId })
                   .pipe(catchError(err => throwError(err)))
                   .subscribe((data: any) => {
                    if (data !== null && data !== undefined && data.result && data.result.length > 0) {
                      this._marketNewsChangesSubject.next(data.result);
                    }}, err => console.log('getMarketWiseNews', err));
  }
private init() {

  this.sessionService.centralHubConnection.subscribe((connection) => {
    connection.on('DSRate', (markets: any) => {
      this._runningDashboardMarketSubject.next(markets);
    });
    connection.on('Rate', (markets: any) => {
      this._runningMarketSubject.next(markets);
    });
    // disconnectCommentary, getCommentary
    connection.on('connectCommentary', (commentary: any) => {
      this._marketCommentarySubject.next(commentary);
    });
  });
  this.sessionService.scoreHubConnection.subscribe((connection) => {
    connection.on('ShortScore', (score: any) => {
      this._shortScoreSubject.next(score);
      
    });
    connection.on('SubScribescore', (score: any) => {
      if(score && score.length > 0){
        for(let i= 0 ; i<score.length ; i ++){
          this._shortScoreSubject.next(score[i]);
        }
        // score.map(x=>{
        //   this._shortScoreSubject.next(x);
        // })
      }
    });
  });
  const marketConnection$ = this.sessionService.marketHubConnection;
  // This trigger has used to  get event score
   marketConnection$.subscribe((connection) => {
   connection.on('getScore', (id: any, score: any) => {
     this._centralScoreSubject.next(score);
   });
  });
 // This trigger has used to change market bet allowed flag
  marketConnection$.subscribe((connection) => {
    connection.on('MarketBetAllowChanges', (data: any) => {
      this._marketBetAllowChanges.next(data);
    });
  });
  // This trigger has used to change market client limit setting
  marketConnection$.subscribe((connection) => {
    connection.on('ClientLimitChanges', (data: any) => {
      if (data !== null && data !== undefined && data.length > 0) {
        const selectedMatches = localStorage.getItem('selected_matches');
        if (selectedMatches != null) {
          const matchids = JSON.parse(selectedMatches);
          this.sessionService.getewcl(matchids);
        }
      }
    });
  });
  // This trigger has used to change market limit settings
  marketConnection$.subscribe((connection) => {
    connection.on('MarketLimitChanges', (data: any) => {
      // this.sessionService.getmwcl(data[0].appEventId);
    });
  });
  // This trigger has used to update matched bet list TODO:: New
  marketConnection$.subscribe((connection) => {
    connection.on('GetBetList', (data: any) => {
      let betlistData = [], self = this;
        if (data !== null && data !== undefined) {
          if (Array.isArray(data)) {
            betlistData = data;
          } else {
            betlistData = [data];
          }
        }
        const clientBetlistData = betlistData.forEach(x => {
        if (x.appMatchID === null || x.appMatchID === undefined) {
          const runnerObj = self.curMarketsRunners.find(runner => x.rid === runner.rid);
            x.appMatchID = runnerObj ? runnerObj.eid : null;
          }
        })
      const betSerializer = new BetSerializer();
      const betList = betSerializer.fromJson(betlistData);
      this._getBetListSubject.next(betList);
    });
  });
  // This trigger has used to delete bet list :: New
  marketConnection$.subscribe((connection) => {
    connection.on('GetDeletedBetList', (data: any) => {
      let betlistData = [], self = this;
      if (data !== null && data !== undefined) {
        if (Array.isArray(data)) {
          betlistData = data;
        } else {
          betlistData = [data];
        }
      }
      const betSerializer = new BetSerializer();
      const betList = betSerializer.fromJson(betlistData);
      this._deleteBetListSubject.next(betList);

    });
  });
  // This trigger has used to update Wager matched bet list TODO:: New
  marketConnection$.subscribe((connection) => {
    connection.on('GetBetListWager', (data: any) => {
      let betlistData = [], self = this;
        if (data !== null && data !== undefined) {
          if (Array.isArray(data)) {
            betlistData = data;
          } else {
            betlistData = [data];
          }
        }
        const clientBetlistData = betlistData.forEach(x => {
        if (x.appMatchID === null || x.appMatchID === undefined) {
          const runnerObj = self.curMarketsRunners.find(runner => x.rid === runner.rid);
            x.appMatchID = runnerObj ? runnerObj.eid : null;
          }
        })
      const betSerializer = new WagerBetSerializer();
      const betList = betSerializer.fromJson(betlistData);
      this._getBetListSubject.next(betList);
    });
  });
  // This trigger has used to delete Wager bet list :: New
  marketConnection$.subscribe((connection) => {
    connection.on('GetDeletedBetListWager', (data: any) => {
      let betlistData = [], self = this;
      if (data !== null && data !== undefined) {
        if (Array.isArray(data)) {
          betlistData = data;
        } else {
          betlistData = [data];
        }
      }
      const betSerializer = new WagerBetSerializer();
      const betList = betSerializer.fromJson(betlistData);
      this._deleteBetListSubject.next(betList);

    });
  });
  // This trigger has used to update matched bet list
  marketConnection$.subscribe((connection) => {
    connection.on('MatchedBetList', (data: any) => {
        this.getBetInfo();
    });
  });
  // This trigger has used to change market volume amount
  marketConnection$.subscribe((connection) => {
    connection.on('MarketRateVolumeChanges', (data: any) => {
      this._marketRateVolumeChanges.next(data);
    });
  });
  // this trigger has used to change market acticve and in-active
  marketConnection$.subscribe((connection) => {
    connection.on('MarketChanges', (data: any) => {
      if (data && data.appIsActive !== undefined && !data.appIsActive) {
        this.marketFacadeService.removeMaket(data.appBetID);
      }
    });
  });
 // This trigger has used to change market In-Play flag
 marketConnection$.subscribe((connection) => {
  connection.on('InPlayChanges', (data: any) => {
    this._inPlayChanges.next(data);
  });
 });
 // This trigger has used to change market market status
 marketConnection$.subscribe((connection) => {
  connection.on('MarketStatusChanges', (data: any) => {
    this._marketStatusChanges.next(data);
  });
 });
 // This trigger has used to chnage following things
 // 1.is show video flag
 // 2.is Commentary on
 // 3.is channel no.
 // 4.id of Commentary
 marketConnection$.subscribe((connection) => {
  connection.on('MultiMatchWiseInfo', (data: any) => {
    this._multiMatchWiseInfo.next(data);
  });
 });
 marketConnection$.subscribe((connection) => {
  connection.on('MatchClientMarketList', (data: any) => {
  });
 });
 marketConnection$.subscribe((connection) => {
  connection.on('AddNewMarketData', (data: any) => {
    if (data !== null && data !== undefined) {
      // const tolowercasrResp: any = this.toLowercaseObjectKeys(data);
      // this.adhocMarketSearializeData(Object.assign([],tolowercasrResp.marketinfo[0]));
      // const resp = this.addMarketSearializeData(tolowercasrResp);
      // this._addNewMarketSubject.next(resp);
      const blockedMarkets = getBlockedMarketData.data?.data;
      if (blockedMarkets && Array.isArray(blockedMarkets)) {
        const filteredMarkets = data.marketInfo.filter((market: any) => {
          return !blockedMarkets.some((blocked) => {
            const appEventID = blocked.appEventID;
            const appEventType = blocked.appEventType;
            switch (appEventType) {
              case EventType.Sport:
                return market.tid === appEventID;
              case EventType.Tournament:
                return market.tid === appEventID;
              case EventType.Match:
                return market.mid === appEventID;
              case EventType.Market:
                return market.mid === appEventID;
              default:
                return false;
            }
          });
        });
        if (filteredMarkets.length > 0) {
          this._addNewDashboardMarketSubject.next(filteredMarkets);
          const toLowercaseResp: any = this.toLowercaseObjectKeys({ marketInfo: filteredMarkets });
          this.adhocMarketSearializeData(Object.assign([], toLowercaseResp.marketinfo[0]));
          const resp = this.addMarketSearializeData(toLowercaseResp);
          this._addNewMarketSubject.next(resp);
        }
      }
    }
  });
 });
 marketConnection$.subscribe((connection) => {
  connection.on('AddNewMarketDashboard', (data: any) => {
    if (data !== null && data !== undefined) {
      // console.log(data);
      // this._addNewDashboardMarketSubject.next(data.marketInfo);
      // const tolowercasrResp: any = this.toLowercaseObjectKeys(data);
      // this.adhocMarketSearializeData(data.marketInfo[0]);
      // const resp = this.addMarketSearializeData(tolowercasrResp);
      // this._addNewMarketSubject.next(resp);
      const blockedMarkets = getBlockedMarketData.data?.data;
      if (blockedMarkets && Array.isArray(blockedMarkets)) {
        const filteredMarkets = data.marketInfo.filter((market: any) => {
          return !blockedMarkets.some((blocked) => {
            const appEventID = blocked.appEventID;
            const appEventType = blocked.appEventType;
            switch (appEventType) {
              case EventType.Sport:
                return market.tid === appEventID;
              case EventType.Tournament:
                return market.tid === appEventID;
              case EventType.Match:
                return market.mid === appEventID;
              case EventType.Market:
                return market.mid === appEventID;
              default:
                return false;
            }
          });
        });
        if (filteredMarkets.length > 0) {
          this._addNewDashboardMarketSubject.next(filteredMarkets);
          const toLowercaseResp: any = this.toLowercaseObjectKeys({ marketInfo: filteredMarkets });
          this.adhocMarketSearializeData(filteredMarkets[0]);
          const resp = this.addMarketSearializeData(toLowercaseResp);
          this._addNewMarketSubject.next(resp);
        }
      }
    }
  });
 });
// This trigger has used to update market news
 marketConnection$.subscribe((connection) => {
  connection.on('MarketNews', (data: any) => {
    if (data !== null && data !== undefined) {
      let newsData = []
      if (Array.isArray(data)) {
        newsData = data;
      } else {
        newsData = [data];
      }
      this._marketNewsChangesSubject.next(newsData);
    }
 });
 });
// for match wise client Limit  get
 marketConnection$.subscribe((connection) => {
  connection.on('ewcl', (data: any) => {
    if (data !== null && data !== undefined) {
      this._ewclChangesSubject.next(data);
      }
  });
 });
 // for Market wise client Limit  get :
 marketConnection$.subscribe((connection) => {
  connection.on('mwcl', (data: any) => {
    if (data !== null && data !== undefined) {
      this._mwclLimitChangesSubject.next(data);
      }
  });
 });
  // This trigger has used to get client balance
 marketConnection$.subscribe((connection) => {
  connection.on('balance', (data: any) => {
    if (data !== null && data !== undefined) {
      this._balanceSubject.next(JSON.parse(data));
    }
  });
 });
   // This trigger has used to get client liability
 marketConnection$.subscribe((connection) => {
  connection.on('liability', (data: any) => {
    this._liabilitySubject.next(data);
  });
 });
     // This trigger has used to get client wallet
 marketConnection$.subscribe((connection) => {
   connection.on('wallet', (data: any) => {
    if (data !== null && data !== undefined) {
      this._walletSubject.next(JSON.parse(data));
    }
  });
 });
  // This trigger has used to get deposit request status
  marketConnection$.subscribe((connection) => {
    connection.on('DepositStatusChange', (data: any) => {
    if (data !== null && data !== undefined) {
      this._depositStatusSubject.next(data);
    }
  });
  });
 // This trigger has used to get event date change
 marketConnection$.subscribe((connection) => {
  connection.on('OnEventDateChange', (data: any) => {
  if (data !== null && data !== undefined) {
    this._eventDateChangeSubject.next(data);
  }
});
});
 // This trigger has used to get market date change
 marketConnection$.subscribe((connection) => {
  connection.on('OnMarketDateChange', (data: any) => {
  if (data !== null && data !== undefined) {
    this._marketDateChangeSubject.next(data);
  }
});
});
     // This trigger has used to OnSiteNotification
 marketConnection$.subscribe((connection) => {
   connection.on('OnSiteNotification', (data: any) => {
     if (data !== null && data !== undefined) {
       const obj:any = {};
             obj.til = data.title,
             obj.msg = data.message,
             obj.url = data.url,
             obj.dpt = data.displaytime,
             obj.iurl = data.iconUrl,
             obj.isc = data.isClose
       this._notificationSubject.next(obj);
     }
  });
 });
 // This trigger has used to logout client from a website
 marketConnection$.subscribe((connection) => {
  connection.on('IsLogin', (data: any) => {
    this.checkCurrentLogin();
  });
 });
 marketConnection$.subscribe((connection) => {
  connection.on('LogOut', (data: any) => {
    this.checkCurrentLogin();
  });
 });
  }
  toasterClickedHandler(data) {
    if (data.url !== null && data.url !== undefined && data.url !== '') {
      window.open(data.url, "_blank");
    }
  }
  adhocMarketSearializeData(data) {
    if (data !== null) {
      if (data !== undefined) {
        // const selectedMatches: any = localStorage.getItem('selected_matches');
        // if(selectedMatches != null && JSON.parse(selectedMatches).includes(data.eid)){
        //   this.sessionService.getmwcl(data.mid);
        // } else
         if(this.router.url.indexOf('/event/virtual-sports') == 0){
          if(data.gt == GameType.Virtual){
            this.sessionService.getmwcl(data.mid);
          }
        }
        this._adhocMatchSubject.next(data);
      }
    }
  }
  addMarketSearializeData(data) {
    const mapResponse: {notificationInfo: MarketRates[], marketInfo: MarketRates[], runnerInfo: MarketRunner[] }
    = {notificationInfo: [], marketInfo: [], runnerInfo: [] };
    const marketInfo: any[] = data.marketinfo;
    const runnerInfo: any[] = data.runnerinfo;
    mapResponse.marketInfo = marketInfo.map(res => {
      const cllimit: any = this.clientLimit.find(x => { x.eid == res.eid && x.mt == res.mt});
      if(cllimit && cllimit.iml){
          let obj:any = {};
          obj.mmr = cllimit.mmr;
          obj.mxr = cllimit.mxr;
          obj.mms = cllimit.mms;
          obj.mxs = cllimit.mxs;
          obj.mmp = cllimit.mmp;
          obj.miu = cllimit.miu;
          obj.mur = cllimit.mur;
          obj.mbr = cllimit.mbr;
          obj.mlr = cllimit.mlr;
          obj.mip = cllimit.mip;
          obj.mll = cllimit.mll;
        return Object.assign(res, obj);
      } else {
        let obj:any = {};
      if(res.mmr){
        obj.mmr = res.mmr;
      } else {
        obj.mmr = cllimit?.mmr;
      }
      if(res.mxr){
        obj.mxr = res.mxr;
      } else {
        obj.mxr = cllimit?.mxr;
      }
      if(res.mms){
        obj.mms = res.mms;
      } else {
        obj.mms = cllimit?.mms;
      }
      if(res.mxs){
        obj.mxs = res.mxs;
      } else {
        obj.mxs = cllimit?.mxs;
      }
      if(res.mmp){
        obj.mmp = res.mmp;
      } else {
        obj.mmp = cllimit?.mmp;
      }
      if(res.miu){
        obj.miu = res.miu;
      } else {
        obj.miu = cllimit?.miu;
      }
      if(res.mur){
        obj.mur = res.mur;
      } else {
        obj.mur = cllimit?.mur;
      }
      if(res.mbr){
        obj.mbr = res.mbr;
      } else {
        obj.mbr = cllimit?.mbr;
      }
      if(res.mlr){
        obj.mlr = res.mlr;
      } else {
        obj.mlr = cllimit.mlr;
      }
      if(res.mip){
        obj.mip = res.mip;
      } else {
        obj.mip = cllimit.mip;
      }
      if(res.mll){
        obj.mll = res.mll;
      } else {
        obj.mll = cllimit.mll;
      }
     return Object.assign(res, obj);
    }
   });
    mapResponse.runnerInfo = runnerInfo.map(res => {
      return res;
   });

   return mapResponse;
  }
  toLowercaseObjectKeys(myObj) {
    return Object.keys(myObj).reduce((prev, current) =>
    ({ ...prev, [current.toLowerCase()]: myObj[current]}), {})
  }
}


