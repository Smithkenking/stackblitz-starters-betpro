import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FooterPageLayoutComponent } from './footer-page-layout/footer-page-layout.component';
import { SharedModule } from '@clientApp-shared/shared.module';
import { RouterModule, Routes } from '@angular/router';
import { FooterComponent } from "../../../shared/components/footer/footer.component";
import { SafePipe } from "../../../shared/pipes/safe.pipe";


const route: Routes = [
  {
    path: ':appAlias', component: FooterPageLayoutComponent
  }
]

@NgModule({
    declarations: [FooterPageLayoutComponent],
    imports: [
        CommonModule,
        CommonModule,
        RouterModule.forChild(route),
        SharedModule,
        FooterComponent,
        SafePipe
    ]
})
export class FooterPageLayoutModule { }
