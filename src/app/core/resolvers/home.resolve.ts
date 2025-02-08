import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';
import { MarketFacadeService } from '@clientApp-core/services/market/market-facade.service';
import { take } from 'rxjs/operators';

@Injectable()
export class HomeResolve  {
  alreadyResolved = false;

  constructor(private marketFacadeService: MarketFacadeService) { }
  resolve(route: ActivatedRouteSnapshot): boolean  {
    this.marketFacadeService.getMarkets();
    this.marketFacadeService.getMarkets$().pipe(take(1))
    .subscribe(markets => {
      if (markets && markets.length > 0) {
       this.alreadyResolved = true;
      } else {
        this.alreadyResolved = false;
      }
    });
    if (this.alreadyResolved) {
      return true;
    } else {
      return false;
    }
  }
}
