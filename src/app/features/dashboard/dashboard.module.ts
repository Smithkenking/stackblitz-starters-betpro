import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardComponent } from './dashboard.component';
import { HomeResolve } from '@clientApp-core/resolvers/home.resolve';
import { Routes, RouterModule } from '@angular/router';
import { SharedModule } from '@clientApp-shared/shared.module';
import { FooterComponent } from "../../shared/components/footer/footer.component";
import { CommonDashboardComponent } from "../common-dashboard/common-dashboard.component";

const routes: Routes = [{
  path: '', component: DashboardComponent, resolve: { home: HomeResolve }
},
{
  path: ':sport', component: DashboardComponent, resolve: { home: HomeResolve }
}];

@NgModule({
    declarations: [DashboardComponent],
    imports: [
        CommonModule,
        SharedModule,
        RouterModule.forChild(routes),
        FooterComponent,
        CommonDashboardComponent
    ]
})
export class DashboardModule { }
