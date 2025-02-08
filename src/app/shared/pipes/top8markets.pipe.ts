import { Pipe, PipeTransform } from '@angular/core';
import { FanceType } from '@clientApp-core/enums/market-fancy.type';
import { arrayUniqueByKey, getInplayMarkets } from '@clientApp-core/services/shared/JSfunction.service';
import { GetSortOrder } from '@clientApp-core/utilities/app-configuration';

@Pipe({
  name: 'top8markets',
  standalone: true
})
export class Top8marketsPipe implements PipeTransform {

  transform(allMarkets: any[], selectedSport: string): any {
    if (!allMarkets || !selectedSport) {
      return allMarkets;
    }

    const filterData = allMarkets.filter(x => x.st === selectedSport);
    const inPlayMarkets = getInplayMarkets(filterData).sort(GetSortOrder('ed'));
    const result = inPlayMarkets.reduce((r, o) => {
      r[o.mt == FanceType.Virtual ? 'sportsbookMarkets' : 'allMarkets'].push(o);
      return r;
    }, { sportsbookMarkets: [], allMarkets: [] });
     const uniqinPlayMarkets = arrayUniqueByKey(result.allMarkets.concat(result.sportsbookMarkets), 'eid');
     let  upcomingMarkets = filterData.filter(function (o1) {
      return !uniqinPlayMarkets.some(function (o2) {
        return o1.eid === o2.eid
      });
    }).sort(GetSortOrder('ed'));
    const result1 = upcomingMarkets.reduce((r, o) => {
      r[o.mt == FanceType.Virtual ? 'sportsbookMarkets' : 'allMarkets'].push(o);
      return r;
    }, { sportsbookMarkets: [], allMarkets: [] });
    upcomingMarkets = arrayUniqueByKey(result1.allMarkets.concat(result1.sportsbookMarkets), 'eid');
    const top8Inplay = uniqinPlayMarkets.slice(0,8);
    const top8Upcoming = upcomingMarkets.slice(0,8);
    const concatArray = top8Inplay.concat(top8Upcoming);   
    return  concatArray.slice(0,8);
  }

}
