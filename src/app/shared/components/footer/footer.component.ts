import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { AuthFacadeService, footerInfo } from '@clientApp-core/services/authentication/authentication-facade.service';
import { CommonService } from '@clientApp-core/services/common/common.service';
import { apiEndPointData } from '@clientApp-core/services/config/connfig.service';
import { capitalizeFirstLetter, GetSortOrder } from '@clientApp-core/utilities/app-configuration';
import { SharedModule } from '@clientApp-shared/shared.module';
import * as M from "materialize-css/dist/js/materialize";
import { SafePipe } from "../../pipes/safe.pipe";
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
@Component({
  standalone: true,
  imports: [CommonModule, SharedModule, SafePipe],
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit,OnDestroy {
  logoUrl = apiEndPointData.data.logoUrl;
  socialmediaData = apiEndPointData.data;
  currentYear: any = '';
  websiteName: string;
  footerData: any[]; 
  leftdiv: any;
  centerdiv: any;
  rightdiv: any;
  menuItemData: any = [];
  isContentToggled: boolean;
  longText: string;
  notifier = new Subject();
  constructor(private authFacadeService: AuthFacadeService,public commonService: CommonService) {
    this.commonService.getDarkThemeStatus().pipe(takeUntil(this.notifier)).subscribe((isChecked:any) => {
      this.checkIsDarkThemeExists(isChecked);
  });
   }

  ngOnInit(): void {
    this.socialmediaData = apiEndPointData.data;
    let date = new Date();
    this.currentYear = date.getFullYear();
    const origin = window.location.host;
    let url = origin.lastIndexOf(".") > -1 ? origin.substring(0, origin.lastIndexOf(".")) : origin;
    this.websiteName = capitalizeFirstLetter(url.replace(/^(?:https?:\/\/)?(?:www\.)?/i, ""));
    this.footerData = footerInfo.data.blockData;
    this.getBlockData();
    this.authFacadeService.getFooterInfo$().pipe(takeUntil(this.notifier)).subscribe(res=>{ 
      if(res.isSuccess) {
        this.footerData = res.result.blockData;
        this.getBlockData();
      } 
    });
  }
  getBlockData() {
    if (this.footerData && this.footerData.length > 0) {
    this.longText = this.footerData.find(leftdata => leftdata.appControlId === 'divfootertitle')?.appContent;
    this.leftdiv = this.longText.slice(0, 530);
    this.centerdiv = this.footerData.find(centerdata => centerdata.appControlId === 'divfootercenter');
    this.rightdiv = this.footerData.find(rightdata => rightdata.appControlId === 'divfooterright');
    const footerMenu = this.footerData.find(rightdata => rightdata.appControlId === 'divfootermenu' && !rightdata.appIsShowContent);
      const menuTypeData = footerInfo.data.menuTypeData;
      if (footerMenu) {
        const menutype = menuTypeData.find(x => x.appBlockId == footerMenu.appBlockId);
        if (menutype) {
          const menuItemData = footerInfo.data.menuItemData;
          this.menuItemData = menuItemData.filter(m => m.appMenuTypeId == menutype.appMenuTypeId);
          if (this.menuItemData && this.menuItemData.length > 0) {
            this.menuItemData = this.menuItemData.sort(GetSortOrder('appDisplayOrder'));
          }
        }
      }
    }
   
  }
  checkIsDarkThemeExists(isChecked:boolean) {
    if (isChecked) {
        this.logoUrl = apiEndPointData.data.lightLogoUrl;
    } else {
        this.logoUrl = apiEndPointData.data.darkLogoUrl;
    }
  }
  toggleContent() {
    this.isContentToggled = !this.isContentToggled;
    if (this.isContentToggled) {
      this.leftdiv = this.longText;
    } else {
      this.leftdiv = this.longText.slice(0, 530);
    }
  }
  trackByFun(index: any, item: any) {
    return index;
  }
  isValueNullOrEmpty(val: string | null | undefined): boolean {
    return !val || val.trim().length === 0;  // Checks for null, undefined, or empty string
  }
  ngOnDestroy(): void {
    this.notifier.next();
        this.notifier.complete();  
  }
}
