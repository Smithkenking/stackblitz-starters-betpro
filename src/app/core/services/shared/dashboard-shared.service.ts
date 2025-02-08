import { Injectable } from '@angular/core';
import { CasinoService } from '../casino/casino.service';
import { CommonService } from '../common/common.service';
import { AppInjector } from 'app/app-injector';
import { mapappMatch, mapGroupByKey, arrayUniqueByKey, sumByKey } from './JSfunction.service';
import { GetSortOrder } from '@clientApp-core/utilities/app-configuration';
import { FanceType } from '@clientApp-core/enums/market-fancy.type';

@Injectable({
  providedIn: 'root'
})
export class DashboardSharedService   {
  constructor() { } 
}

export function mapLiability(markets) {
  let group = mapGroupByKey(markets, 'eid');
  return Object.keys(group).map(key => ({
        liability: group[key],
        totalLiability: sumByKey(group[key], 'appLiability'),
        appDate: group[key][0]['ed'],
        appSport: group[key][0]['st'],
        appTournament: group[key][0]['tn'],
        appMatch: group[key][0]['en'],
        appbetname: group[key][0]['mn']
  }));
}
export function mapMarket(markets) {
  const uniqueMarkets = arrayUniqueByKey(markets, 'eid');
  let group = mapGroupByKey(uniqueMarkets, 'st');
  return Object.keys(group).map(key => ({
                sport: key,
                matches: group[key]
        }));
}
export function mapMarketWithSportbook(markets) {
  const uniqueMarkets = arrayUniqueByKey(markets, 'eid');
  // let group = mapGroupByKey(uniqueMarkets, 'st');
  let group = mapGroupByMultiKeys(uniqueMarkets.filter(x=>x.gt != null),['st', 'gt'])
  return Object.keys(group).map(key => ({
                sport: splitfun(key),
                type: findtype(key),
                matches: sortSportbookMarket(group[key])
        }));
}
export function splitfun(key){
return key.split('-')[0]
}
export function findtype(key){
  const str =key.split('-')[1];
  if(str == '2'){
    return 'Virtual'
  } else {
    return 'Real'
  }
  }
  export function mapGroupByMultiKeys(array,keys) {
    return array.reduce((objectsByKeyValue, obj) => {
        const value = keys.map(key => obj[key]).join('-');
        objectsByKeyValue[value] = (objectsByKeyValue[value] || []).concat(obj);
        return objectsByKeyValue;
      }, {});
  }
  export function sortSportbookMarket(markets) {
    const result = markets.reduce((r, o) => {
      r[o.mt == FanceType.Virtual ? 'sportsbookMarkets' : 'allMarkets'].push(o);
      return r;
    }, { sportsbookMarkets: [], allMarkets: [] });
    return result.allMarkets.concat(result.sportsbookMarkets);
  }
export function leftSidebarMapMarket(markets) {
  let group = mapGroupByKey(markets, 'st');
  return Object.keys(group).map(key => ({
                sport: key,
                matches: group[key]
        }));
}
export function mapMatch(markets) {
  let group = mapGroupByKey(markets, 'en');
  return Object.keys(group).map(key => ({
                name: key,
                values: group[key]
        }));
}
export function mapMarketTorunaments(markets) {
  let group = mapGroupByKey(markets, 'st');
  return Object.keys(group).map(key => ({
                sport: key,
                appTournament: group[key]
        }));
}
export function appTournament(markets) {
  let tournamentGroup = mapGroupByKey(markets, 'tn');
  return  Object.keys(tournamentGroup).map(key => ({
                tournamentName: key,
                matches: mapappMatch(tournamentGroup[key])
  }));
}
export function appTournamentList(markets) {
  let tournamentGroup = mapGroupByKey(markets, 'tn');
  return  Object.keys(tournamentGroup).map(key => ({
                tournamentName: key,
  }));
}

export function onCasinoGameClickEvent(param) {
  const commonService = AppInjector.get(CommonService);
  commonService.setLoadingStatus(true);
  const casinoService = AppInjector.get(CasinoService);
  casinoService.getCasinoToken(param);
  let selectedCasino = [];
  const CasinoObj = new Object({
    id:param.angularCasinoGameId,
    type:'Casino',
    date: new Date()
  });
  if (commonService.getCookieValue('selected_match_name')) {
    var getCasinoCookie = JSON.parse(commonService.getCookieValue('selected_match_name'));
  }

  if (getCasinoCookie != null) {
    selectedCasino = getCasinoCookie;
  }

  selectedCasino.push(CasinoObj);
  commonService.setCookieValue('selected_match_name', JSON.stringify(selectedCasino));
  }

export function getUpcomingMarkets(data, sportId, upType) {
  // const upcomingEvents = data.filter((v) => !v.mi);
  const upcomingEvents = data;
  let upcomingCountMarkets = [], uniqueMarkets = [];
  if (upType == 'All') {
    upcomingCountMarkets = upcomingEvents;
    // upcomingCountMarkets = upcomingEvents.filter(function (e) {
    //   var d1 = new Date();
    //   var d3 = new Date(e.ed);
    //   return d1.getTime() <= d3.getTime();
    // });

  } else if (upType == '1h') {
    upcomingCountMarkets = upcomingEvents.filter(function (e) {
      var fromD = new Date();
      var toD = new Date((new Date().getTime()) + 1 * 60 * 60 * 1000);
      var d3 = new Date(e.ed);
      return d3.getTime() >= fromD.getTime() &&
        d3.getTime() <= toD.getTime();
    });
  } else if (upType == '2h') {
    upcomingCountMarkets = upcomingEvents.filter(function (e) {
      var fromD = new Date();
      var toD = new Date((new Date().getTime()) + 2 * 60 * 60 * 1000);
      var d3 = new Date(e.ed);
      return d3.getTime() >= fromD.getTime() &&
        d3.getTime() <= toD.getTime();
    });
  } else if (upType == '3h') {
    upcomingCountMarkets = upcomingEvents.filter(function (e) {
      var fromD = new Date();
      var toD = new Date((new Date().getTime()) + 3 * 60 * 60 * 1000);
      var d3 = new Date(e.ed);
      return d3.getTime() >= fromD.getTime() &&
        d3.getTime() <= toD.getTime();
    });
  } else if (upType == '6h') {
    upcomingCountMarkets = upcomingEvents.filter(function (e) {
      var fromD = new Date();
      var toD = new Date((new Date().getTime()) + 6 * 60 * 60 * 1000);
      var d3 = new Date(e.ed);
      return d3.getTime() >= fromD.getTime() &&
        d3.getTime() <= toD.getTime();
    });
  } else if (upType == '12h') {
    upcomingCountMarkets = upcomingEvents.filter(function (e) {
      var fromD = new Date();
      var toD = new Date((new Date().getTime()) + 12 * 60 * 60 * 1000);
      var d3 = new Date(e.ed);
      return d3.getTime() >= fromD.getTime() &&
        d3.getTime() <= toD.getTime();
    });
  } else if (upType == 'Today') {
    upcomingCountMarkets = upcomingEvents.filter(function (e) {
      var d1 = new Date();
      var d3 = new Date(e.ed);
      return d1.getDate() == d3.getDate() &&
        d1.getMonth() == d3.getMonth() &&
        d1.getFullYear() == d3.getFullYear();
    });
  } else if (upType == 'Tomorrow') {
    upcomingCountMarkets = upcomingEvents.filter(function (e) {
      var d1 = new Date();
      var d3 = new Date(e.ed);
      return d1.getDate() + 1 == d3.getDate()  &&
        d1.getMonth() == d3.getMonth() &&
        d1.getFullYear() == d3.getFullYear();
    });
  }
  uniqueMarkets = arrayUniqueByKey(upcomingCountMarkets, 'eid');
  return uniqueMarkets.sort(GetSortOrder('ed'));
}
