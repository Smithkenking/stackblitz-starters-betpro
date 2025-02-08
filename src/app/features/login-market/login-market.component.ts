import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonService } from '@clientApp-core/services/common/common.service';
import { DeviceInfoService } from '@clientApp-core/services/device-info/deviceinfo.services';

@Component({
  selector: 'app-login-market',
  templateUrl: './login-market.component.html',
  styleUrls: ['./login-market.component.scss']
})
export class LoginMarketComponent implements OnInit {

  isDarkTheme: boolean;
  currPage: string;

  constructor(public commonService: CommonService,public deviceInfoService: DeviceInfoService,public router: Router) { }

  ngOnInit() {
    const darkThemeCurrentState = this.commonService.getCookieValue('isCheckedDarkTheme');
    this.isDarkTheme = (darkThemeCurrentState != null && darkThemeCurrentState != undefined && darkThemeCurrentState != '') ? JSON.parse(darkThemeCurrentState).isCheckedDarkTheme : false;
    if (this.deviceInfoService.isMobile()) {
      this.currPage = 'm';
    } else {
      this.currPage = 'd';
    }
  }
}

