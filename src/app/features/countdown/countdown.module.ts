import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CountdownComponent } from './countdown.component';
import { SharedModule } from '@clientApp-shared/shared.module';
import { RouterModule, Routes } from '@angular/router';
import { FooterComponent } from "../../shared/components/footer/footer.component";
import { RightsidebarComponent } from "../../shared/components/rightsidebar/rightsidebar.component";

const route: Routes = [
  {path: '', 
  component: CountdownComponent}
];

@NgModule({
    declarations: [
        CountdownComponent
    ],
    imports: [
        CommonModule,
        RouterModule.forChild(route),
        SharedModule,
        FooterComponent,
        RightsidebarComponent
    ]
})
export class CountdownModule { }
