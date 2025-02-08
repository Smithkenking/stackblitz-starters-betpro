import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SignupComponent } from './signup.component';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '@clientApp-shared/shared.module';
import { RecaptchaModule } from 'ng-recaptcha';
import { NgOtpInputModule } from 'ng-otp-input';
import { ChangePasswordComponent } from "../change-password/change-password.component";
import { GoogleSigninButtonModule } from '@abacritt/angularx-social-login';
import { FooterComponent } from "../../shared/components/footer/footer.component";
const route: Routes = [
  {path: '', component: SignupComponent}
];

@NgModule({
    declarations: [
        SignupComponent
    ],
    imports: [
    CommonModule,
    RouterModule.forChild(route),
    SharedModule,
    RecaptchaModule,
    NgOtpInputModule,
    ChangePasswordComponent,
    GoogleSigninButtonModule,
    FooterComponent
]
})
export class SignupModule { }
