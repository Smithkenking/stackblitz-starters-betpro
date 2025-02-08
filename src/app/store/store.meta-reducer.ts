import { ParkBetState } from '@clientApp-store/store.state';
import { ActionReducer} from '@ngrx/store';
import { environment } from 'environments/environment';


export function clearStore(reducer: ActionReducer<any>): ActionReducer<any> {
    return function(state: ParkBetState, action: any): ParkBetState {
        return reducer(action.type === 'LOG_OUT' ? undefined : state, action);
    };
}

export class ClearParkBetStore {
    readonly type = 'LOG_OUT';
    payload = null;
}

export function logger(reducer: ActionReducer<any>): ActionReducer<any> {
    return function(state: ParkBetState, action: any): ParkBetState {
        if (environment.name !== 'prod') {
            console.groupCollapsed(action.type);
            console.log('state', state);
            console.log('action', action);
            console.groupEnd();
        }
        return reducer(state, action);
    };
}
