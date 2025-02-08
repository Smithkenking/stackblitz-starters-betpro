import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaymentRejectComponent } from './payment-reject.component';
import { SharedModule } from '@clientApp-shared/shared.module';
import { RouterModule, Routes } from '@angular/router';
import { RightsidebarComponent } from "../../shared/components/rightsidebar/rightsidebar.component";
import { FooterComponent } from "../../shared/components/footer/footer.component";

const route: Routes = [
  {path: '', 
  component: PaymentRejectComponent}
];

@NgModule({
    declarations: [
        PaymentRejectComponent
    ],
    imports: [
        CommonModule,
        RouterModule.forChild(route),
        SharedModule,
        RightsidebarComponent,
        FooterComponent
    ]
})
export class PaymentRejectModule { }
