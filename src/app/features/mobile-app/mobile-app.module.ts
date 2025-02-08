import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MobileAppComponent } from './mobile-app.component';
import { RouterModule, Routes } from '@angular/router';
import { FooterComponent } from '@clientApp-shared/components/footer/footer.component';
import { SharedModule } from '@clientApp-shared/shared.module';

const route: Routes = [{
  path: '', component: MobileAppComponent}
];

@NgModule({
  declarations: [MobileAppComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(route),
    SharedModule,
    FooterComponent
  ]
})
export class MobileAppModule { }
