import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MarketComponent } from './market.component';
import { SharedModule } from '@clientApp-shared/shared.module';
import { RouterModule, Routes } from '@angular/router';
import { MatchComponent } from './components/match.component';
import { MarketTypeComponent } from './components/types/market-type/market-type.component';
import { MarketBetDetailsComponent } from './components/types/market-type/market-bet-details/market-bet-details.component';
import { AdvanceSessionTypeComponent } from './components/types/advance-session-type/advance-session-type.component';
import { AdvanceSessionBetDetailsComponent } from './components/types/advance-session-type/advance-session-bet-details/advance-session-bet-details.component';
import { MatchBetComponent } from './match-bet/match-bet.component';
import { UnmatchBetComponent } from './unmatch-bet/unmatch-bet.component';
import { MarketPlaceBetViewsComponent } from './place-bet-views/market-place-bet-views/market-place-bet-views.component';
import { SessionPlaceBetViewsComponent } from './place-bet-views/session-place-bet-views/session-place-bet-views.component';
import { BetPanelLayoutComponent } from './bet-panel-layout/bet-panel-layout.component';
import { PlacebetCountdownComponent } from './placebet-countdown/placebet-countdown.component';
import { SessionTypeComponent } from './components/types/session-type/session-type.component';
import { SportbookTypeComponent } from './components/types/sportbook-type/sportbook-type.component';
import { SportbookBetDetailsComponent } from './components/types/sportbook-type/sportbook-bet-details/sportbook-bet-details.component';
import { PremiumOddsComponent } from './components/types/premium-odds/premium-odds.component';
import { VirtualSportsComponent } from './components/virtual-sports/virtual-sports.component';
import { FooterComponent } from "../../shared/components/footer/footer.component";
import { MatchedbetComponent } from "../../shared/components/matchedbet/matchedbet.component";
import { UnmatchedbetComponent } from "../../shared/components/unmatchedbet/unmatchedbet.component";
import { CountDownComponent } from "../../shared/components/count-down/count-down.component";
import { RightsidebarComponent } from "../../shared/components/rightsidebar/rightsidebar.component";
import { CheckInplayTypePipe } from "../../shared/pipes/check-inplay-type.pipe";
import { OrdinalDatePipe } from "../../shared/pipes/ordinal-date.pipe";
import { SafePipe } from "../../shared/pipes/safe.pipe";
import { ShortNumberPipe } from "../../shared/pipes/short-number.pipe";
import { CountdownPipe } from "../../shared/pipes/countdown.pipe";
import { EventShortnamePipe } from "../../shared/pipes/event-shortname.pipe";
import { HighlightDirective } from '@clientApp-shared/directive/highlight.directive';
import { AmIvisibleDirective } from '@clientApp-shared/directive/am-ivisible.directive';
import { SportsIconPipe } from "../../shared/pipes/sports-icon.pipe";
import { VirtualTypeComponent } from './components/types/virtual-type/virtual-type.component';
import { VirtualBetDetailsComponent } from './components/types/virtual-type/virtual-bet-details/virtual-bet-details.component';
import { IstToPktPipe } from "../../shared/pipes/ist-to-pkt.pipe";

const routes: Routes = [
  {
   path: ':id', component: MarketComponent
  },
  {
    path: ':id/:eventname', component: MarketComponent
  },
  {
    path: ':id/:mid', component: MarketComponent
  },
  {
    path: ':id/:mid/:eventname', component: MarketComponent
  },
  {
    path: '', component: MarketComponent
  }
];

@NgModule({
    declarations: [MarketComponent, MatchComponent, MarketTypeComponent,
        MarketBetDetailsComponent,
        AdvanceSessionTypeComponent, AdvanceSessionBetDetailsComponent,
        MatchBetComponent, UnmatchBetComponent,
        
        PlacebetCountdownComponent, SessionTypeComponent,
        SportbookTypeComponent, SportbookBetDetailsComponent, PremiumOddsComponent, VirtualSportsComponent, VirtualTypeComponent, VirtualBetDetailsComponent],
    imports: [
    CommonModule,
    SharedModule,
    RouterModule.forChild(routes),
    FooterComponent,
    MatchedbetComponent,
    UnmatchedbetComponent,
    CountDownComponent,
    RightsidebarComponent,
    BetPanelLayoutComponent,
    CheckInplayTypePipe,
    OrdinalDatePipe,
    SafePipe,
    ShortNumberPipe,
    CountdownPipe,
    EventShortnamePipe,
    HighlightDirective,
    AmIvisibleDirective,
    MarketPlaceBetViewsComponent, SessionPlaceBetViewsComponent,
    SportsIconPipe,
    IstToPktPipe
]
})
export class MarketModule { }
