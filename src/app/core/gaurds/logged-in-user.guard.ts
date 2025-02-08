import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { AuthFacadeService } from '@clientApp-core/services/authentication/authentication-facade.service';
import { StoreService } from '@clientApp-core/services/store/store.service';
import { SessionService } from '@clientApp-core/services/session/session.service';
import { MarketFacadeService } from '@clientApp-core/services/market/market-facade.service';

@Injectable({
  providedIn: 'root'
})

export class LoggedInUserGuard  {
  constructor(private _authService: AuthFacadeService, private _router: Router,
    private storeService: StoreService,private sessionService: SessionService,private marketFacadeService: MarketFacadeService) {
  }

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    const user = JSON.parse(localStorage.getItem('token'));
    if (user != null) {
      return this._authService.IsAuthorized$().
        pipe(
          map((data: any) => {
            if (data.isAuthorized) {
              if (data.isNewToken) {
                const user = JSON.parse(localStorage.getItem('token'));
                if (user != null) {
                  user.access_token = data.token;
                  user.expireOn = data.expireOn;
                  localStorage.setItem('token', JSON.stringify(user));
                }
              }
              this.marketFacadeService.getMarkets();
              this.sessionService.startCentralSignalrConnections();
              this.sessionService.connectCentralHubConnection();
              this.sessionService.startMarketSignalrConnections();
              this.sessionService.connectMarketHubConnection();
              return true;
            } else { this.storeService.clearStore(); return false; }
          }),
          catchError(err => {
            this.storeService.clearStore();
            console.log('LoggedInUserGuard : ', err);
            return throwError(err);
          })
        );
    } else {
          this._router.navigate(['/home'], {
            skipLocationChange: true,
          });
      return false;
    }
  }
}
