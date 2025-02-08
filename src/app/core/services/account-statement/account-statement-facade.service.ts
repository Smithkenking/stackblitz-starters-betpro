
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { apiEndPointData } from '../config/connfig.service';
import { guid } from '@clientApp-core/utilities/app-util';

@Injectable({
    providedIn: 'root'
  })
export class AccountStatementFacadeService {
    constructor(private httpClient: HttpClient) { }

    getAccountStatement$(): Observable<any> {
        return this.httpClient
            .post(apiEndPointData.data.cau + 'api/Account/Statement',{})
            .pipe(map((data: any) => { return this.accountStatementSerializer(data.result) }), catchError(err => { return throwError(err) }));
    }

    getBetHistory$(betId): Observable<any> {
        return this.httpClient
            .post(apiEndPointData.data.cau + 'api/Bet/History',{"betId": +betId})
            .pipe(map((data: any) => { return this.betHistorySerializer(data) }), catchError(err => { return throwError(err) }));
    }
    accountStatementSerializer(data) {
        data.appDate = data.appDate;
        data.appCR = '-';
        data.appDR = '-';
        return Object.assign(data, { appFinalTransactionID: guid() });

    }
    betHistorySerializer(data) {
        return data.map(obj => {
            obj.appCreatedDate = obj.appCreatedDate;
            obj.appMatchedDate = obj.appMatchedDate;
            obj.appCR = '-';
            obj.appDR = '-';
            return obj;
        });
    }
}


