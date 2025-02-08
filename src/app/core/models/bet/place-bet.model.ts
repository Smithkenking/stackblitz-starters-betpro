import { FanceType } from '@clientApp-core/enums/market-fancy.type';


export class PlaceBet {
    clientId: number;
    betId:  number;
    betDetailId:  number;
    isBack: boolean;
    rate:  number;
    stake:  number;
    fancyType: FanceType;
    point: number;
    placeFrom: number;
    deviceinfo: string;
    isJodiRates: boolean;
    walletId: number;
    isWager: boolean;
}
