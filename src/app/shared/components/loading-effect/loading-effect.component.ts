import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { SharedModule } from '@clientApp-shared/shared.module';

@Component({
  standalone: true,
  imports:[CommonModule,SharedModule],
  selector: 'app-loading-effect',
  templateUrl: './loading-effect.component.html',
  styleUrls: ['./loading-effect.component.scss']
})
export class LoadingEffectComponent implements OnInit {
  @Input() isrightsidebar?: boolean;
  matchArr = Array; 
  matchNum:number = 8;
  constructor() { }

  ngOnInit(): void {
  }

}
