import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpResponse,
  HttpErrorResponse,
  HttpHeaders
} from '@angular/common/http';

import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { StoreService } from '@clientApp-core/services/store/store.service';

@Injectable()
export class AuthHttpInterceptor implements HttpInterceptor {
  constructor(public storeService: StoreService) {}
  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
      req = req.clone({
        headers: req.headers.set('Content-Type', 'application/json')
      });

    if (!req.url.includes('/Login') && !req.url.includes('inplayservice') && !req.url.includes('config.json')) {
      const user = JSON.parse(localStorage.getItem('token')); // Get token from some service
      if (user != null) {
        req = req.clone({
          headers: req.headers.append('Authorization', 'bearer ' + user.access_token)
        });
      }
    }
    if (!window.navigator.onLine) {
      // if there is no internet, throw a HttpErrorResponse error
      // since an error is thrown, the function will terminate here
      return throwError(new HttpErrorResponse({ error: 'Internet is required.' }));

  } else {
    return next.handle(req).pipe(
      map(resp => {
        // on Response
        if (resp instanceof HttpResponse) {
          // Do whatever you want with the response.
          return resp;
        }
      }),
      catchError(err => {
        // onError
        if (err instanceof HttpErrorResponse) {
          if (err.status === 401) {
            // redirect the user to login page
            // 401 unauthorised user
            if (!err.url.includes('/Login')) {
              const user = JSON.parse(localStorage.getItem('token')); // Get token from some service
              if (user != null) {
                this.storeService.clearStore();
              }
            }
          }
        }
        return throwError(err);
      })
    );
  }
  }
}
