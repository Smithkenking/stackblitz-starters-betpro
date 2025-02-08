import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CampaignListComponent } from './campaign-list.component';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '@clientApp-shared/shared.module';
import { TopContentComponent } from "../../shared/components/top-content/top-content.component";
import { RightsidebarComponent } from "../../shared/components/rightsidebar/rightsidebar.component";
import { FooterComponent } from "../../shared/components/footer/footer.component";
import { CountdownPipe } from "../../shared/pipes/countdown.pipe";

const route: Routes = [
  { path: '', component: CampaignListComponent },
  {path: ':cid', component: CampaignListComponent}
];

@NgModule({
    declarations: [CampaignListComponent],
    imports: [
        CommonModule,
        RouterModule.forChild(route),
        SharedModule,
        TopContentComponent,
        RightsidebarComponent,
        FooterComponent,
        CountdownPipe
    ]
})
export class CampaignListModule { }
