import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { CommonService } from '@clientApp-core/services/common/common.service';
import { apiEndPointData } from '@clientApp-core/services/config/connfig.service';
import { untilDestroyed } from 'ngx-take-until-destroy';
import { throwError } from 'rxjs';
import { take, catchError } from 'rxjs/operators';
import { AuthFacadeService } from '@clientApp-core/services/authentication/authentication-facade.service';
declare var $: any;

@Component({
  selector: 'app-mobile-app',
  templateUrl: './mobile-app.component.html',
  styleUrls: ['./mobile-app.component.scss']
})
export class MobileAppComponent implements OnInit, AfterViewInit, OnDestroy {
  isNewsExits: boolean;
  user: any;
  selectedTab = "Android";
  mobileAppUrl: any;
  websiteName: string;
  constructor(public commonService: CommonService, private authService: AuthFacadeService) {
  }

  ngOnInit(): void {
    let url = origin.lastIndexOf(".") > -1 ? origin.substring(0, origin.lastIndexOf(".")) : origin;
    this.websiteName = url.replace(/^(?:https?:\/\/)?(?:www\.)?/i, "");
    this.mobileAppUrl = apiEndPointData.data.mau;
    this.user = JSON.parse(localStorage.getItem('token'));
    this.isNewsExits = this.commonService.isNewsExits;
    this.getNews();
  }
  ngAfterViewInit(): void {
    $('.tabs').tabs();
    if ($('.iconMenu-bar').hasClass('open') && $(window).width() > 991) {
      $('main').addClass('sidebar-open');
    }
  }
  getNews() {
    this.authService.getNews$()
      .pipe(
        untilDestroyed(this),
        take(1),
        catchError(err => throwError(err))
      ).subscribe(response => {
        if (response && response.length > 0) {
          this.isNewsExits = true;
        }
      }, err => console.log('getNews', err));
  }
  onselectTab(tab) {
    this.selectedTab = tab;
  }
  ngOnDestroy(): void {

  }
}
