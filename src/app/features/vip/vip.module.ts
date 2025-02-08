import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VipComponent } from './vip.component';
import { Routes, RouterModule } from '@angular/router';
import { FooterComponent } from '@clientApp-shared/components/footer/footer.component';
import { SharedModule } from '@clientApp-shared/shared.module';
import { DownloadApkComponent } from "../../shared/components/download-apk/download-apk.component";

const route: Routes = [
  {path: '', component: VipComponent}
];

@NgModule({
    declarations: [VipComponent],
    imports: [
        CommonModule,
        RouterModule.forChild(route),
        SharedModule,
        FooterComponent,
        DownloadApkComponent
    ]
})
export class VipModule { }
