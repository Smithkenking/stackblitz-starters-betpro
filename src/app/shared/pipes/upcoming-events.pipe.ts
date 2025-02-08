import { Pipe, PipeTransform } from '@angular/core';
import { apiEndPointData } from '@clientApp-core/services/config/connfig.service';
import { arrayUniqueByKey, getInplayMarkets, sortBySport } from '@clientApp-core/services/shared/JSfunction.service';
import { getUpcomingMarkets, mapMarket } from '@clientApp-core/services/shared/dashboard-shared.service';
import { GetSortOrder, fancyRankOrder } from '@clientApp-core/utilities/app-configuration';

@Pipe({
  name: 'upcomingEvents',
  standalone: true
})
export class UpcomingEventsPipe implements PipeTransform {

  transform(allMarkets: any[], selectedCount: any): any {
    if (!allMarkets) {
      return allMarkets;
    }
    const excludeSports = apiEndPointData.data.excludeSports;
    const excludeSport = excludeSports.map(x => x.name);
    const allMatches = allMarkets.filter((x) => !excludeSport.includes(x.st))
    const inPlayMarkets = getInplayMarkets(allMatches);
    const uniqinPlayMarkets = arrayUniqueByKey(inPlayMarkets, 'eid');
     let  notlivemarkets = allMatches.filter(function (o1) {
      return !uniqinPlayMarkets.some(function (o2) {
        return o1.eid === o2.eid
      });
    });
    notlivemarkets = arrayUniqueByKey(notlivemarkets, 'eid');
    const upcomingMarkets = getUpcomingMarkets(notlivemarkets, 0, selectedCount);
    const upcomingMatches = mapMarket(upcomingMarkets.sort((a, b) => {
      return fancyRankOrder.get(b.mt) - fancyRankOrder.get(a.mt);
    }).sort(GetSortOrder('ed')));
    return sortBySport(upcomingMatches);
  }

}
