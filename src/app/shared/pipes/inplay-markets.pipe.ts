import { Pipe, PipeTransform } from '@angular/core';
import { FanceType, GameType } from '@clientApp-core/enums/market-fancy.type';
import { arrayUniqueByKey, getInplayMarkets } from '@clientApp-core/services/shared/JSfunction.service';
import { GetSortOrder } from '@clientApp-core/utilities/app-configuration';

@Pipe({
  name: 'inplayMarkets',
  standalone: true
})
export class InplayMarketsPipe  implements PipeTransform {

  transform(allMarkets: any[], selectedSport: string,selectedTournament: string,isVirtualMarkets: boolean): any {
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
    let inPlayMarkets = getInplayMarkets(filterData.sort(GetSortOrder('ed')));
    const result1 = inPlayMarkets.reduce((r, o) => {
      r[o.mt == FanceType.Virtual ? 'sportsbookMarkets' : 'allMarkets'].push(o);
      return r;
    }, { sportsbookMarkets: [], allMarkets: [] });
    inPlayMarkets = arrayUniqueByKey(result1.allMarkets.concat(result1.sportsbookMarkets), 'eid');
    if (selectedTournament !== null && selectedTournament !== 'All Tournament') {
      inPlayMarkets = inPlayMarkets.filter(x => x.tn == selectedTournament);
    }
    return inPlayMarkets;
  }

}