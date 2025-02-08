import { Pipe, PipeTransform } from '@angular/core';
import { FanceType } from '@clientApp-core/enums/market-fancy.type';
import { ActiveMarket } from '@clientApp-core/models/market/activemarket.model';
import { websiteSettings } from '@clientApp-core/services/authentication/authentication-facade.service';
import { apiEndPointData } from '@clientApp-core/services/config/connfig.service';

@Pipe({
  name: 'checkIsInPlay',standalone: true
})
export class CheckInplayTypePipe implements PipeTransform {
  transform(value: any[], matchId: number): boolean {
    const user = JSON.parse(localStorage.getItem('token'));
    let marketCategoryWiseInplay: any;
    if (user == null || user == undefined || user == '') {
      marketCategoryWiseInplay = apiEndPointData.data ? apiEndPointData.data.mcwi  : [];
    } else {
      marketCategoryWiseInplay = websiteSettings.data ? websiteSettings.data.marketCategoryWiseInplay : apiEndPointData.data ? apiEndPointData.data.mcwi  : [];
    }
    const array = marketCategoryWiseInplay.split(',');
    const result = value.filter((market) => {
      if(array.includes(market.mscd.toString())){
        return market.eid === matchId && market.mi
      }
    });
    return result.length > 0 ? true : false;
  }
}
