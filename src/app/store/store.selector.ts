import { ParkBetState } from '@clientApp-store/store.state';
import { createFeatureSelector } from '@ngrx/store';

export const selectParkBetState = createFeatureSelector<ParkBetState>('ParkBetState');
