import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { AuthFacadeService, websiteSettings } from '@clientApp-core/services/authentication/authentication-facade.service';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class Isb2cuserGuard  {
  constructor(private _authService: AuthFacadeService) {
  }
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    const isB2CUser: boolean = websiteSettings.data.isB2C;
    if (websiteSettings.data !== null && websiteSettings.data !== undefined && websiteSettings.data !== '') {
      return isB2CUser ? true : false;
    } else {
      return this._authService.getConfiguration().
      pipe(
        map((data:any) => {
          const isB2CUser: boolean = websiteSettings.data.isB2C;
          return isB2CUser ? true : false;
        }),
        catchError(err => {
           console.log('getConfiguration : ', err);
           return throwError(err);
        })
      );
    }
    
  }
  
}
