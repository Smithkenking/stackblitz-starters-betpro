import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CasinoGamesComponent } from './casino-games.component';
import { Routes, RouterModule } from '@angular/router';
import { SharedModule } from '@clientApp-shared/shared.module';
import { SafePipe } from "../../shared/pipes/safe.pipe";

const routes: Routes = [{
  path: '', component: CasinoGamesComponent
}];

@NgModule({
    declarations: [CasinoGamesComponent],
    imports: [
        CommonModule,
        SharedModule,
        RouterModule.forChild(routes),
        SafePipe
    ]
})
export class CasinoGamesModule { }
