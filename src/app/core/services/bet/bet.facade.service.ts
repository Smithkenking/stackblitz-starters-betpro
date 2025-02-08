import { Injectable } from '@angular/core';
import { Observable, Subject, BehaviorSubject, of, throwError } from 'rxjs';
import { Stake } from '@clientApp-core/models/bet/stake.model';
import { EstimatedProfitLoss } from '@clientApp-core/models/bet/estimated-profit-loss.model';
import { PlaceBet } from '@clientApp-core/models/bet/place-bet.model';
import { switchMap, take, catchError, map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { apiEndPointData } from '../config/connfig.service';
import { LiabilitySerializer } from '@clientApp-core/serializers/market/liability.serializer';
import { BaseSerializer } from '@clientApp-core/serializers/base/base.serializer';



@Injectable({
    providedIn: 'root'
  })
export class BetFacadeService {
    private _placedBetSubject = new Subject<any>();
    private _setStakeSubject = new Subject<Stake>();
    private _balanceSubject = new Subject<any>();
    private _balanceandealletSubject = new Subject<any>();
    private _liabilitySubject = new Subject<any>();
    private _OverlayPanelSubject = new Subject<boolean>();
    private _deleteBetSubject = new Subject<any>();
    private _estimatedProfitLossSubject = new BehaviorSubject<any>(null);
    private _isPlaceBetClicked: boolean;
    private _SelectedRuner = new Subject<string>();
    private _setBetIdSubject = new Subject<number>();
    private _isBetPlacedSuccessfully = new Subject<boolean>();
    selectedBetDetailId: number;
    lastSelectedItem: string;

    constructor(private httpClient: HttpClient) { }

    getStake$(): Observable<Stake> {
        return this._setStakeSubject.asObservable();
    }
    setStake(): Subject<Stake> {
        return this._setStakeSubject;
    }
    getEstimatedProfitLoss(): Observable<EstimatedProfitLoss[]> {
        return this._estimatedProfitLossSubject.asObservable();
    }
    sendEstimatedProfitLoss(): BehaviorSubject<EstimatedProfitLoss[]> {
        return this._estimatedProfitLossSubject;
    }
    getBetStatus(): boolean {
        return this._isPlaceBetClicked;
    }
    setBetStatus(value: boolean) {
        this._isPlaceBetClicked = value;
    }
    deleteBet(betId: number, clientId: number): Observable<any> {
        this.deleteBetRequest(betId, clientId);
        return this._deleteBetSubject.asObservable();
    }
    getOvelayStatus$(): Observable<boolean> {
        return this._OverlayPanelSubject.asObservable();
    }
    setOvelayStatus(): Subject<boolean> {
        return this._OverlayPanelSubject;
    }
    getBetPlacedStatus$(): Observable<boolean> {
        return this._isBetPlacedSuccessfully.asObservable();
    }
    setBetPlacedStatus(): Subject<boolean> {
        return this._isBetPlacedSuccessfully;
    }
    getSelectedRunner$(): Observable<string> {
        return this._SelectedRuner.asObservable();
    }
    setSelectedRunner(): Subject<string> {
        return this._SelectedRuner;
    }
    getBetId$(): Observable<number> {
        return this._setBetIdSubject.asObservable();
    }
    setBetId(): Subject<number> {
        return this._setBetIdSubject;
    }
    placeBet(placeBet: PlaceBet): Observable<any> {
        this._OverlayPanelSubject.next(true);
        this.placeBetRequest(placeBet);
        return this._placedBetSubject.asObservable();
    }
    getBalance(): void {
        this.httpClient.post(apiEndPointData.data.cau + 'api/Chip/Client/Balance', {}).pipe(map((data: any) => { return data.result }), switchMap((resp: any) => {
            return of({
                balance: resp.balance,
                liability: resp.liability
            });
        }), take(1), catchError(err => throwError(err)))
            .subscribe(
                value => this._balanceSubject.next(value),
                err => console.log('getBalance', err)
            );

    }
    getBalanceAndWallet(): void {
        this.httpClient.post(apiEndPointData.data.cau + 'api/Chip/GetClientBalanceAndWallet',{}).pipe(map((data: any) => { return data.result }), switchMap((resp: any) => {
            return of({
                clientBalance: resp.clientBalance,
                lstWalletAmount: resp.lstWalletAmount
            });
        }), take(1), catchError(err => throwError(err)))
            .subscribe(
                value => { clientBalance = value.clientBalance; this._balanceandealletSubject.next(value) },
                err => console.log('getBalanceAndWallet', err)
            );

    }
    checkBalance$(): Observable<any> {
        return this._balanceSubject.asObservable();
    }
    checkBalanceAndWallet$(): Observable<any> {
        return this._balanceandealletSubject.asObservable();
    }
    getLiability(): void {
        const liabilitySerializer = new LiabilitySerializer();
        this.httpClient.post(apiEndPointData.data.cau + 'api/Market/Active/GetLiabilityWiseRecord', {})
            .pipe(map((data: any) => { return this.convertData(data.result, liabilitySerializer)}),take(1), catchError(err => throwError(err)))
            .subscribe(
                (response: any) => this._liabilitySubject.next(response),
                err => console.log('getLiability', err)
            );
    }
    checkLiability(): Observable<any> {
        return this._liabilitySubject.asObservable();
    }
    private convertData(
        data: any,
        serializer: BaseSerializer
      ) {
        return data.map(item => serializer.fromJson(item));
      }
    private placeBetRequest(placeBet: PlaceBet) {
        const body = {
            BetId: placeBet.betId,
            BetDetailId: placeBet.betDetailId,
            IsBack: placeBet.isBack,
            Rate: placeBet.rate,
            Stake: placeBet.stake,
            Fancytype: placeBet.fancyType,
            Point: placeBet.point,
            placeFrom: placeBet.placeFrom,
            deviceinfo: placeBet.deviceinfo,
            walletId: placeBet.walletId,
            isWager: placeBet.isWager
        };
        this.httpClient.post(apiEndPointData.data.cau + 'api/Bet/PlaceBet', body)
            .pipe(take(1), catchError(err => throwError(err)))
            .subscribe(
                (response: any) => this._placedBetSubject.next(response),
                err => this._placedBetSubject.error(err)
            );
    }
    private deleteBetRequest(betId: number, clientId: number) {
        this.httpClient.post(apiEndPointData.data.cau + 'api/Bet/UnMatchedBet', {"betId": betId, "clientBetId": clientId})
            .pipe(take(1), catchError(err => throwError(err)))
            .subscribe(
                (response: any) => this._deleteBetSubject.next(response),
                err => console.log('deleteBetRequest', err)
            );
    }
    getAcceptAnyOddtRequest(): Observable<any> {
        return this.httpClient
         .post(apiEndPointData.data.cau + 'api/Account/GetAcceptAnyOdds',{}, {})
         .pipe(catchError(err => throwError(err)));
    }
    setAcceptAnyOddtRequest(isTrue: boolean): Observable<any> {
        return this.httpClient
         .post(apiEndPointData.data.cau + 'api/Account/SetAcceptAnyOdds',{isTrue: isTrue})
         .pipe(catchError(err => throwError(err)));
    }
}
export let clientBalance: any = {};