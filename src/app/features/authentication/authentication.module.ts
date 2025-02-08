import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthenticationComponent } from './authentication.component';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '@clientApp-shared/shared.module';
import { RecaptchaModule } from 'ng-recaptcha';
import { LoadingBarComponent } from "../../shared/components/loading-bar/loading-bar.component";

const route: Routes = [
  {path: '', component: AuthenticationComponent}
];

@NgModule({
    declarations: [AuthenticationComponent],
    imports: [
        CommonModule,
        RouterModule.forChild(route),
        SharedModule,
        RecaptchaModule,
        LoadingBarComponent
    ]
})
export class AuthenticationModule { }
