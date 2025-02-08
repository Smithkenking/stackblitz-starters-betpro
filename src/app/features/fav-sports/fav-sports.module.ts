import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FavSportsComponent } from './fav-sports.component';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '@clientApp-shared/shared.module';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { TopContentComponent } from "../../shared/components/top-content/top-content.component";
import { RightsidebarComponent } from "../../shared/components/rightsidebar/rightsidebar.component";
import { FooterComponent } from "../../shared/components/footer/footer.component";
import { CheckInplayTypePipe } from "../../shared/pipes/check-inplay-type.pipe";
import { CheckFancyTypePipe } from "../../shared/pipes/check-fancy-type.pipe";
import { OrdinalDatePipe } from "../../shared/pipes/ordinal-date.pipe";
import { splitVSPipe } from "../../shared/pipes/split.pipe";
import { EventShortnamePipe } from "../../shared/pipes/event-shortname.pipe";
import { SportsIconPipe } from "../../shared/pipes/sports-icon.pipe";
import { HighlightDirective } from '@clientApp-shared/directive/highlight.directive';
import { MultiPinDirective } from '@clientApp-shared/directive/multipin.directive';
import { FavouritecasinoDirective } from '@clientApp-shared/directive/favouritecasino.directive';
import { IstToPktPipe } from "../../shared/pipes/ist-to-pkt.pipe";

const routes: Routes = [{
  path: '', component: FavSportsComponent
}];

@NgModule({
    declarations: [
        FavSportsComponent
    ],
    imports: [
    CommonModule,
    SharedModule,
    RouterModule.forChild(routes),
    InfiniteScrollModule,
    TopContentComponent,
    RightsidebarComponent,
    FooterComponent,
    CheckInplayTypePipe,
    CheckFancyTypePipe,
    OrdinalDatePipe,
    splitVSPipe,
    EventShortnamePipe,
    SportsIconPipe,
    HighlightDirective,
    MultiPinDirective,
    FavouritecasinoDirective,
    IstToPktPipe
]
})
export class FavSportsModule { }
