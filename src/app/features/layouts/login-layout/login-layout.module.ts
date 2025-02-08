import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '@clientApp-shared/shared.module';
import { RecaptchaModule } from 'ng-recaptcha';
import { LoginLayoutComponent } from './login-layout.component';
import { LoginGuard } from '@clientApp-core/gaurds/login.guard';
import { HeaderComponent } from "../../../shared/components/header/header.component";
import { FooterComponent } from "../../../shared/components/footer/footer.component";
import { MaintenanceComponent } from "../../maintenance/maintenance.component";
import { BottomMenuComponent } from "../../../shared/components/bottom-menu/bottom-menu.component";

const route: Routes = [{


  path: '',
  component: LoginLayoutComponent,
  children: [
    { path: '', redirectTo: '/home', pathMatch: 'full' },
    {
      path: 'home',
      loadChildren: () => import('../../landing-page/landing-page.module').then(m => m.LandingPageModule),
      data: {
        preload: true,
        title: 'BetPro | Play Slots Online Games & Online Satta Play',
      }
    },
    {
      path: 'login',
      canActivate:[LoginGuard],
      loadChildren: () => import('../../login/login.module').then(m => m.LoginModule),
      data: { 
        preload: true,
        title: 'BetPro Login | Live Online Casino With Free Signup Bonus',
       }
    },
    {
      path: 'sports',
      loadChildren: () => import('../../dashboard-login/dashboard-login.module').then(m => m.DashboardLoginModule),
      data: { 
        preload: true,
        title: 'BetPro | Live sports betting in Pakistan',
       }
    },
    {
      path: 'signup',
      canActivate:[LoginGuard],
      loadChildren: () => import('../../signup/signup.module').then(m => m.SignupModule),
  },
  {
    path: 'event',
    loadChildren: () => import('../../login-market/LoginMarketModule.module').then(mod => mod.LoginMarketModule),
    data:{  preload: true}
    },
    {
      path: 'favorite-sports',
      loadChildren: () => import('../../login-market/LoginMarketModule.module').then(mod => mod.LoginMarketModule),
      data: { 
        title: 'BetPro | Best Sports Betting App In Pakistan',
       }
    },
  {
    path: 'live-casino',
    loadChildren: () => import('../../login-casino/login-casino.module').then(m => m.LoginCasinoModule),
    data: { 
      preload: true,
      title: 'BetPro | New online casino Games',
     }
  },
  {
    path: 'campaign',
    loadChildren: () => import('../../login-promotion/login-promotion.module').then(m => m.LoginPromotionModule),
    data: { 
      preload: true,
      title: 'Online Sports Betting & Live Casino Sign Up Bonus',
     }
  },{
    path: 'info',
    loadChildren: () => import('../footer-page-layout/footer-page-layout.module').then(m => m.FooterPageLayoutModule)
  },{
    path: 'blog',
    loadChildren: () => import('../../blog/blog.module').then(m => m.BlogModule),
    data: {title: 'Blog'}
  },
  {
    path: 'app',
    loadChildren: () => import('../../mobile-app/mobile-app.module').then(m => m.MobileAppModule),
    data: {title: 'Mobile application'}
  }
]
}
]

@NgModule({
    declarations: [LoginLayoutComponent],
    imports: [
        CommonModule,
        RouterModule.forChild(route),
        SharedModule,
        RecaptchaModule,
        HeaderComponent,
        FooterComponent,
        MaintenanceComponent,
        BottomMenuComponent
    ]
})
export class LoginLayoutModule { }
