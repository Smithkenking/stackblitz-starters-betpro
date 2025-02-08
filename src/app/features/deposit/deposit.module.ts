import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '@clientApp-shared/shared.module';
import { DepositComponent } from './deposit.component';
import { CountdownPipe } from "../../shared/pipes/countdown.pipe";

const route: Routes = [
  {path: '', component: DepositComponent},
  {path: ':modalroute', component: DepositComponent}
];

@NgModule({
    declarations: [],
    imports: [
        CommonModule,
        RouterModule.forChild(route),
        SharedModule,
        CountdownPipe,
        DepositComponent
    ]
})
export class DepositModule { }
