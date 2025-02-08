import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WithdrawComponent } from './withdraw.component';
import { SharedModule } from '@clientApp-shared/shared.module';
import { RouterModule, Routes } from '@angular/router';

const route: Routes = [
  {path: '', component: WithdrawComponent},
  {path: ':modalroute', component: WithdrawComponent}
];


@NgModule({
  declarations: [WithdrawComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(route),
    SharedModule
  ]
})
export class WithdrawModule { }
