import { Pipe, PipeTransform } from '@angular/core';
import { GameType } from '@clientApp-core/enums/market-fancy.type';
import { apiEndPointData } from '@clientApp-core/services/config/connfig.service';
import { getInplayMarkets, sortBySport } from '@clientApp-core/services/shared/JSfunction.service';
import { mapMarket, mapMarketWithSportbook } from '@clientApp-core/services/shared/dashboard-shared.service';
import { GetSortOrder, fancyRankOrder } from '@clientApp-core/utilities/app-configuration';

@Pipe({
  name: 'allInplayMarket',
  standalone: true
})
export class AllInplayMarketPipe implements PipeTransform {

  transform(allMarkets: any[],isVirtualMarkets: boolean): any {
    if (!allMarkets) {
      return allMarkets;
    }
    const excludeSports = apiEndPointData.data.excludeSports;
    let allmatches = allMarkets;
    if(isVirtualMarkets){
      allmatches = allMarkets.filter((x) => !excludeSports.includes(x.st) && x.gt == GameType.Virtual);
    } else {
      allmatches = allMarkets.filter((x) => !excludeSports.includes(x.st));
    }
    const InplayMarkets = getInplayMarkets(allmatches);
      const matches = mapMarketWithSportbook(InplayMarkets.sort((a, b) => {
        return fancyRankOrder.get(b.mt) - fancyRankOrder.get(a.mt);
      }).sort(GetSortOrder('ed')));
    return sortBySport(matches);
  }

}
