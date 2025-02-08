import { Pipe, PipeTransform } from '@angular/core';
import { GameType } from '@clientApp-core/enums/market-fancy.type';
import { arrayUniqueByKey, getInplayMarkets } from '@clientApp-core/services/shared/JSfunction.service';
import { getUpcomingMarkets } from '@clientApp-core/services/shared/dashboard-shared.service';

@Pipe({
  name: 'upComingMarkets',
  standalone: true
})
export class UpComingMarketsPipe implements PipeTransform {

  transform(allMarkets: any[], selectedSport: string,selectedTournament: string,upType: string, isVirtualMarkets: boolean): any {
    if (!allMarkets || !selectedSport) {
      return allMarkets;
    }
    let allmatches = allMarkets;
    if(isVirtualMarkets){
      allmatches = allMarkets.filter((x) => x.gt == GameType.Virtual);
    } else {
      allmatches = allMarkets.filter((x) => x.gt == GameType.Real);
    }
    const filterData = allmatches.filter(x => x.st === selectedSport);
    const inPlayMarkets = getInplayMarkets(filterData);
    const uniqinPlayMarkets = arrayUniqueByKey(inPlayMarkets, 'eid');
     let  upcomingMarkets = filterData.filter(function (o1) {
      return !uniqinPlayMarkets.some(function (o2) {
        return o1.eid === o2.eid
      });
    });
    upcomingMarkets = arrayUniqueByKey(upcomingMarkets, 'eid');
    // if (selectedTournament !== null && selectedTournament !== 'All Tournament') {
    //   upcomingMarkets = upcomingMarkets.filter(x => x.tn == selectedTournament);
    // }
    return  getUpcomingMarkets(upcomingMarkets, 0, upType);
  }
}
