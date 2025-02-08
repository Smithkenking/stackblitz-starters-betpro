import { ActiveMarket } from '@clientApp-core/models/market/activemarket.model';
import { createAction, props } from '@ngrx/store';


const prefix = `[Selected.Market]`;

export const UpsertSelectedMarket = createAction(`${prefix} Upsert Selected Market Data`, props<{market: ActiveMarket}>());
export const RemoveSelectedMarket = createAction(`${prefix} Remove Selected Market Data`, props<{betId: number}>());
export const RemoveSelectedMarketByMatchId = createAction(`${prefix} Remove Many Market Data`, props<{betIds: string[]}>());
export const RemoveAllSelectedMarket = createAction(`${prefix} Remove All Selected Market Data`);



