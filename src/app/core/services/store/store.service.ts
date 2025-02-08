import { Injectable, Compiler } from '@angular/core';
import { Router } from '@angular/router';
import { Store, select } from '@ngrx/store';
import { ParkBetState } from '@clientApp-store/store.state';
import { ClearParkBetStore } from '@clientApp-store/store.meta-reducer';
import { SessionService } from './../session/session.service';
import { RemoveAllSelectedMarket } from '@clientApp-store/selected-market/actions/selected-market.actions';
import { take, catchError } from 'rxjs/operators';
import * as fromSelectedMarket from '@clientApp-store/selected-market/selectors/selected-market.selectors';
import { throwError } from 'rxjs';
import { ActiveMarket } from '@clientApp-core/models/market/activemarket.model';
import { setRoutesBasedOnRoles } from '../shared/routing.service';

@Injectable({
  providedIn: 'root'
})
export class StoreService  {
    constructor(private store: Store<ParkBetState>, private router: Router,
       private sessionService: SessionService, private _compiler: Compiler ) {}

    removeAllStoreData() {
        this.removeAllGroup();
        this.store.dispatch(RemoveAllSelectedMarket());
    }
    removeAllGroup() {
      const centralizationIds = this.getSelectedMarket().map(match => match.mc).toString();
      if (centralizationIds && centralizationIds !== '' && centralizationIds.length > 0 ) {
        this.sessionService.removeAllCentralGroup(centralizationIds);
      }
    }

  clearStore() {
        this.clearLocalStorage();
        this.resetRouting();
        this.store.dispatch(new ClearParkBetStore());
        this.router.navigateByUrl('/home');
        this._compiler.clearCache();
        this.closeAllModal();
      }

      stopHubConnections() {
        this.sessionService.stopHubConnections();
      }

      clearLocalStorage() {
        localStorage.removeItem('Deeplinked');
        localStorage.removeItem('token');
        localStorage.removeItem('casino'); 
        localStorage.removeItem('selected_matches');
        localStorage.removeItem('is_refreshed');
        localStorage.removeItem('showTandC');
        localStorage.removeItem('showVeronicaPopup');
        localStorage.removeItem('multiselected_matchIds');
        localStorage.removeItem('selectedSport');
        localStorage.removeItem('selected_betId');
        localStorage.removeItem('lobbyUrl');
        localStorage.removeItem('wid');
        localStorage.removeItem('showBonusPopup');
        localStorage.removeItem('showIpBlockedPopup');
        localStorage.removeItem('showWelcomePopup');
        localStorage.removeItem('showLowBalMsg');
        
      }
      private  getSelectedMarket(): ActiveMarket[] {
        let selectedMarkets: ActiveMarket[] ;
        this.store
        .pipe(select(fromSelectedMarket.getAllMarkets), take(1), catchError(err => throwError(err)))
        .subscribe(markets => selectedMarkets = markets, err => console.log('getSelectedMarket', err));
        return selectedMarkets;
      }
      closeAllModal () {
  }
  resetRouting() {
    let routerConfig = setRoutesBasedOnRoles();
    this.router.resetConfig(routerConfig);
  }
}
