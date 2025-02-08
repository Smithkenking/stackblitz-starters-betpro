import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TransactionHistoryComponent } from './transaction-history.component';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '@clientApp-shared/shared.module';
import { IstToPktPipe } from "../../shared/pipes/ist-to-pkt.pipe";

const route: Routes = [
  {path: '', component: TransactionHistoryComponent},
  {path: ':modalroute', component: TransactionHistoryComponent}
  
];

@NgModule({
  declarations: [TransactionHistoryComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(route),
    SharedModule,
    IstToPktPipe
]
})
export class TransactionHistoryModule { }
