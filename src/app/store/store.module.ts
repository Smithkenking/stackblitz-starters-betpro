import { NgModule, ModuleWithProviders } from '@angular/core';
import { StoreModule } from '@ngrx/store';
import { parkBetReducers } from '@clientApp-store/store.reducer';
import { logger, clearStore } from '@clientApp-store/store.meta-reducer';

@NgModule({
  imports: [
    StoreModule.forFeature('ParkBetState', parkBetReducers, {
      metaReducers: [
        logger,
        clearStore
      ]
    }),
  ],
  declarations: []
})

export class ParkBetStoreModule {
  static forRoot(): ModuleWithProviders<RootParkBetModule> {
    return {
      ngModule: RootParkBetModule,
      providers: [],
    };
  }
}

export class RootParkBetModule { }
