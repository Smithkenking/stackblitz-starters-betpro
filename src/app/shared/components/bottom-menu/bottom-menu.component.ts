import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { AuthFacadeService, casinoGameMenuSettings, websiteSettings } from '@clientApp-core/services/authentication/authentication-facade.service';
import { BetFacadeService } from '@clientApp-core/services/bet/bet.facade.service';
import { CommonService } from '@clientApp-core/services/common/common.service';
import { StoreService } from '@clientApp-core/services/store/store.service';
import { untilDestroyed } from 'ngx-take-until-destroy';
import { ToastrService } from 'ngx-toastr';
import { throwError } from 'rxjs';
import { catchError, take } from 'rxjs/operators';
// import { OneClickComponent } from '../one-click/one-click.component';
import { SearchComponent } from '../search/search.component';
import * as M from "materialize-css/dist/js/materialize";
import { apiEndPointData } from '@clientApp-core/services/config/connfig.service';
import { MarketRateFacadeService } from '@clientApp-core/services/market/market-rates/market-rate-facade.service';
import { CasinoService } from '@clientApp-core/services/casino/casino.service';
import { DataLayerService } from '@clientApp-core/services/window/DataLayerService.service';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@clientApp-shared/shared.module';
import { MatchedbetComponent } from "../matchedbet/matchedbet.component";
import { UnmatchedbetComponent } from "../unmatchedbet/unmatchedbet.component";
declare var $: any;
@Component({
  standalone: true,
  selector: 'app-bottom-menu',
  templateUrl: './bottom-menu.component.html',
  styleUrls: ['./bottom-menu.component.scss'],
  imports: [CommonModule, SharedModule, MatchedbetComponent, UnmatchedbetComponent, SearchComponent]
})
export class BottomMenuComponent implements OnInit, AfterViewInit, OnDestroy {
  user: any;
  selectedTab = 'InPlay';
  previousUrl: string;
  currentUrl: string;
  isCheckedDarkTheme: boolean = true;
  bottomtabstoggleClass: boolean = false;
  isWager: boolean = false;
  isB2C: boolean;
  settingdropdownInstances: any;
  click_id: any = '';
  mkt: any = '';
  selectedLanguage = "English";
  isAutowagerPlacebet: boolean;
  matchBetCount = 0;
  unMatchBetCount = 0;
  matchedUnmatchedModalInstance: any;
  mySubscription: any;
  referralcode: any = '';
  selectedSport = 'Home';
  @ViewChild('search', { static: true }) searchRef: SearchComponent;
  // @ViewChild('oneclick', { static: true }) oneclickRef: OneClickComponent;
  @ViewChild('settingdropdown', { static: true }) settingdropdown: ElementRef;
  @ViewChild('matchedunmatched', { static: true }) matchedUnmatchedModal: ElementRef;
  constructor(private router: Router, public commonService: CommonService, private route: ActivatedRoute,
    private storeService: StoreService, private toastr: ToastrService, public betService: BetFacadeService,
    private authService: AuthFacadeService, private marketRateFacadeService: MarketRateFacadeService,
    private casinoService: CasinoService, private dataLayerService: DataLayerService) {
    this.currentUrl = this.router.url;
    this.previousUrl = null;
    this.mySubscription = this.router.events.subscribe(val => {
      if (
        val instanceof NavigationEnd) {
        this.previousUrl = this.currentUrl;
        this.currentUrl = val.urlAfterRedirects;
      }
    });
    this.commonService.getDarkThemeStatus().subscribe(isChecked => {
      this.isCheckedDarkTheme = isChecked;
    });
    this.route.queryParams.subscribe(params => {
      if (params && params['mkt'] && params['mkt'] !== '' && apiEndPointData.data.isB2C) {
        this.mkt = params['mkt'];
      }
      if (params && params['click_id'] && params['click_id'] !== '' && apiEndPointData.data.isB2C) {
        this.click_id = params['click_id'];
      }
    });
    this.marketRateFacadeService.getMatchBetCount$().pipe(untilDestroyed(this)).subscribe(matchcount => {
      this.matchBetCount = matchcount;
    });
    this.marketRateFacadeService.getUnMatchBetCount$().pipe(untilDestroyed(this)).subscribe(unmatchcount => {
      this.unMatchBetCount = unmatchcount;
    });
  }

  ngOnInit(): void {
    this.isAutowagerPlacebet = websiteSettings.data.appIsAutowagerPlacebet;
    this.isB2C = websiteSettings.data.isB2C;
    this.isWager = !websiteSettings.data.appIsRealBalanceUse;
    this.user = JSON.parse(localStorage.getItem('token'));
    const darkThemeCurrentState = this.commonService.getCookieValue('isCheckedDarkTheme');
    this.isCheckedDarkTheme = (darkThemeCurrentState != null && darkThemeCurrentState != undefined && darkThemeCurrentState != '') ? JSON.parse(darkThemeCurrentState).isCheckedDarkTheme : false;
    this.getConfig();
    const cookieValue = this.commonService.getCookieValue('selectedLanguage');
    if (cookieValue == '' || cookieValue == null || cookieValue == undefined) {
      this.selectedLanguage = 'English';
    } else {
      this.selectedLanguage = cookieValue;
    }
  }
  ngAfterViewInit(): void {
    // this.settingdropdownInstances = M.Modal.init(this.settingdropdown.nativeElement, {});
    // this.matchedUnmatchedModalInstance = M.Modal.init(this.matchedUnmatchedModal.nativeElement, {});
    var elemSelect = document.querySelectorAll('select');
    var instancesSelect = M.FormSelect.init(elemSelect, {});
    setTimeout(() => {
      elemSelect = document.querySelectorAll('select');
      instancesSelect = M.FormSelect.init(elemSelect, {});
    }, 1000);
    $('ul.bottom-dropdown-content li').on('touchend', function (e) {
      e.stopPropagation();
    });
  }
  ontranslationClick(lang) {
    this.selectedLanguage = lang;
    this.commonService.setCookieValue('selectedLanguage', lang);
    var $frame = $('.goog-te-menu-frame:first');
    if (!$frame.size()) {
      alert("Error: Could not find Google translate frame.");
      return false;
    }
    $frame.contents().find('.goog-te-menu2-item span.text:contains(' + lang + ')').get(0).click();
    return false;
  }
  getConfig() {
    this.authService.getConfig$()
      .pipe(
        untilDestroyed(this), take(1),
        catchError(err => throwError(err))
      ).subscribe(response => {
        if (response) {
          this.isB2C = websiteSettings.data.isB2C;
          this.isWager = !websiteSettings.data.appIsRealBalanceUse;

          this.isAutowagerPlacebet = websiteSettings.data.appIsAutowagerPlacebet;
        }
      }, err => console.log('getConfig', err));
  }
  onMenuClick(selectedTab: string) {
    this.selectedTab = selectedTab;
    this.commonService.selectedTab = selectedTab;
    this.commonService.setCasinoOpenStatus(false);
    this.storeService.removeAllStoreData();
    this.router.navigateByUrl('/sports');
  }
  bottomTabsclickEvent() {
    //   const _currentSet ={
    //     'event': 'whatsapp_click'
    //     };
    // this.dataLayerService.pingHome(_currentSet);

    if (this.user != null) {
      window.open(apiEndPointData.data.WhatsappURLafterLogin, '_blank');
    } else {
      window.open(apiEndPointData.data.WhatsappURLbeforeLogin, '_blank');
    }
  }
  OnSignInClick() {
    this.commonService.setLoginPopupOpen(true);
  }
  onAviatorClick() {
    if (this.user != null) {
      this.selectedSport = 'Aviator';
      const selectedProvider = 'Spribe';
      const selectedgame = 'Aviator';
      const casinoGameMenu = casinoGameMenuSettings.data.casinoMenu ? casinoGameMenuSettings.data.casinoMenu : [];
      const param = casinoGameMenu.find(x => x.name?.toLowerCase().replace(/\s/g, '') === selectedgame.toLowerCase().replace(/\s/g, '') &&
        x.providerName?.toLowerCase().replace(/\s/g, '') === selectedProvider.toLowerCase().replace(/\s/g, ''));
      if (param) {
        this.commonService.setLoadingStatus(true);
        this.casinoService.getCasinoToken(param);
        sessionStorage.setItem('isAviatorGameOpen', JSON.stringify({ isAviatorGameOpen: true }));
      } else {
        this.selectedSport = '';
        this.toastr.error('Game is currently disabled', "Notification", {
          toastClass: "custom-toast-error"
        });
      }
    } else {
      this.OnSignInClick();
    }
  }
  onChangeDarkTheme(isChecked: boolean) {
    document.body.classList.toggle('dark');
    if (isChecked) {
      this.isCheckedDarkTheme = true;
      this.commonService.setCookieValue('isCheckedDarkTheme', JSON.stringify({ isCheckedDarkTheme: true }));
      this.commonService.setDarkThemeStatus(true);
    } else {
      this.isCheckedDarkTheme = false;
      this.commonService.setCookieValue('isCheckedDarkTheme', JSON.stringify({ isCheckedDarkTheme: false }));
      this.commonService.setDarkThemeStatus(false);
    }
  }
  redirectTo(path) {
    if (this.user != null) {
      if (websiteSettings.data.isReportPageOpenInNewTab) {
        let newRelativeUrl = this.router.createUrlTree([path]);
        let baseUrl = window.location.href.replace(this.router.url, '');
        window.open(baseUrl + newRelativeUrl, '_blank');
      } else {
        this.router.navigateByUrl(path);
      }
    } else {
      this.commonService.setLoginPopupOpen(true);
    }

  }
  onOneClick() {
    if (this.user != null) {
      // this.oneclickRef.openPopup();
    } else {
      this.commonService.setLoginPopupOpen(true);
    }
  }
  openSearchModal() {
    this.searchRef.openPopup();
  }
  searchValueChange(val) {
  }
  onChangeRealBalanceUse(isChecked: boolean) {
    this.authService.SetRealBalanceUse$().pipe(untilDestroyed(this),
      catchError(err => throwError(err))).subscribe((data: any) => {
        if (data && data.isSuccess && data.result) {
          this.isWager = isChecked;
          websiteSettings.data.appIsRealBalanceUse = !isChecked;
          this.commonService.setRealBalanceUseStatus(!isChecked);
          this.toastr.success(data.result.message, "Notification", {
            toastClass: "custom-toast-success"
          });
        }
      }, err => console.log('SetRealBalanceUse', err));
  }
  OnSignUpClick() {
    if (this.click_id && this.referralcode) {
      this.router.navigate(['/signup'], { queryParams: { referralcode: this.referralcode, click_id: this.click_id } });
    } else if (this.click_id) {
      this.router.navigate(['/signup'], { queryParams: { click_id: this.click_id } });
    } else if (this.referralcode) {
      this.router.navigate(['/signup'], { queryParams: { referralcode: this.referralcode } });
    } else {
      this.router.navigate(['/signup']);
    }
  }
  affiliateClick() {
    window.open('https://affiliate.shaktimaan.com', '_blank');
  }
  disabledWager() {
    return this.betService.getBetStatus();
  }
  hideModal() {
    // this.matchedUnmatchedModalInstance.close();
  }
  ngOnDestroy(): void {
    this.mySubscription.unsubscribe();
  }
}
