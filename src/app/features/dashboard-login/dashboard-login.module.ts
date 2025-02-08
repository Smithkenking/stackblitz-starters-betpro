import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardLoginComponent } from './dashboard-login.component';
import { Routes, RouterModule } from '@angular/router';
import { SharedModule } from '@clientApp-shared/shared.module';
import { CommonDashboardComponent } from "../common-dashboard/common-dashboard.component";

const routes: Routes = [{
  path: '', component: DashboardLoginComponent
},{
  path: ':sport', component: DashboardLoginComponent
}];


@NgModule({
    declarations: [
        DashboardLoginComponent
    ],
    imports: [
        CommonModule,
        SharedModule,
        RouterModule.forChild(routes),
        CommonDashboardComponent
    ]
})
export class DashboardLoginModule { }
