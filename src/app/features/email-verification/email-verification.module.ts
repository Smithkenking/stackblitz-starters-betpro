import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmailVerificationComponent } from './email-verification.component';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '@clientApp-shared/shared.module';

const route: Routes = [
  {path: '', component: EmailVerificationComponent}
];

@NgModule({
  declarations: [EmailVerificationComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(route),
    SharedModule
  ]
})
export class EmailVerificationModule { }
