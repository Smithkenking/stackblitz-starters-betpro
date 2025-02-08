import { Pipe, PipeTransform } from '@angular/core';
import { ActiveMarket } from '@clientApp-core/models/market/activemarket.model';

@Pipe({name: 'checkFancyType', standalone: true})
export class CheckFancyTypePipe implements PipeTransform {
    transform(value: ActiveMarket[], matchId: number, fancyType: number): any {
       const result = value.filter((market) => {
        return market.eid === matchId && market.mt === fancyType;
       });
        return result.length;
    }
}
