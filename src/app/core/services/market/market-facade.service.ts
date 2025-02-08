import { Injectable } from '@angular/core';
import { Observable, Subject, throwError } from 'rxjs';
import { map, catchError, take } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { apiEndPointData } from '../config/connfig.service';
import { ActiveMarket } from '@clientApp-core/models/market/activemarket.model';

@Injectable({
  providedIn: 'root'
})
export class MarketFacadeService {

    private _marketSubject = new Subject<ActiveMarket[]>();
    private _removeMarketSubject = new Subject<any>();
    private _unpinMarketSubject = new Subject<any>();
    private _setVideoSubject = new Subject<any>();
    private _setVideoSubject1 = new Subject<any>();
    private _removeManyMarketSubject = new Subject<any>();
    private _removeBetFromBetListSubject = new Subject<any>();
    marketList: ActiveMarket[] = [];

    constructor(private httpClient: HttpClient) {}

    getMarkets$(): Observable<ActiveMarket[]> {
        return this._marketSubject.asObservable();
    }
    getMarketToRemove$(): Observable<any> {
        return this._removeMarketSubject.asObservable();
    }
    removeBetFromBetList(): Observable<any> {
        return this._removeBetFromBetListSubject.asObservable();
    }
    getManyMarketToRemove$(): Observable<any> {
      return this._removeManyMarketSubject.asObservable();
  }
    removeMaket(id: any) {
        const obj = { BetId: id, MatchId: null };
        this._removeBetFromBetListSubject.next(obj);
        return this._removeMarketSubject.next(id);
    }
    removeManyMaket(id: any) {
      const obj = { BetId: null, MatchId: id };
      this._removeBetFromBetListSubject.next(obj);
      return this._removeManyMarketSubject.next(id);
    }
    removeVirtualMaket(id: any) {
      const obj = { BetId: null, MatchId: id };
      return this._unpinMarketSubject.next(id);
  }
    getVideo$(): Observable<any> {
      return this._setVideoSubject.asObservable();
    }
    setVideo(id: any) {
        return this._setVideoSubject.next(id);
    }
    getVideoByUrl$(): Observable<any> {
      return this._setVideoSubject1.asObservable();
    }
    setVideoByUrl(id: any) {
      return this._setVideoSubject1.next(id);
    }
    getMarketToUnpin$(): Observable<any> {
      return this._unpinMarketSubject.asObservable();
    }
    unpinMaket(id: any) {
        const obj = { BetId: null, MatchId: id };
        this._removeBetFromBetListSubject.next(obj);
        return this._unpinMarketSubject.next(id);
    }
    getMarkets(): void {
      this.httpClient
      .post(apiEndPointData.data.cau + 'api/Market/ActiveMarketList', {})
      .pipe(map((data: any) => { return data.result }),take(1), catchError(err => throwError(err)))
      .subscribe((market: ActiveMarket[]) =>{  
          this.marketList = market; 
          this._marketSubject.next(market); 
        }, err => console.log('marketRequest', err));
    }
}

