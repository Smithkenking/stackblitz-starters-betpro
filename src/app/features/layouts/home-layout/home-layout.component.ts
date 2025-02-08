import { Component, OnInit, OnDestroy, ViewChild, NgZone, ElementRef, AfterViewInit, Renderer2 } from '@angular/core';
import { CommonService } from '@clientApp-core/services/common/common.service';
import { MarketRateFacadeService } from '@clientApp-core/services/market/market-rates/market-rate-facade.service';
import { AuthFacadeService, websiteSettings } from '@clientApp-core/services/authentication/authentication-facade.service';
import { StoreService } from '@clientApp-core/services/store/store.service';
import { AudioType } from '@clientApp-core/enums/audio.types';
import { catchError, take, takeUntil } from 'rxjs/operators';
import { NavigationEnd, Router } from '@angular/router';
import { SearchComponent } from '@clientApp-shared/components/search/search.component';
import { SessionService } from '@clientApp-core/services/session/session.service';
import { untilDestroyed } from 'ngx-take-until-destroy';
import { Subject, throwError } from 'rxjs';
import * as M from "materialize-css/dist/js/materialize";
import { ConnectionState } from '@clientApp-core/enums/connectionState-type';
import { apiEndPointData } from '@clientApp-core/services/config/connfig.service';
import { MarketFacadeService } from '@clientApp-core/services/market/market-facade.service';
import { ParkBetState } from '@clientApp-store/store.state';
import { select, Store } from '@ngrx/store';
import * as fromSelectedMarket from '@clientApp-store/selected-market/selectors/selected-market.selectors';
import { fancyRankOrder, GetSortOrder } from '@clientApp-core/utilities/app-configuration';
import { ScriptService } from '@clientApp-core/services/shared/script.service';
import { arrayUniqueByKey, mapUniqueData } from '@clientApp-core/services/shared/JSfunction.service';
import { ActiveMarket } from '@clientApp-core/models/market/activemarket.model';
import { VeronicapopupComponent } from '@clientApp-shared/components/veronicapopup/veronicapopup.component';
import { B2cUserService } from '@clientApp-core/services/authentication/b2c-user.service';
import { SwPush } from '@angular/service-worker';
import { UntypedFormBuilder, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { FanceType } from '@clientApp-core/enums/market-fancy.type';
declare var $: any;

@Component({
  selector: 'app-home-layout',
  templateUrl: './home-layout.component.html',
  styleUrls: ['./home-layout.component.scss']
})
export class HomeLayoutComponent implements OnInit,AfterViewInit, OnDestroy {
  loading: boolean;
  interval;
  user: any;
  private previousUrl: string;
  private currentUrl: string;
  selectedTab = 'Home';
  isMenuOpen = false;
  allMarkets: any = [];
  isDarkTheme: boolean = false;
  isB2C: boolean;
  inMaintenance: boolean;
  isCheckedDarkTheme: boolean = false;
  bottomtabstoggleClass: boolean = false;
  matchedUnmatchedModalInstance: any;
  isBlackListIpAddModalInstances: any;
  matchBetCount = 0;
  unMatchBetCount = 0;
  websiteOrigin: any;
  notifier = new Subject();
  passwordPatterncheck = apiEndPointData.data.ap ? apiEndPointData.data.ap.split("::") : '';
  UpdateUsernamePasswordIns: any;
  isPasswordSame: boolean = true;
  UpdateUsernamePasswordForm= this.fb.group({
    UserName: ['', Validators.required],
    Password: ['',[Validators.required, Validators.pattern(this.passwordPatterncheck[0])]],
    ConfirmPassword: ['',[Validators.required, Validators.pattern(this.passwordPatterncheck[0])]],
  });
  mySubscription: any;
  @ViewChild('search', { static: true }) searchRef: SearchComponent;
  @ViewChild('toggleButton') toggleButton: ElementRef;
  @ViewChild('bottomMenu') bottomMenu: ElementRef;
  @ViewChild('toggleImg') toggleImg: ElementRef;
  @ViewChild('toggleSpan') toggleSpan: ElementRef;
  @ViewChild('veronica', { static: true }) veronicaRef: VeronicapopupComponent;
  @ViewChild('matchedunmatched', { static: true }) matchedUnmatchedModal: ElementRef;
  @ViewChild('verifyIpAdd', { static: true }) verifyIpAdd: ElementRef;
  @ViewChild('UpdateUsernamePassword', { static: true }) UpdateUsernamePassword: ElementRef;
  constructor(public router: Router, public commonService: CommonService,
    private ngZone: NgZone,
    private marketRateService: MarketRateFacadeService,
    private authService: AuthFacadeService,
    private storeService: StoreService,
    private sessionService: SessionService,
    private renderer: Renderer2,
    private store: Store<ParkBetState>,
    private swPush: SwPush,
    private marketFacadeService: MarketFacadeService, private scriptService: ScriptService, private b2cUserService: B2cUserService,
    private fb: UntypedFormBuilder,private toastr: ToastrService) {
    this.commonService.getLoadingStatus().subscribe(status => {
      this.loading = status;
    });
    this.marketRateService.getAudioType$().subscribe((type: AudioType) => {
      let audio = new Audio();
      if (type === AudioType.alert) {
        audio.src = this.commonService.contentRelativePath('assets/audio/alert.mp3');
      } else if (type === AudioType.placeBet) {
        audio.src = this.commonService.contentRelativePath('assets/audio/save_and_checkout.mp3');
      } else if (type === AudioType.notification) {
        audio.src = 'assets/audio/notification.mp3';
      } else {
        audio.src = this.commonService.contentRelativePath('assets/audio/knock_brush.mp3');
      }
      audio.load();
      audio.play();
    });;
    const self = this;
    this.currentUrl = this.router.url;
    this.previousUrl = null;
    this.mySubscription = this.router.events.subscribe(val => {
        if (
          val instanceof NavigationEnd) {
            this.previousUrl = this.currentUrl;
            this.currentUrl = val.urlAfterRedirects;
            if (this.currentUrl == '/account-statement' || this.currentUrl == '/old-account-statement' || this.currentUrl == '/results' ||
              this.currentUrl == '/profit-and-loss' || this.currentUrl == '/open-bets') {
              this.loadScript();
            }
            if ($('.iconMenu-bar').hasClass('open') &&  $(window).width() > 991) {
              $('main').addClass('sidebar-open');
            }
          if (this.previousUrl !== this.currentUrl) {
            self.checkCurrentStatus();
            if (this.previousUrl.indexOf('/sports') !== 0 && this.currentUrl.indexOf('/event') !== 0) {
              self.removeCentralGroup();
            }
          }
        }
    });
    this.renderer.listen('window', 'click',(e:Event)=>{
      /**
       * Only run when toggleButton is not clicked
       * If we don't check this, all clicks (even on the toggle button) gets into this
       * section which in the result we might never see the menu open!
       * And the menu itself is checked here, and it's where we check just outside of
       * the menu and button the condition abbove must close the menu
       */
      if (e.target !== this.toggleButton?.nativeElement &&
        e.target !== this.bottomMenu?.nativeElement &&
        e.target !== this.toggleImg?.nativeElement &&
        e.target !== this.toggleSpan?.nativeElement) {
         this.isMenuOpen = false;
         this.selectedTab = '';
       }
    });
    this.commonService.getDarkThemeStatus().subscribe(isChecked => {
      this.isDarkTheme = isChecked;
    });
    this.marketRateService.getMatchBetCount$().pipe(takeUntil(this.notifier),untilDestroyed(this)).subscribe(matchcount => {
      this.matchBetCount = matchcount;
    });
    this.marketRateService.getUnMatchBetCount$().pipe(takeUntil(this.notifier),untilDestroyed(this)).subscribe(unmatchcount => {
      this.unMatchBetCount = unmatchcount;
    });
  }

  ngOnInit() {
    this.authService.getBlockedMarketData();
    this.requestSubscription();
    this.inMaintenance = apiEndPointData.data.inMaintenance;
    this.authService.getPopularGames();
    this.authService.getRecommendGames();
    if (apiEndPointData.data.isDB) {
      this.authService.getBannerData();
    }
    this.isB2C = websiteSettings.data.isB2C;
    const darkThemeCurrentState = this.commonService.getCookieValue('isCheckedDarkTheme');
    this.isDarkTheme = (darkThemeCurrentState != null && darkThemeCurrentState != undefined && darkThemeCurrentState != '') ? JSON.parse(darkThemeCurrentState).isCheckedDarkTheme : false;
    this.user = JSON.parse(localStorage.getItem('token'));
    this.getConfig();
    this.authService.getConfig(); 
    this.checkSession();
    this.authService.getCasinoConfig();
    if (this.isB2C) {
      this.getUserProfile();
    }
    const output = '1';
    const getIpBlockedstatus = localStorage.getItem('showIpBlockedPopup');
    if (getIpBlockedstatus !== output) {
      this.isBlackListIpAddress();
    }
    const clickId = this.commonService.getCookieValue('vl-cid');
    if (clickId) {
      this.updateClickId(clickId);
    }
  }
  ngAfterViewInit() {
    this.UpdateUsernamePasswordIns = M.Modal.init(this.UpdateUsernamePassword.nativeElement, {});
    this.matchedUnmatchedModalInstance = M.Modal.init(this.matchedUnmatchedModal.nativeElement, {});
    this.isBlackListIpAddModalInstances = M.Modal.init(this.verifyIpAdd.nativeElement, { dismissible: false });
    const user = JSON.parse(localStorage.getItem('token'));
    if (user != null && user.resetPassword && apiEndPointData.data.isWALoginEnable) {
      this.UpdateUsernamePasswordForm.reset();
      this.UpdateUsernamePasswordIns.open();
    }
  }
getUserProfile() {
  if (this.isB2C) {
    this.b2cUserService.getUserProfile();
  }
}
  getConfig() {
    this.authService.getConfig$()
      .pipe(
        untilDestroyed(this), take(1),
        catchError(err => throwError(err))
      ).subscribe(response => {
        if (response) {
          this.commonService.configData = response;
          this.isB2C = websiteSettings.data.isB2C;
          if (this.isB2C) {
            this.getUserProfile();
          }
        }
      }, err => console.log('getConfig', err));
  }
  checkSession() {
    const user = JSON.parse(localStorage.getItem('token'));
    if (user != null) {
      this.getExpTime(user.expireOn);
    }
  }
  getExpTime(strdate) {
    const now = new Date(); //  GMT+0530 (India Standard Time)
    const isoDate = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString();
    const today: any = new Date(isoDate);
    const expDate: any = new Date(strdate);
    const diffMs = (expDate - today); // milliseconds between now & Christmas
    const diffDays = Math.floor(diffMs / 86400000); // days
    const diffHrs = Math.floor((diffMs % 86400000) / 3600000); // hours
    const diffMins = Math.round(((diffMs % 86400000) % 3600000) / 60000); // minutes

    let callAgain = false;
    if (diffDays <= 0) {
      if (diffHrs <= 0) {
        if (diffMins <= 4) {
          clearTimeout(this.interval);
          this.getNewToken();
        } else {
          callAgain = true;
        }
      } else {
        callAgain = true;
      }
    } else {
      callAgain = true;
    }

    if (callAgain) {
      this.ngZone.runOutsideAngular(() => {
        this.interval = window.setTimeout(() => {
          this.getExpTime(strdate);
        }, 60000);
      });
    }
  }
  getNewToken() {
    this.authService.IsAuthorized$().pipe(take(1)).subscribe((data: any) => {
      if (data.isAuthorized) {
        if (data.isNewToken) {
          const user = JSON.parse(localStorage.getItem('token'));
          if (user != null) {
            user.access_token = data.token;
            user.expireOn = data.expireOn;
            localStorage.setItem('token', JSON.stringify(user));
            this.checkSession();
          }
        }
      } else {
        // logout
        this.storeService.clearStore();
      }
    });
  }
  checkCurrentStatus() {
    const user = JSON.parse(localStorage.getItem('token'));
    if (this.checkCurrentStateToProcced(this.sessionService.centeralHubState,
      this.sessionService.marketHubState)) {
      console.log('RE Disconnected');
      if (user != null) {
        this.sessionService.connectCentralHubConnection();
        this.sessionService.connectMarketHubConnection();
      }
    }
  }
  private checkCurrentStateToProcced(marketHubState: number, centralHubState: number): boolean {
    if (marketHubState === ConnectionState.connected && centralHubState === ConnectionState.connected) {
      return false;
    } else {
      return true;
    }
  }
  removeCentralGroup() {
    const markets: ActiveMarket[] = Object.assign([], this.marketFacadeService.marketList);
    this.allMarkets = markets.sort((a, b) => {
      return fancyRankOrder.get(b.mt) - fancyRankOrder.get(a.mt);
    }).sort(GetSortOrder('ed'));
    const excludeSports = apiEndPointData.data.excludeSports;
    const excludeSport = excludeSports.map(x => x.name);
    const uniqueMarkets = arrayUniqueByKey(this.allMarkets.filter(v => !excludeSport.includes(v.st)), 'eid');
    let centralizationIds = this.getSelectedMarket().map(match => match.mc).toString();
    if (centralizationIds && centralizationIds !== '' && centralizationIds.length > 0) {
      this.sessionService.removeAllCentralGroup(centralizationIds);
      this.storeService.removeAllStoreData();
    } else {
      const eventids:any = mapUniqueData(uniqueMarkets, 'eid');
    var result = arrayUniqueByKey(this.allMarkets.filter(function (o1) {
      return eventids.includes(o1.eid) &&(o1.mt == FanceType.Market || o1.mt == FanceType.ManualOdds)
    }), 'eid');         
     centralizationIds = result.map(match => match.mc).toString();
    }
      this.sessionService.removeCentralDashboardGroup(centralizationIds);
  }
  private  getSelectedMarket(): ActiveMarket[] {
    let selectedMarkets: ActiveMarket[] ;
    this.store
    .pipe(select(fromSelectedMarket.getAllMarkets), take(1), catchError(err => throwError(err)))
    .subscribe((markets: any) => selectedMarkets = markets, err => console.log('getSelectedMarket', err));
    return selectedMarkets;
  }
  // for mobile view bottom tab
  onMenuClick(selectedTab: string) {
    this.selectedTab = selectedTab;
    this.commonService.selectedTab = selectedTab;
    this.commonService.setCasinoOpenStatus(false);
    this.storeService.removeAllStoreData();
    if (this.currentUrl !== '/home') {
      this.router.navigateByUrl('/home');
    }
  }
  redirectTo(path) {
    if (websiteSettings.data.isReportPageOpenInNewTab) {
      let newRelativeUrl = this.router.createUrlTree([path]);
      let baseUrl = window.location.href.replace(this.router.url, '');
      window.open(baseUrl + newRelativeUrl, '_blank');
    } else {
    this.commonService.setCasinoOpenStatus(false);
      this.router.navigateByUrl(path);
    }
  }
  onLogOut() {
    this.authService.LogOut$();
    this.storeService.clearStore();
  }
  loadScript() {
    this.scriptService.load('external').then(data => {
  }).catch(error => console.log('loadScript',error));
  }
  isBlackListIpAddress() {
    this.authService.IsBlackListIpAddress$().pipe(take(1)).subscribe((data: any) => {
      localStorage.setItem('showIpBlockedPopup', '1');
      if (data && data.result) {
        const response = data.result;
        if (response.isVliadIP) {
          // valid ip
        } else {
          // not valid ip
          this.isBlackListIpAddModalInstances.open();
        }
      }
    });
  }
  logOut() {
    localStorage.removeItem('showIpBlockedPopup');
    this.isBlackListIpAddModalInstances.close();
    this.authService.LogOut$();
    this.storeService.clearStore();
  }
  requestSubscription = () => {
    if (!this.swPush.isEnabled) {
      console.log("Notification is not enabled.");
      return;
    }
    this.swPush.notificationClicks.subscribe((event:any) => {
      if (event.notification.data.url) {
              window.open(event.notification.data.url, "_blank");
      } 
    }); 
    this.swPush.requestSubscription({
      serverPublicKey: apiEndPointData.data.wpnPublicKey
    }).then((_) => {
      let subscription: any = JSON.parse(JSON.stringify(_));
      const swPayload = {
        Name: "",
        PushEndpoint: subscription.endpoint,
        PushP256DH: subscription.keys.p256dh,
        PushAuth: subscription.keys.auth
      }
      this.authService.getPushNotification(swPayload).subscribe((response)=>{
      })
    }).catch((_) => console.log);
  };
  onUpdateUsernamePassword() {
    this.loading = true;
    if (this.UpdateUsernamePasswordForm.valid && this.isPasswordSame) {
      const body={
        "UserName": this.UpdateUsernamePasswordForm.value.UserName,
        "Password": this.UpdateUsernamePasswordForm.value.Password,
        "ConfirmPassword": this.UpdateUsernamePasswordForm.value.ConfirmPassword
      }
      this.authService.UpdateUsernamePassword(body).pipe(catchError(err => throwError(err))).subscribe((reponse: any) => {
        this.loading = false;
        if (reponse.isSuccess) {
          this.toastr.success(reponse.result.message,"Notification",{
            toastClass: "custom-toast-success"
          });
          this.UpdateUsernamePasswordForm.reset();
          this.UpdateUsernamePasswordIns.close();
          const user = JSON.parse(localStorage.getItem('token'));
          if (user != null) {
            user.resetPassword = false;
            localStorage.setItem('token', JSON.stringify(user));
          }
        } else {
          this.toastr.error(reponse.result.message,"Notification",{
            toastClass: "custom-toast-error"
          });
        }
        
      }, errorObj => {
        this.loading = false;
        console.log('onUpdateUsernamePassword', errorObj);
    });
    } else {
      Object.keys(this.UpdateUsernamePasswordForm.controls).forEach(field => {
        const control = this.UpdateUsernamePasswordForm.get(field);
        control.markAsTouched({ onlySelf: true });
      });
      this.loading = false; 
    }
  }
  compairNewConfirm() {
    const password = this.UpdateUsernamePasswordForm.get('Password').value;
    const confirmPassword = this.UpdateUsernamePasswordForm.get('ConfirmPassword').value;
    this.isPasswordSame = confirmPassword && password === confirmPassword;
  }
  updateClickId(code) {
    const output = '1';
    const getmktcode = sessionStorage.getItem('setclickidcode');
    if (getmktcode !== code) {
      sessionStorage.removeItem('isCallClickIdApi');
    } else {
      sessionStorage.setItem('setclickidcode', code);
    }
    const isCallClickIdApi = sessionStorage.getItem('isCallClickIdApi');
    if (isCallClickIdApi !== output) {
      sessionStorage.setItem('setclickidcode', code);
      this.b2cUserService.updateClickId(code).pipe(catchError(err => throwError(err))).subscribe(response => {
      }, err => console.log('updateClickId', err));
    }
  }
  ngOnDestroy() {
    this.mySubscription.unsubscribe();
    window.clearTimeout(this.interval);
    this.notifier.next();
    this.notifier.complete();
  }
}
