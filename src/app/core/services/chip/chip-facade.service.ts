import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { apiEndPointData } from '../config/connfig.service';
import { HttpClient } from '@angular/common/http';

@Injectable({
    providedIn: 'root'
  })
export class ChipFacadeService {
    constructor(private httpClient: HttpClient) { }

    getChips$(): Observable<any> {
        return this.httpClient.post(apiEndPointData.data.cau + 'api/Chip/Client/Costume',{})
            .pipe(map((data: any) => { return data.result }), catchError(err => { return throwError(err) }));
    }
    saveCustomChips$(payload: any): Observable<any> {
        return this.httpClient.post(apiEndPointData.data.cau + 'api/Chip/Client/SaveCostume', payload)
            .pipe(map((data: any) => { return data }), catchError(err => { return throwError(err) }));
    }
}

