import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChipSettingsComponent } from './chip-settings.component';
import { Routes, RouterModule } from '@angular/router';
import { SharedModule } from '@clientApp-shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

const route: Routes = [
  {path: '', component: ChipSettingsComponent}
];

@NgModule({
  declarations: [], // ChipSettingsComponent
  imports: [
    CommonModule,
    RouterModule.forChild(route),
    SharedModule,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class ChipSettingsModule { }
