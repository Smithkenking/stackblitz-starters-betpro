import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@clientApp-shared/shared.module';
import { apiEndPointData } from '@clientApp-core/services/config/connfig.service';

@Component({
  selector: 'app-download-apk',
  standalone: true,
  imports: [CommonModule, SharedModule],
  templateUrl: './download-apk.component.html',
  styleUrls: ['./download-apk.component.scss']
})
export class DownloadApkComponent implements OnInit {
  websiteName: string;
  mobileAppUrl: any;
  ngOnInit(): void {
    let url = origin.lastIndexOf(".") > -1 ? origin.substring(0, origin.lastIndexOf(".")) : origin;
    this.websiteName = url.replace(/^(?:https?:\/\/)?(?:www\.)?/i, "");
    this.mobileAppUrl = apiEndPointData.data.mau;
  }
}
