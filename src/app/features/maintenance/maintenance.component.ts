import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { CommonService } from '@clientApp-core/services/common/common.service';
import { apiEndPointData } from '@clientApp-core/services/config/connfig.service';
import { splitVSPipe } from '@clientApp-shared/pipes/split.pipe';
import { SharedModule } from '@clientApp-shared/shared.module';

@Component({
  standalone: true,
  imports: [CommonModule, SharedModule, splitVSPipe],
  selector: 'app-maintenance',
  templateUrl: './maintenance.component.html',
  styleUrls: ['./maintenance.component.scss']
})
export class MaintenanceComponent implements OnInit {
  websiteName: string;
  websiteOrigin: string;
  maintenanceImage = apiEndPointData.data.maintenanceImage;
  constructor(public commonService: CommonService) { }

  ngOnInit(): void {
    this.maintenanceImage = this.commonService.contentRelativePath(this.maintenanceImage);
    this.websiteOrigin = window.location.host;
    const origin = window.location.host;
    let url = origin.lastIndexOf(".") > -1 ? origin.substring(0, origin.lastIndexOf(".")) : origin;
    this.websiteName = url.replace(/^(?:https?:\/\/)?(?:www\.)?/i, "");
     
  }

}
