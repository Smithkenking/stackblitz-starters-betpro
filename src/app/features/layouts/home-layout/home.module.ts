import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeLayoutComponent } from './home-layout.component';
import { RouterModule, Routes, ROUTES } from '@angular/router';
import { SharedModule } from '@clientApp-shared/shared.module';
import { AuthFacadeService } from '@clientApp-core/services/authentication/authentication-facade.service';
import { DepositGuard } from '@clientApp-core/gaurds/deposit.guard';
import { HeaderComponent } from "../../../shared/components/header/header.component";
import { MatchedbetComponent } from "../../../shared/components/matchedbet/matchedbet.component";
import { UnmatchedbetComponent } from "../../../shared/components/unmatchedbet/unmatchedbet.component";
import { LoadingBarComponent } from "../../../shared/components/loading-bar/loading-bar.component";
import { MaintenanceComponent } from "../../maintenance/maintenance.component";
import { BottomMenuComponent } from "../../../shared/components/bottom-menu/bottom-menu.component";



@NgModule({
    declarations: [HomeLayoutComponent],
    providers: [
        {
            provide: ROUTES,
            useFactory: setRoutesBasedOnRoles,
            deps: [AuthFacadeService],
            multi: true
        }
    ],
    imports: [
        CommonModule,
        RouterModule,
        SharedModule,
        HeaderComponent,
        MatchedbetComponent,
        UnmatchedbetComponent,
        LoadingBarComponent,
        MaintenanceComponent,
        BottomMenuComponent
    ]
})
export class HomeModule { }
function setRoutesBasedOnRoles() {
  let routes: Routes = [];
  const user = JSON.parse(localStorage.getItem('token'));
  if (user != null) {
    routes = [
      {
        path: '',
        component: HomeLayoutComponent,
        children: [
          { path: '', redirectTo: 'home', pathMatch: 'full' },
          {
            path: 'home',
            loadChildren: () => import('../../landing-page/landing-page.module').then(m => m.LandingPageModule),
            data: {
              preload: true,
              title: 'BetPro | Play Slots Online Games & Online Satta Play',
            }
          },
          {
            path: 'sports',
            loadChildren: () => import('../../dashboard/dashboard.module').then(m => m.DashboardModule),
            data: { 
              preload: true,
              title: 'BetPro | Live sports betting in Pakistan',
             }
          },
          {
            path: 'event',
            loadChildren: () => import('../../market/market.module').then(m => m.MarketModule),
            data: { preload: true }
          },
          {
            path: 'favorite-sports',
            loadChildren: () => import('../../fav-sports/fav-sports.module').then(m => m.FavSportsModule),
            data: { 
              title: 'BetPro | Best Sports Betting App In Pakistan',
             }
          },
          {
            path: 'live-casino',
            loadChildren: () => import('../../casino-games-list/casino-games-list.module').then(m => m.CasinoGamesListModule),
            data: { 
              preload: true,
              title: 'BetPro | New online casino Games',
             }
          },
          {
            path: 'campaign',
            loadChildren: () => import('../../campaign-list/campaign-list.module').then(m => m.CampaignListModule),
            data: { 
              title: 'Online Sports Betting & Live Casino Sign Up Bonus',
             }
          },
          {
            path: 'casinoGame/:id',
            loadChildren: () => import('../../casino-games/casino-games.module').then(m => m.CasinoGamesModule)
          },
          {
            path: '',
            loadChildren: () => import('../report-page-layout/reportpage.module').then(m => m.ReportpageModule)
          },
          {
            path: 'info',
            loadChildren: () => import('../footer-page-layout/footer-page-layout.module').then(m => m.FooterPageLayoutModule)
          },
          {
            path: 'payment-accept',
            canActivate: [DepositGuard],
            loadChildren: () => import('../../payment-accept/payment-accept.module').then(m => m.PaymentAcceptModule)
          },
          {
            path: 'payment-reject',
            canActivate: [DepositGuard],
            loadChildren: () => import('../../payment-reject/payment-reject.module').then(m => m.PaymentRejectModule)
          },
          {
            path: 'app',
            loadChildren: () => import('../../mobile-app/mobile-app.module').then(m => m.MobileAppModule),
            data: {title: 'Mobile application'}
          },
          {
            path: 'countdown',
            canActivate: [DepositGuard],
            loadChildren: () => import('../../countdown/countdown.module').then(m => m.CountdownModule)
          },
          {
            path: 'blog',
            loadChildren: () => import('../../blog/blog.module').then(m => m.BlogModule),
            data: {title: 'Blog'}
          },
          {
            path: 'referandearn',
            loadChildren: () => import('../../refer-earn/refer-earn.module').then(m => m.ReferEarnModule),
            data: { preload: true }
          },
          {
            path: 'vip',
            loadChildren: () => import('../../vip/vip.module').then(m => m.VipModule),
            data: {title: 'Vip'}
          },
          {
            path: 'deposit',
            loadChildren: () => import('../../deposit/deposit.module').then(m => m.DepositModule)
          },
        ]
      }
    ];
  } else {
    routes = [
      {
        path: '',
        component: HomeLayoutComponent,
        children: [
          { path: '', redirectTo: 'home1', pathMatch: 'full' },
          {
            path: 'home1',
            loadChildren: () => import('../../dashboard/dashboard.module').then(m => m.DashboardModule),
            data: { preload: true }
          }
        ]
      }
    ];
  }
  return routes
}