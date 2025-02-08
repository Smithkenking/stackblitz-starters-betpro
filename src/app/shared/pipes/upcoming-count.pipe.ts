import { Pipe, PipeTransform } from '@angular/core';
import { ActiveMarket } from '@clientApp-core/models/market/activemarket.model';
import { arrayUniqueByKey, getInplayMarkets } from '@clientApp-core/services/shared/JSfunction.service';
import { getUpcomingMarkets } from '@clientApp-core/services/shared/dashboard-shared.service';

@Pipe({
  name: 'upcomingCount',
  standalone: true
})
export class UpcomingCountPipe implements PipeTransform {

  transform(value: ActiveMarket[],selectedSport: string,selectedTournament: string, sportId: number, upType: any): any {
    // const filterData = value.filter(x => x.st === selectedSport);
    const inPlayMarkets = getInplayMarkets(value);
    const uniqinPlayMarkets = arrayUniqueByKey(inPlayMarkets, 'eid');
     let  notlivemarkets = value.filter(function (o1) {
      return !uniqinPlayMarkets.some(function (o2) {
        return o1.eid === o2.eid
      });
    });
    notlivemarkets = arrayUniqueByKey(notlivemarkets, 'eid');
    // if (selectedTournament !== null && selectedTournament !== 'All Tournament') {
    //   upcomingMarkets = upcomingMarkets.filter(x => x.tn == selectedTournament);
    // }
    const upcomingEvents = getUpcomingMarkets(notlivemarkets, sportId, upType);
    return upcomingEvents.length;
  }

}