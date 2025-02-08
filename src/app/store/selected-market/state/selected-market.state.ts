
import { ActiveMarket } from '@clientApp-core/models/market/activemarket.model';
import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';

export interface SelectedMarketState extends EntityState<ActiveMarket> {
 selectedMarketId: string | null;
}

export const marketAdapter: EntityAdapter<ActiveMarket> = createEntityAdapter<ActiveMarket>({
    selectId: (market: ActiveMarket) => market.mid,
    sortComparer: false,
  });


  export const initialState: SelectedMarketState = marketAdapter.getInitialState({
    selectedMarketId: null,
  });

export const getSelectedId = (state: SelectedMarketState) => state.selectedMarketId;

