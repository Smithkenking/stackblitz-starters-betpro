import { Pipe, PipeTransform } from '@angular/core';
import { arrayUniqueByKey } from '@clientApp-core/services/shared/JSfunction.service';

@Pipe({
  name: 'tournament',
  standalone: true
})
export class TournamentPipe implements PipeTransform {

  transform(allMarkets: any[], selectedSport: string): any {
    if (!allMarkets || !selectedSport) {
      return allMarkets;
    }
    const filterData = allMarkets.filter(x => x.st === selectedSport);
    return arrayUniqueByKey(filterData, 'tn').map(match => match.tn);;
  }

}
