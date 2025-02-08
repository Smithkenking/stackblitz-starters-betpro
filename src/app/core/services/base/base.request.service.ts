import { HttpClient } from '@angular/common/http';
import { BaseSerializer } from '@clientApp-core/serializers/base/base.serializer';
import { BaseRequest } from '@clientApp-core/models/base/base-request.model';
import { map, catchError } from 'rxjs/operators';
import { throwError, Observable } from 'rxjs';
import { apiEndPointData } from '@clientApp-core/services/config/connfig.service';

export abstract class BaseRequestService {
  private readonly baseUrl: string;
  constructor(protected httpClient: HttpClient) {
  }

  public post<Request, Response>(
    item: BaseRequest<Request>,
    serializer: BaseSerializer
  ): Observable<Response> {
    return this.httpClient
      .post<Response>(
        this.getEndpoint<Request>(item),
        serializer.toJson(item.body), {
          params: item.queryParameter
        }
      ).pipe(
        map((data: any) => serializer.fromJson(data) as Response),
        catchError(err => {
          return throwError(err);
        })
      );
  }

  public update<Request, Response>(
    item: BaseRequest<Request>,
    serializer: BaseSerializer
  ): Observable<Response> {
    return this.httpClient
      .put<Response>( this.getEndpoint<Request>(item), serializer.toJson(item))
      .pipe(
          map(data => serializer.fromJson(data) as Response),
          catchError(err => {
            return throwError(err);
          })
        );
  }

  public delete<Request, Response>(
    item: BaseRequest<Request>
  ): Observable<Response> {
    return this.httpClient
      .delete<Response>( this.getEndpoint<Request>(item), {params: item.queryParameter})
      .pipe(
          map(data => data as Response),
          catchError(err => {
            return throwError(err);
          })
        );
  }

  public get<Request, Response>(
    item: BaseRequest<Request>,
    serializer: BaseSerializer
  ): Observable<Response> {
    return this.httpClient
      .get<Response>(this.getEndpoint<Request>(item), {
        params: item.queryParameter
      })
      .pipe(
          map((data: any) => serializer.fromJson(data) as Response),
          catchError(err => {
            return throwError(err);
          })
        );
  }

  public getAll<Request, Response>(
    item: BaseRequest<Request>,
    serializer: BaseSerializer
  ): Observable<Response[] | any> {
    return this.httpClient
      .get<Response>(this.getEndpoint<Request>(item), {
        params: item.queryParameter
      })
      .pipe(
        map((data: any) => this.convertData(data.result, serializer)),
          catchError(err => {
             return throwError([err]);
          })
        );
  }

  private convertData<Response>(
    data: any,
    serializer: BaseSerializer
  ): Response {
    return data.map(item => serializer.fromJson(item));
  }

  private getEndpoint<Request>(item: BaseRequest<Request>): string {
    let baseUrl: string;
    if (item.baseUrl) {
      baseUrl = `${item.baseUrl}${item.endPoint}`;
    } else {
      baseUrl = `${apiEndPointData.data.cau}${item.endPoint}`;
    }
    return baseUrl;
  }
}
