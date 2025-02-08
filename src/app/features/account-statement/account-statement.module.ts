import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AccountStatementComponent } from './account-statement.component';
import { Routes, RouterModule } from '@angular/router';
import { SharedModule } from '@clientApp-shared/shared.module';
import { IstToPktPipe } from "../../shared/pipes/ist-to-pkt.pipe";

const route: Routes = [
  {path: '', component: AccountStatementComponent},
  {path: ':modalroute', component: AccountStatementComponent}
];

@NgModule({
  declarations: [AccountStatementComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(route),
    SharedModule,
    IstToPktPipe
]
})
export class AccountStatementModule { }
