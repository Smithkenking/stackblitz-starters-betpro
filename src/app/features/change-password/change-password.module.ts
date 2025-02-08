import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChangePasswordComponent } from './change-password.component';
import { Routes, RouterModule } from '@angular/router';
import { SharedModule } from '@clientApp-shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

const route: Routes = [
  {path: '', component: ChangePasswordComponent}
];

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild(route),
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    ChangePasswordComponent
  ]
})
export class ChangePasswordModule { }
