import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WagerListComponent } from './wager-list.component';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '@clientApp-shared/shared.module';
import { CountdownPipe } from "../../shared/pipes/countdown.pipe";

const route: Routes = [
  {path: '', component: WagerListComponent},
  {path: ':modalroute', component: WagerListComponent}
];

@NgModule({
    declarations: [WagerListComponent],
    imports: [
        CommonModule,
        RouterModule.forChild(route),
        SharedModule,
        CountdownPipe
    ]
})
export class WagerListModule { }
