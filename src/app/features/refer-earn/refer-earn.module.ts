import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { SharedModule } from '@clientApp-shared/shared.module';
import { ReferEarnComponent } from './refer-earn.component';
import { RightsidebarComponent } from "../../shared/components/rightsidebar/rightsidebar.component";
import { FooterComponent } from "../../shared/components/footer/footer.component";

const route: Routes = [
  {path: '', component: ReferEarnComponent}
];

@NgModule({
    declarations: [ReferEarnComponent],
    imports: [
        CommonModule,
        RouterModule.forChild(route),
        SharedModule,
        RightsidebarComponent,
        FooterComponent
    ]
})
export class ReferEarnModule { }
