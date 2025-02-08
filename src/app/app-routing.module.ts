import { NgModule } from '@angular/core';
import { RouterModule, ROUTES, Routes } from '@angular/router';
import { CustomPreloadingStrategyService } from '@clientApp-core/services/custom/custom-preloading-strategy.service';
import { AuthFacadeService } from '@clientApp-core/services/authentication/authentication-facade.service';
import { LocationStrategy, PathLocationStrategy } from '@angular/common';
import { appRoutes } from './app.routing';


@NgModule({
  imports: [ RouterModule.forRoot([],{
    useHash: true, enableTracing: false, scrollPositionRestoration: 'enabled',
    preloadingStrategy: CustomPreloadingStrategyService
}),],
  exports: [RouterModule],
  providers: [{provide: LocationStrategy, useClass: PathLocationStrategy},{
    provide: ROUTES,
    useFactory: setRoutesBasedOnRoles,
    deps: [AuthFacadeService],
    multi: true
  }] // {provide: LocationStrategy, useClass: PathLocationStrategy},
})
export class AppRoutingModule { }
function setRoutesBasedOnRoles() {
  let routes: Routes = appRoutes;
  return routes
}