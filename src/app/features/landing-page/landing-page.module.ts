import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LandingPageComponent } from './landing-page.component';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '@clientApp-shared/shared.module';
import { FooterComponent } from "../../shared/components/footer/footer.component";
import { CommonDashboardComponent } from "../common-dashboard/common-dashboard.component";
import { TrendingGamesComponent } from "../../shared/components/trending-games/trending-games.component";
import { PopularGamesComponent } from "../../shared/components/popular-games/popular-games.component";
import { SlickCarouselModule } from 'ngx-slick-carousel';
import { TopContentComponent } from "../../shared/components/top-content/top-content.component";

const route: Routes = [
  { path: '', component: LandingPageComponent},
  {
    path: ':modalroute', component: LandingPageComponent
  }
]

@NgModule({
    declarations: [LandingPageComponent],
    imports: [
    CommonModule,
    RouterModule.forChild(route),
    SharedModule,
    FooterComponent,
    CommonDashboardComponent,
    TrendingGamesComponent,
    PopularGamesComponent,
    SlickCarouselModule,
    TopContentComponent
]
})
export class LandingPageModule { }
