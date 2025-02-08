import { ParkBetState } from '@clientApp-store/store.state';
import {  createSelector } from '@ngrx/store';
import { selectParkBetState } from '@clientApp-store/store.selector';

import * as fromMarket from '@clientApp-store/selected-market/state/selected-market.state';

export const selectedMarketState = createSelector(
  selectParkBetState,
    (state: ParkBetState) => state.selectedMarket
  );

  export const getSelectedMarketsId = createSelector(selectedMarketState, fromMarket.getSelectedId);

  export const {
    selectIds: getMarketIds,
    selectEntities: getMarketEntities,
    selectAll: getAllMarkets,
    selectTotal: getTotalMarkets,
  } = fromMarket.marketAdapter.getSelectors(selectedMarketState);

  export const getSelectedMarkets = createSelector(
    getMarketEntities,
    getSelectedMarketsId,
    (entities, selectedId) => {
      return selectedId && entities[selectedId];
    }
  );

  export const getMarketRunnerById = (betId: number) => createSelector(
    getMarketEntities,
    (entities) => {
      return entities[betId];
    }
  );

