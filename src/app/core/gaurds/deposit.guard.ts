import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DepositGuard  {
  constructor(private _router: Router){}
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
      
      const transactionId = localStorage.getItem('transactionId');
      const stransactionId = localStorage.getItem('stransactionId');
      if (transactionId != null || stransactionId != null) {
        return true;
      } else{
        this._router.navigateByUrl('/home');
        return false;
      }
    
  }
  
}
