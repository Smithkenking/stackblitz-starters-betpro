import { Injectable } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { ParkBetState } from '@clientApp-store/store.state';
import { Observable, Subject, throwError } from 'rxjs';
import { take, catchError } from 'rxjs/operators';
import * as fromSelectedMarket from '@clientApp-store/selected-market/selectors/selected-market.selectors';
import { SignalrConnectionState } from '@clientApp-core/enums/connectionState-type';
import { CommonService } from '../common/common.service';
import { GuestMLConfig, websiteSettings } from '../authentication/authentication-facade.service';
import { MarketFacadeService } from '../market/market-facade.service';
import { apiEndPointData } from '../config/connfig.service';
import * as signalR from '@microsoft/signalr';
import { fancyRankOrder, GetSortOrder } from '@clientApp-core/utilities/app-configuration';
import { DeviceInfoService } from '../device-info/deviceinfo.services';
import { arrayUniqueByKey, mapUniqueData } from '../shared/JSfunction.service';
import { ActiveMarket } from '@clientApp-core/models/market/activemarket.model';
import { FanceType } from '@clientApp-core/enums/market-fancy.type';
@Injectable({
  providedIn: 'root'
})
export class SessionService {

  private _centralHubConnectionSubject = new Subject<any>();
  private _marketConnectionSubject = new Subject<any>();
  private _scoreConnectionSubject = new Subject<any>();
  private _centeralHubConnection: any;
  private _marketHubConnection: any;
  private _isUserInitiated: boolean;
  private _scoreHubConnection: any;
  private _hubState = {
    connected: 1
  };
  selectedMarkets: ActiveMarket[];
  private centralHubStateSubject = new Subject<boolean>();
  private marketHubStateSubject = new Subject<boolean>();
  private scoreHubStateSubject = new Subject<boolean>();
  reconnectCenteralCount = 0;
  reconnectMarketCount = 0;
  constructor(private store: Store<ParkBetState>, public commonService: CommonService,
    private marketFacadeService: MarketFacadeService, public deviceInfoService: DeviceInfoService) {
  }

  get centeralHubState(): number {
      if (this._centeralHubConnection && this._centeralHubConnection.state) {
        if (this._centeralHubConnection.state == signalR.HubConnectionState.Connected) {
          return SignalrConnectionState.Connected;
        } else if (this._centeralHubConnection.state == signalR.HubConnectionState.Disconnected) {
          return SignalrConnectionState.Disconnected;
        } else if (this._centeralHubConnection.state == signalR.HubConnectionState.Reconnecting) {
          return SignalrConnectionState.Reconnecting;
        } else {
          return SignalrConnectionState.Connecting;
        }

      }
  }

  get marketHubState(): number {
    if (this._marketHubConnection && this._marketHubConnection.state) {
      if (this._marketHubConnection.state == signalR.HubConnectionState.Connected) {
        return SignalrConnectionState.Connected;
      } else if (this._marketHubConnection.state == signalR.HubConnectionState.Disconnected) {
        return SignalrConnectionState.Disconnected;
      } else if (this._marketHubConnection.state == signalR.HubConnectionState.Reconnecting) {
        return SignalrConnectionState.Reconnecting;
      } else {
        return SignalrConnectionState.Connecting;
      }
    }
  }
  
  get scoreHubState(): number {
    if (this._scoreHubConnection && this._scoreHubConnection.state) {
      if (this._scoreHubConnection.state == signalR.HubConnectionState.Connected) {
        return SignalrConnectionState.Connected;
      } else if (this._scoreHubConnection.state == signalR.HubConnectionState.Disconnected) {
        return SignalrConnectionState.Disconnected;
      } else if (this._scoreHubConnection.state == signalR.HubConnectionState.Reconnecting) {
        return SignalrConnectionState.Reconnecting;
      } else {
        return SignalrConnectionState.Connecting;
      }
    }
  }
  get centralHubConnection(): Observable<any> {
    return this._centralHubConnectionSubject.asObservable();
  }

  get marketHubConnection(): Observable<any> {
    return this._marketConnectionSubject.asObservable();
  }
  
  joinCentralDashboardGroup(group: string): void {
    const self = this;
    if (group !== null && group !== undefined) {
      if (this.centeralHubState === this._hubState.connected) {
        this._centeralHubConnection.invoke('ConnectDSRate', group);
      } else {
        this.startCentralHubConnection$().pipe(take(1)).subscribe(() => {
          self._centeralHubConnection.invoke('ConnectDSRate', group);
        });
      }
    }
  }

  get scoreHubConnection(): Observable<any> {
    return this._scoreConnectionSubject.asObservable();
  }
  joinCentralGroup(group: string): void {
    const self = this;
    if (group !== null && group !== undefined) {
      if (this.centeralHubState === this._hubState.connected) {
        this._centeralHubConnection.invoke('ConnectMarketRate', group);
      } else {
        this.startCentralHubConnection$().pipe(take(1)).subscribe(() => {
          self._centeralHubConnection.invoke('ConnectMarketRate', group);
        });
      }
    }
  }

  joinMultiCentralGroup(group: string): void {
    const self = this;
    if (group !== null && group !== undefined) {
      if (this.centeralHubState === this._hubState.connected) {
        this._centeralHubConnection.invoke('ConnectMarketRate', group);
      } else {
        this.startCentralHubConnection$().pipe(take(1)).subscribe(() => {
          self._centeralHubConnection.invoke('ConnectMarketRate', group);
        });
      }
    }
  }

  removeAllCentralGroup(group: string): void {
    const self = this;
      if (this.centeralHubState === this._hubState.connected) {
        this._centeralHubConnection.invoke('DisconnectMarketRate', group);
      } else {
        this.startCentralHubConnection$().pipe(take(1)).subscribe(() => {
          self._centeralHubConnection.invoke('DisconnectMarketRate', group);
        });
      }
  }
  removeCentralDashboardGroup(group: string): void {
    const self = this;
      if (this.centeralHubState === this._hubState.connected) {
        this._centeralHubConnection.invoke('DisconnectDSRate', group);
      } else {
        this.startCentralHubConnection$().pipe(take(1)).subscribe(() => {
          self._centeralHubConnection.invoke('DisconnectDSRate', group);
        });
      }
  }
  removeCentralGroup(group: string): void {
    const self = this;
      if (this.centeralHubState === this._hubState.connected) {
        this._centeralHubConnection.invoke('DisconnectMarketRate', group);
      } else {
        this.startCentralHubConnection$().pipe(take(1)).subscribe(() => {
          self._centeralHubConnection.invoke('DisconnectMarketRate', group);
        });
      }
  }
  addClient(clientid: any): void {
    const self = this;
    if (this.marketHubState === this._hubState.connected) {
      this._marketHubConnection.invoke('addClient', clientid);
    } else {
      this.startMarketHubConnection$().pipe(take(1)).subscribe(() => {
        self._marketHubConnection.invoke('addClient', clientid);
      });
    }
  }
  removeClient(clientid: any): void {
    const self = this;
    if (this.marketHubState === this._hubState.connected) {
      this._marketHubConnection.invoke('removeClient', clientid);
    } else {
      this.startMarketHubConnection$().pipe(take(1)).subscribe(() => {
        self._marketHubConnection.invoke('removeClient', clientid);
      });
    }
  }
  addMarket(matchId: any,betId: any): void {
    const self = this;
    if (this.marketHubState === this._hubState.connected) {
      this._marketHubConnection.invoke('addMarket', matchId, betId);
    } else {
      this.startMarketHubConnection$().pipe(take(1)).subscribe(() => {
        self._marketHubConnection.invoke('addMarket', matchId, betId);
      });
    }
  }
  removeMarket(matchId: any,betId: any): void {
    const self = this;
    if (this.marketHubState === this._hubState.connected) {
      this._marketHubConnection.invoke('removeMarket', matchId, betId);
    } else {
      this.startMarketHubConnection$().pipe(take(1)).subscribe(() => {
        self._marketHubConnection.invoke('removeMarket', matchId, betId);
      });
    }
  }
  // for match wise client Limit  get :
  getewcl(MatchID: any): void {
    let self = this, ClientID = '';
    const user = JSON.parse(localStorage.getItem('token'));
    if (user != null) {
      ClientID = user.id;
    }
    if (this.marketHubState === this._hubState.connected) {
      this._marketHubConnection.invoke('getewcl', MatchID, ClientID);
    } else {
      this.startMarketHubConnection$().pipe(take(1)).subscribe(() => {
        self._marketHubConnection.invoke('getewcl', MatchID, ClientID);
      });
    }
  }
  // for Market wise client Limit  get :
  getmwcl(BetID: any): void {
    let self = this, ClientID = '';
    const user = JSON.parse(localStorage.getItem('token'));
    if (user != null) {
      ClientID = user.id;
    }
    if (this.marketHubState === this._hubState.connected) {
      this._marketHubConnection.invoke('getmwcl', BetID, ClientID);
    } else {
      this.startMarketHubConnection$().pipe(take(1)).subscribe(() => {
        self._marketHubConnection.invoke('getmwcl', BetID, ClientID);
      });
    }
  }
  joinMarketGroup(ConnectionInfo: any): void {
    const self = this;
    if (this.marketHubState === this._hubState.connected) {
      this._marketHubConnection.invoke('addGroup', ConnectionInfo);
    } else {
      this.startMarketHubConnection$().pipe(take(1)).subscribe(() => {
        self._marketHubConnection.invoke('addGroup', ConnectionInfo);
      });
    }
  }
  addConnection() {
    const user = JSON.parse(localStorage.getItem('token'));
    if (user != null) {
      if (this.marketHubState === this._hubState.connected) {
        this._marketHubConnection.invoke('addConnection', Number(user.id), (user.distributor),
          Number(user.masterDistributor));
      } else {
        this.startMarketHubConnection$().pipe(take(1)).subscribe(() => {
          this._marketHubConnection.invoke('addConnection', Number(user.id), Number(user.distributor),
            Number(user.masterDistributor));
        });
      }
    }
  }
  joinScoreCentralGroup(group: any): void {
    const self = this;
  }
  removeScoreCentralGroup(group: any): void {
    const self = this;
  }
  addMGroup() {
    const user = JSON.parse(localStorage.getItem('token'));
    if (user != null) {
      this.addClient(user.id);
    }
  }

  addMarketGroup(ConnectionId: string, ConnectionType: number, MatchID: number,
    BetID: number, CentralizationID: any, ClientID: number, DistributorID: number, MasterDistributorID: number) {
    const ConnectionInfo = {
      'ConnectionId': ConnectionId,
      'ConnectionType': ConnectionType,
      'MatchID': MatchID,
      'BetID': BetID,
      'CentralizationID': CentralizationID,
      'ClientID': ClientID,
      'DistributorID': 0,
      'MasterDistributorID': 0
    };
    this.addMarket(MatchID,BetID);
  }
 
  ConnectShortScore(group: string): void {
    const self = this;
    if (group !== null && group !== undefined) {
      if (this.scoreHubState === this._hubState.connected) {
        this._scoreHubConnection.invoke('getShortScore', group);
      } else {
        this.startScoreHubConnection$().pipe(take(1)).subscribe(() => {
          self._scoreHubConnection.invoke('getShortScore', group);
        });
      }
    }
  }
  startCentralSignalrConnections() {
      this.setCentralHubConnection();
  }
  startMarketSignalrConnections() {
    this.setMarketHubConnection();
  }
  startScoreSignalrConnections() {
    this.setScoreHubConnection();
  }
  connectCentralHubConnection() {
    this.startCentralHubConnection();
  }
  connectMarketHubConnection() {
    this.startMarketHubConnection();
  }
  
  stopHubConnections() {
    this.stopCenteralHubConnection();
  this.stopMarketHubConnection();
  this.stopScoreHubConnection();
}
  connectScoreHubConnection() {
    this.startScoreHubConnection();
  }
  
 
  
  private setMarketHubConnection() {
    try {
      let signalREndPoint;
      signalREndPoint = apiEndPointData.data.wns ? apiEndPointData.data.wns : this.commonService.configData.webNotificationSignalr;
      this._marketHubConnection = new signalR.HubConnectionBuilder()
        .withUrl(signalREndPoint, {
          skipNegotiation: true,
          transport: signalR.HttpTransportType.WebSockets
      })
        .build();
      this._marketConnectionSubject.next(this._marketHubConnection);
    } catch (ex) {
      console.log('setMarketHubConnection', ex);
    }
  }
  private setScoreHubConnection() {
    try {
      let signalREndPoint;
      signalREndPoint = apiEndPointData.data.scoreSignalREndPoint;
      this._scoreHubConnection = new signalR.HubConnectionBuilder()
        .withUrl(signalREndPoint, {
          skipNegotiation: true,
          transport: signalR.HttpTransportType.WebSockets
      })
        .build();
      this._scoreConnectionSubject.next(this._scoreHubConnection);
    } catch (ex) {
      console.log('setScoreHubConnection', ex);
    }
  }
  private setCentralHubConnection() {
    try {
      let signalREndPoint;
      signalREndPoint = apiEndPointData.data.wrs;
      this._centeralHubConnection = new signalR.HubConnectionBuilder()
        .withUrl(signalREndPoint)
        .build();
      this._centralHubConnectionSubject.next(this._centeralHubConnection);
    } catch (ex) {
      console.log('setCentralHubConnection', ex);
    }
  }

  private stopCenteralHubConnection() {
    if (this._centeralHubConnection != null) {
      this._centeralHubConnection.stop();
      this._isUserInitiated = true;
    }
  }

   stopMarketHubConnection() {
    if (this._marketHubConnection != null) {
      this._marketHubConnection.stop();
      this._isUserInitiated = true;
    }
  }
 
  stopScoreHubConnection() {
    if (this._scoreHubConnection != null) {
      this._scoreHubConnection.stop();
      this._isUserInitiated = true;
    }
  }
  private startCentralHubConnection$(): Observable<boolean> {
    return this.centralHubStateSubject.asObservable();
  }

  async startCentralHubConnection() {
    const self = this;
    if (this._centeralHubConnection !== null && this._centeralHubConnection !== undefined &&
      this._centeralHubConnection.state !== signalR.HubConnectionState.Connected) {
      await this._centeralHubConnection.start()
        .then(function () {
          console.log('Centeral hub connected.');
          self.getSelectedMarket();
          self.ReconnectionGroup();
          self.centralHubStateSubject.next(true);
        })
        .catch(function (ex) {
          if (self.reconnectCenteralCount < 3) {
            console.log('Error while connecting centeral hub', ex);
            self.reconnectCenteralCount = self.reconnectCenteralCount + 1;
          }
        });
      this._centeralHubConnection.onclose(async () => {
        if (self._isUserInitiated !== undefined && !self._isUserInitiated) {
          console.log('Centeral hub connection closed.');
          self.getSelectedMarket();
          await self.startCentralHubConnection();
          self.ReconnectionGroup();
        }
      });
    }
  }
 
  private startScoreHubConnection$(): Observable<boolean> {
    return this.scoreHubStateSubject.asObservable();
  }
  private startMarketHubConnection$(): Observable<boolean> {
    return this.marketHubStateSubject.asObservable();
  }
  async startMarketHubConnection() {
    const self = this;
    const user = JSON.parse(localStorage.getItem('token'));
    if (this._marketHubConnection !== null && this._marketHubConnection !== undefined &&
      this._marketHubConnection.state !== signalR.HubConnectionState.Connected) {
      await this._marketHubConnection.start()
        .then(function () {
          console.log('Market hub connected.');
          self.addMGroup();
          self.getSelectedMarket();
          self.ReconnectMarketGroup();
          self.marketHubStateSubject.next(true);
        })
        .catch(function (ex) {
          if (self.reconnectMarketCount < 3) {
            console.log('Error while connecting market hub', ex);
            self.reconnectMarketCount = self.reconnectMarketCount + 1;
          }
        });
      this._marketHubConnection.onclose(async () => {
        if (self._isUserInitiated !== undefined && !self._isUserInitiated) {
          console.log('Market hub connection closed.');
          self.getSelectedMarket();
          await self.startMarketHubConnection();
          self.ReconnectMarketGroup();
        }
      });
    }
  }
  getSelectedMarket() {
    this.store
      .pipe(select(fromSelectedMarket.getAllMarkets), take(1), catchError(err => throwError(err)))
      .subscribe(markets => this.selectedMarkets = markets, err => console.log('getSelectedMarket', err));

  }
 
  async startScoreHubConnection() {
    const self = this;
    if (this._scoreHubConnection !== null && this._scoreHubConnection !== undefined &&
      this._scoreHubConnection.state !== signalR.HubConnectionState.Connected) {
      await this._scoreHubConnection.start()
        .then(function () {
          console.log('Score hub connected.');
          self.scoreHubStateSubject.next(true);
        })
        .catch(function (ex) {
          if (self.reconnectMarketCount < 3) {
            console.log('Error while connecting score hub', ex);
            self.reconnectMarketCount = self.reconnectMarketCount + 1;
          }
        });
      this._scoreHubConnection.onclose(async () => {
        if (self._isUserInitiated !== undefined && !self._isUserInitiated) {
          console.log('Score hub connection closed.');
          await self.startScoreHubConnection();
        }
      });
    }
  }
  ReconnectionGroup() {
    try {
      if (!(this.selectedMarkets.length <= 0 || !this.selectedMarkets)) {
        const centralizationIds = this.selectedMarkets.map(match => match.mc).toString();
        this.joinMultiCentralGroup(centralizationIds);
      } else {
        let isShowDashboardRate: boolean,allActiveMarketList: any = [];
        const user = JSON.parse(localStorage.getItem('token'));
        if (user == null || user == undefined || user == '') {
          isShowDashboardRate = apiEndPointData.data.isdr;
          allActiveMarketList = GuestMLConfig.data.allActiveMarketList ? GuestMLConfig.data.allActiveMarketList : [];
        } else {
          isShowDashboardRate = websiteSettings.data.isShowDashboardRate;
          allActiveMarketList = this.marketFacadeService.marketList;
        }
        const allMarkets = allActiveMarketList.sort((a, b) => {
          return fancyRankOrder.get(b.mt) - fancyRankOrder.get(a.mt);
        }).sort(GetSortOrder('ed'));
        if (allMarkets && allMarkets.length > 0 && isShowDashboardRate) {
          const excludeSports = apiEndPointData.data.excludeSports;
          const excludeSport = excludeSports.map(x => x.name);
          const uniqueMarkets = arrayUniqueByKey(allMarkets.filter(v => !excludeSport.includes(v.st)), 'eid');
          let result : any;
          if(apiEndPointData.data.marketnames){
          const mapData = apiEndPointData.data.marketnames.map(element => {
            return element.toLowerCase().replace(/\s/g, '');
          });
          result = uniqueMarkets.filter(item => mapData.includes(item.mn.toLowerCase().replace(/\s/g, '')));
        } else {
          const eventids:any = mapUniqueData(uniqueMarkets, 'eid');
          result = arrayUniqueByKey((allMarkets.reverse()).filter(function (o1) {
            return eventids.includes(o1.eid) && (o1.mt == FanceType.Market || o1.mt == FanceType.Virtual)
          }), 'eid');
        }
          const centralizationIds = result.map(match => match.mc).toString();
          this.joinCentralDashboardGroup(centralizationIds);
        }
      }
    } catch (ex) {
      console.log('Error on Reconnection Central Group function ::' + ex.message);
    }
  }
  ReconnectMarketGroup() {
    try {
      if (!(this.selectedMarkets.length <= 0 || !this.selectedMarkets)) {
        this.selectedMarkets.forEach((matchs: any) => {
          this.addMarketGroup('', 3, matchs.eid, matchs.mid, matchs.mc, 0, 0, 0);
          this.joinScoreCentralGroup(matchs.eb);
        });
      }
    } catch (ex) {
      console.log('Error on Reconnect Market Group function ::' + ex.message);
    }
  }
}
