import { BaseSerializer } from '@clientApp-core/serializers/base/base.serializer';



export class LiabilitySerializer implements BaseSerializer {
    fromJson(data: any): any {
        let market:any = {};
        market.mid = data.appBetID;
        market.st = data.appSport;
        market.tn = data.appTournament;
        market.en = data.appMatch;
        market.mn = data.appbetname;
        market.si = data.appsportid;
        market.tid = data.appTournamentID;
        market.eid = data.appMatchID;
        market.ed = data.appDate;
        market.mc = data.appcentralizationid;
        market.mt = data.appFancyType;
        market.eb = data.appeventid_bf;
        market.appLiability = data.appLiability;
        return market;
    }
    toJson(): any {
        return {
        };
    }
}
