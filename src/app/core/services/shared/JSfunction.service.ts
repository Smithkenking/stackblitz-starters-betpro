import { Injectable } from '@angular/core';
import { FanceType } from '@clientApp-core/enums/market-fancy.type';
import { ActiveMarket } from '@clientApp-core/models/market/activemarket.model';
import { GuestMLConfig, websiteSettings } from '../authentication/authentication-facade.service';
import { apiEndPointData } from '../config/connfig.service';
import { GetSortOrder } from '@clientApp-core/utilities/app-configuration';

@Injectable({
  providedIn: 'root'
})
export class JSfunctionService {
  constructor() { }
}

export function mapappMatch(matches) {
  let matchesGroup = mapGroupByKey(matches, 'en');
  return  Object.keys(matchesGroup).map(key => ({
    name: key,
    values: matchesGroup[key]
  }));
}
export function mapSportCount(markets, allMarkets? : any) {
  let group = mapGroupByKey(markets, 'st');
  return Object.keys(group).map(key => ({
                sport: key,
                count: group[key].length,
                inPlayCount: arrayUniqueByKey(getInplayMarkets(allMarkets.filter(a => a.st == key)), 'eid').length
          }));

}
export function arrayUniqueByKey(array: any[], key: string) {
   return [...new Map(array.map(item =>
            [item[key], item])).values()];
}
export function mapUniqueData (array: any[], key: string) {
  return [...new Set(array.map(item => item[key]))]
}
export function mapGroupByKey(array: any[], key: string) {
        return  array.reduce((r, a) => {
                  r[a[key]] = [...r[a[key]] || [], a];
                  return r;
                }, {});
}
export function sumByKey(array: any[], key: string) {
 return array.reduce(function(sum, current) {
    return sum + current[key];
  }, 0)
}
export function unionByMatchId(array1: any[], array2: any[]) {
  return array2.concat(array1).filter(function(o) {  
    return this[o.eid] ? false : this[o.eid] = true;
  }, {});
}
export function unionByBetDetailID(array1: any[], array2: any[]) {
  return array2.concat(array1).filter(function(o) {  
    return this[o.rid] ? false : this[o.rid] = true;
  }, {});
}
export function unionByBetId(array1: any[], array2: any[]) {
  return array2.concat(array1).filter(function(o) {  
    return this[o.mid] ? false : this[o.mid] = true;
  }, {});
}
export function sortBySport(array: any[]) {
  const user = JSON.parse(localStorage.getItem('token'));
  let item_order = ["Football","Tennis","Cricket"];
  var sportList = user != null ? (websiteSettings.data.sportList ? websiteSettings.data.sportList : []) : (GuestMLConfig.data.sportList ? GuestMLConfig.data.sportList : []);
  const allsportName = sportList.sort(GetSortOrder('dor')).map((v) => v.st);
  if (allsportName && allsportName.length > 0) {
    item_order = allsportName.reverse();
  }
  return array.sort((a, b) => item_order.indexOf(b.sport) - item_order.indexOf(a.sport));
}

export function getInplayMarkets(allMarkets: ActiveMarket[]) {
  const user = JSON.parse(localStorage.getItem('token'));
  let websitesettings: any, filterdArr = [];
  let marketCategoryWiseInplay: any;
  if (user == null || user == undefined || user == '') {
    marketCategoryWiseInplay = apiEndPointData.data ? apiEndPointData.data.mcwi  : [];
  } else {
    marketCategoryWiseInplay = websiteSettings.data ? websiteSettings.data.marketCategoryWiseInplay : apiEndPointData.data ? apiEndPointData.data.mcwi  : [];
  }
  const array = marketCategoryWiseInplay.split(',');
  filterdArr = allMarkets.filter((market) => {
    if(array.includes(market.mscd.toString())){
      return market.mi
    }
  });
  return filterdArr;
}
export function mapUniqueDates(array: any[], key: string) {
  return [...new Map(array.map(item =>
           [ new Date(item[key]).toDateString(), item])).values()];
}
