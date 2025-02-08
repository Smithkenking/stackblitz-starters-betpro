import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MyBetsComponent } from './my-bets.component';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '@clientApp-shared/shared.module';


const route: Routes = [
  {path: '', component: MyBetsComponent},
  {path: ':modalroute', component: MyBetsComponent}
];
@NgModule({
  declarations: [MyBetsComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(route),
    SharedModule
  ]
})
export class MyBetsModule { }
