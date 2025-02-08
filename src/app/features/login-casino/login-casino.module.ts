import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginCasinoComponent } from './login-casino.component';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '@clientApp-shared/shared.module';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';


const routes: Routes = [{
  path: '', component: LoginCasinoComponent
},{
  path: ':provider', component: LoginCasinoComponent
},{
  path: ':provider/:game', component: LoginCasinoComponent
  },
  {
    path: ':provider/:game/:type', component: LoginCasinoComponent
  }
];

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    RouterModule.forChild(routes),
    InfiniteScrollModule
  ],
  declarations: [LoginCasinoComponent]
})
export class LoginCasinoModule {
 
 }
