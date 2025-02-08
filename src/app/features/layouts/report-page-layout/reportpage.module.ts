import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportPageLayoutComponent } from './report-page-layout.component';
import { SharedModule } from '@clientApp-shared/shared.module';
import { RouterModule, Routes } from '@angular/router';
import { Isb2cuserGuard } from '@clientApp-core/gaurds/isb2cuser.guard';
import { RightsidebarComponent } from "../../../shared/components/rightsidebar/rightsidebar.component";
import { FooterComponent } from "../../../shared/components/footer/footer.component";
import { MaintenanceComponent } from "../../maintenance/maintenance.component";

const route: Routes = [
  {
    path: '',
    component: ReportPageLayoutComponent,
    children: [
      {
        path: 'account-statement',
        loadChildren: () => import('../../account-statement/account-statement.module').then(m => m.AccountStatementModule),
        data: {
          title: 'Understand Account Statements & Midnight Satta Online',
        }
      },
      {
        path: 'open-bets',
        loadChildren: () => import('../../my-bets/my-bets.module').then(m => m.MyBetsModule),
        data: {
          title: 'BetPro | Open Betting and Live 24hr betting',
        }
      },
      {
        path: 'transaction-history',
        canActivate: [Isb2cuserGuard],
        loadChildren: () => import('../../transaction-history/transaction-history.module').then(m => m.TransactionHistoryModule),
        data: {
          title: 'BetPro | Check all transaction history',
        }
      },
      {
        path: 'user-profile',
        canActivate: [Isb2cuserGuard],
        loadChildren: () => import('../../user-profile/user-profile.module').then(m => m.UserProfileModule),
        data: {
          title: 'BetPro Profile | Online Casino Bonus No Deposit',
        }
      },
      {
        path: 'withdraw',
        canActivate: [Isb2cuserGuard],
        loadChildren: () => import('../../withdraw/withdraw.module').then(m => m.WithdrawModule),
        data: {
          title: 'BetPro | Online Casino Instant Withdrawal',
        }
      },
      {
        path: 'bonus-list',
        canActivate: [Isb2cuserGuard],
        loadChildren: () => import('../../wager-list/wager-list.module').then(m => m.WagerListModule),
        data: {
          title: 'BetPro | Free Sign Up Bonus Casino',
        }
      }
    ]
  }
]

@NgModule({
  declarations: [ReportPageLayoutComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(route),
    SharedModule,
    RightsidebarComponent,
    FooterComponent,
    MaintenanceComponent
  ]
})
export class ReportpageModule { }
