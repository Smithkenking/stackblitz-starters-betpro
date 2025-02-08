import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@clientApp-shared/shared.module';
import { RouterModule, Routes } from '@angular/router';
import { RecaptchaModule } from 'ng-recaptcha';
import { LoginMarketComponent } from 'app/features/login-market/login-market.component';
import { DashboardMarketComponent } from '../dashboard-login/login-markets/dashboard-market/dashboard-market.component';
import { loginMarketTypeComponent } from '../dashboard-login/login-markets/login-market-type/login-market-type.component';
import { LoginMarketBetDetailsComponent } from '../dashboard-login/login-markets/login-Market-bet-details/login-Market-bet-details.component';
import { LoginMarketPlaceBetViewsComponent } from '../dashboard-login/login-markets/login-market-place-bet-views/login-market-place-bet-views.component';
import { LoginAdvanceSessionTypeComponent } from '../dashboard-login/login-markets/login-advance-session-type/login-advance-session-type.component';
import { LoginAdvanceSessionBetDetailsComponent } from '../dashboard-login/login-markets/login-advance-session-bet-details/login-advance-session-bet-details.component';
import { LoginSessionTypeComponent } from '../dashboard-login/login-markets/login-session-type/login-session-type.component';
import { LoginLineMarketBetDetailsComponent } from '../dashboard-login/login-markets/login-line-market-bet-details/login-line-market-bet-details.component';
import { LoginSportBookBetDeatilsComponent } from '../dashboard-login/login-markets/login-sport-book-bet-deatils/login-sport-book-bet-deatils.component';
import { LoginSportBookTypeComponent } from '../dashboard-login/login-markets/login-sport-book-type/login-sport-book-type.component';
import { LoginPremiumOddsComponent } from '../dashboard-login/login-markets/login-premium-odds/login-premium-odds.component';
import { LoginVirtualSportsComponent } from '../dashboard-login/login-markets/login-virtual-sports/login-virtual-sports.component';
import { VirtualMarketComponent } from '../dashboard-login/login-markets/virtual-market/virtual-market.component';
import { RightsidebarComponent } from "../../shared/components/rightsidebar/rightsidebar.component";
import { CountdownPipe } from "../../shared/pipes/countdown.pipe";
import { SafePipe } from "../../shared/pipes/safe.pipe";
import { ShortNumberPipe } from "../../shared/pipes/short-number.pipe";
import { EventShortnamePipe } from "../../shared/pipes/event-shortname.pipe";
import { CheckInplayTypePipe } from "../../shared/pipes/check-inplay-type.pipe";
import { OrdinalDatePipe } from "../../shared/pipes/ordinal-date.pipe";
import { HighlightDirective } from '@clientApp-shared/directive/highlight.directive';
import { CountDownComponent } from "../../shared/components/count-down/count-down.component";
import { SportsIconPipe } from "../../shared/pipes/sports-icon.pipe";
import { LoginVirtualTypeComponent } from '../dashboard-login/login-markets/login-virtual-type/login-virtual-type.component';
import { LoginVirtualBetDetailsComponent } from '../dashboard-login/login-markets/login-virtual-bet-details/login-virtual-bet-details.component';
import { IstToPktPipe } from "../../shared/pipes/ist-to-pkt.pipe";

const routes: Routes = [{
    path: ':id', component: LoginMarketComponent
}, {
    path: ':id/:eventname', component: LoginMarketComponent
},
{
    path: ':id/:mid', component: LoginMarketComponent
},
{
    path: ':id/:mid/:eventname', component: LoginMarketComponent
}
];

@NgModule({
    declarations: [
        LoginMarketComponent,
        DashboardMarketComponent,
        loginMarketTypeComponent,
        LoginMarketBetDetailsComponent,
        LoginMarketPlaceBetViewsComponent,
        LoginAdvanceSessionTypeComponent,
        LoginAdvanceSessionBetDetailsComponent,
        LoginSessionTypeComponent,
        LoginLineMarketBetDetailsComponent,
        LoginPremiumOddsComponent,
        LoginSportBookTypeComponent,
        LoginSportBookBetDeatilsComponent,
        LoginVirtualSportsComponent,
        VirtualMarketComponent,
        LoginVirtualTypeComponent,
        LoginVirtualBetDetailsComponent
    ],
    imports: [
    CommonModule,
    SharedModule,
    RouterModule.forChild(routes),
    RecaptchaModule,
    RightsidebarComponent,
    CountdownPipe,
    SafePipe,
    ShortNumberPipe,
    EventShortnamePipe,
    CheckInplayTypePipe,
    OrdinalDatePipe,
    HighlightDirective,
    CountDownComponent,
    SportsIconPipe,
    IstToPktPipe
]
})

export class LoginMarketModule { } {

}