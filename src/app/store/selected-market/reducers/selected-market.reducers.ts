import { marketAdapter } from '@clientApp-store/selected-market/state/selected-market.state';
import { SelectedMarketState } from '../state/selected-market.state';
import { Action, createReducer, on } from '@ngrx/store';
import * as featureActions from '@clientApp-store/selected-market/actions/selected-market.actions';

export const initialState: SelectedMarketState = marketAdapter.getInitialState({
  selectedMarketId: null,
});
const selectedReducer = createReducer(
  initialState,
  on(featureActions.UpsertSelectedMarket, (state, { market }) => {
    return marketAdapter.upsertOne(market, state);
  }),
  on(featureActions.RemoveSelectedMarket, (state, { betId }) => {
    return marketAdapter.removeOne(betId, state);
  }),
  on(featureActions.RemoveSelectedMarketByMatchId, (state, { betIds }) => {
    return marketAdapter.removeMany(betIds, state);
  }),
  on(featureActions.RemoveAllSelectedMarket, state => {
    return marketAdapter.removeAll({ ...state});
  })
);
export function reducer(state: SelectedMarketState | undefined, action: Action) {
  return selectedReducer(state, action);
}
