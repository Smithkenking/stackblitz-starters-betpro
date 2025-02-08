import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CasinoGamesListComponent } from './casino-games-list.component';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '@clientApp-shared/shared.module';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { VeronicapopupComponent } from "../../shared/components/veronicapopup/veronicapopup.component";
import { FooterComponent } from "../../shared/components/footer/footer.component";
import { RightsidebarComponent } from "../../shared/components/rightsidebar/rightsidebar.component";
import { LiveCasinoGamesComponent } from "../../shared/components/live-casino-games/live-casino-games.component";

const routes: Routes = [{
  path: '', component: CasinoGamesListComponent
},{
  path: ':provider', component: CasinoGamesListComponent
},{
  path: ':provider/:game', component: CasinoGamesListComponent
  },
  {
    path: ':provider/:game/:type', component: CasinoGamesListComponent
  }];

@NgModule({
    declarations: [CasinoGamesListComponent],
    imports: [
    CommonModule,
    SharedModule,
    RouterModule.forChild(routes),
    InfiniteScrollModule,
    VeronicapopupComponent,
    FooterComponent,
    RightsidebarComponent,
    LiveCasinoGamesComponent
]
})
export class CasinoGamesListModule { }
