import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { CommonService } from '@clientApp-core/services/common/common.service';
import { apiEndPointData } from '@clientApp-core/services/config/connfig.service';
import { SharedModule } from '@clientApp-shared/shared.module';

@Component({
  standalone: true,
  imports:[CommonModule,SharedModule],
  selector: 'pb-loading-bar',
  templateUrl: './loading-bar.component.html',
  styleUrls: ['./loading-bar.component.css']
})
export class  LoadingBarComponent implements OnInit {
  loaderPath: any;
  constructor(public commonService: CommonService) { }

  ngOnInit() {
    this.loaderPath = apiEndPointData.data.mainloaderPath;
  }

}
