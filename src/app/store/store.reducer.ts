import { ActionReducerMap } from '@ngrx/store';
import { ParkBetState } from '@clientApp-store/store.state';
import * as fromselectedReducer from './selected-market/reducers/selected-market.reducers';

export const parkBetReducers: ActionReducerMap<ParkBetState> = {
  selectedMarket: fromselectedReducer.reducer,
};
