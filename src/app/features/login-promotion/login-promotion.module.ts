import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginPromotionComponent } from './login-promotion.component';
import { SharedModule } from '@clientApp-shared/shared.module';
import { RouterModule, Routes } from '@angular/router';
import { CountdownPipe } from "../../shared/pipes/countdown.pipe";
import { FooterComponent } from "../../shared/components/footer/footer.component";
import { TopContentComponent } from "../../shared/components/top-content/top-content.component";

const routes: Routes = [{
  path: '', component: LoginPromotionComponent
},
{path: ':cid', component: LoginPromotionComponent}
];

@NgModule({
    declarations: [LoginPromotionComponent],
    imports: [
    CommonModule,
    SharedModule,
    RouterModule.forChild(routes),
    CountdownPipe,
    FooterComponent,
    TopContentComponent
]
})
export class LoginPromotionModule { }
