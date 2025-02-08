import { Component, OnInit, } from '@angular/core';
import { AuthFacadeService, GuestMLConfig } from '@clientApp-core/services/authentication/authentication-facade.service';
import { fancyRankOrder, GetSortOrder } from '@clientApp-core/utilities/app-configuration';
import { catchError } from 'rxjs/operators';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
declare var $: any;
@Component({
  selector: 'app-dashboard-login',
  templateUrl: './dashboard-login.component.html',
  styleUrls: ['./dashboard-login.component.scss']
})
export class DashboardLoginComponent implements OnInit {
  allMatches: any = [];
  private _marketSubject = new BehaviorSubject<boolean>(null);
  constructor(private authService: AuthFacadeService) {
     }

  ngOnInit(): void {
    const allMatches = GuestMLConfig.data.allActiveMarketList ? GuestMLConfig.data.allActiveMarketList : [];
    this.allMatches = allMatches.sort((a, b) => {
      return fancyRankOrder.get(b.mt) - fancyRankOrder.get(a.mt);
    }).sort(GetSortOrder('ed'));
    if (this.allMatches.length > 0) {
      this._marketSubject.next(true);
    }
    this.getGuestMLConfig();
  }
  getGuestMLConfig() {
    this.authService.getMarketConfig$().pipe(catchError(err => throwError(err))).subscribe((response: any) => {
      if (response) {
        this.allMatches = response.allActiveMarketList.sort((a, b) => {
            return fancyRankOrder.get(b.mt) - fancyRankOrder.get(a.mt);
        }).sort(GetSortOrder('ed'));
        this._marketSubject.next(true);
      }
    }, err => console.log('getGuestMLConfig', err));
  }

  getCurrentMarket$(): Observable<boolean> {
    return this._marketSubject.asObservable();
  }
  ngOnDestroy() {
    localStorage.removeItem('loginShowVeronicaPopup');
  }
}
