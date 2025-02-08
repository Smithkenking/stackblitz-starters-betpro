import { NgModule,  } from '@angular/core';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthHttpInterceptor } from '@clientApp-core/interceptors/authHttpInterceptor';
import { HomeResolve } from '@clientApp-core/resolvers/home.resolve';
import { LoggedInUserGuard } from '@clientApp-core/gaurds/logged-in-user.guard';
import { ConfigService } from '@clientApp-core/services/config/connfig.service';
import { CommonModule } from '@angular/common';
import { Isb2cuserGuard } from './gaurds/isb2cuser.guard';
import { DepositGuard } from './gaurds/deposit.guard';
import { LoginGuard } from './gaurds/login.guard';

@NgModule({
  imports: [
    CommonModule,
    HttpClientModule
  ],
  declarations: [],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthHttpInterceptor,
      multi: true
    },

    ConfigService,


    /** Resolvers */
     HomeResolve,

    /** Gaurds */
    LoggedInUserGuard,
    Isb2cuserGuard,
    DepositGuard,
    LoginGuard
  ]
})
export class CoreModule { }
