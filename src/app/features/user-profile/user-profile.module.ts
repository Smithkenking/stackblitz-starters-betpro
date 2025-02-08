import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserProfileComponent } from './user-profile.component';
import { SharedModule } from '@clientApp-shared/shared.module';
import { RouterModule, Routes } from '@angular/router';
import { NgOtpInputModule } from 'ng-otp-input';
import { ChangePasswordComponent } from "../change-password/change-password.component";

const route: Routes = [
  {path: '', component: UserProfileComponent},
  {path: ':modalroute', component: UserProfileComponent}
];

@NgModule({
    declarations: [UserProfileComponent],
    imports: [
        CommonModule,
        RouterModule.forChild(route),
        SharedModule,
        NgOtpInputModule,
        ChangePasswordComponent
    ]
})
export class UserProfileModule { }
