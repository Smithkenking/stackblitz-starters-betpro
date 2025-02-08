
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { apiEndPointData } from '../config/connfig.service';

@Injectable({
    providedIn: 'root'
  })
export class ChangePaswordFacadeService {
    constructor(private httpClient: HttpClient) { }

    savePassword$(payload: any): Observable<any> {
        const body = {
            oldPassword: payload.oldPassword,
            password: payload.password,
            confirmPassword: payload.confirmPassword
        };
        return this.httpClient
            .post(apiEndPointData.data.cau + 'api/Account/ManagePassword', body)
            .pipe(map((data: any) => { return data }), catchError(err => { return throwError(err) }));
    }
    resetPassword$(payload: any): Observable<any> {
        const body = {
            password: payload.password,
            confirmPassword: payload.confirmPassword
        };
        return this.httpClient
            .post(apiEndPointData.data.cau + 'api/Account/ResetPassword', body)
            .pipe(map((data: any) => { return data }), catchError(err => { return throwError(err) }));
    }
}


