import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { FanceType } from '@clientApp-core/enums/market-fancy.type';
import { ActiveMarket } from '@clientApp-core/models/market/activemarket.model';
import { AuthFacadeService, GuestMLConfig } from '@clientApp-core/services/authentication/authentication-facade.service';
import { B2cUserService } from '@clientApp-core/services/authentication/b2c-user.service';
import { CommonService } from '@clientApp-core/services/common/common.service';
import { apiEndPointData } from '@clientApp-core/services/config/connfig.service';
import { DeviceInfoService } from '@clientApp-core/services/device-info/deviceinfo.services';
import { SessionService } from '@clientApp-core/services/session/session.service';
import { arrayUniqueByKey, mapUniqueData } from '@clientApp-core/services/shared/JSfunction.service';
import { StoreService } from '@clientApp-core/services/store/store.service';
import { GetSortOrder, fancyRankOrder } from '@clientApp-core/utilities/app-configuration';
import { untilDestroyed } from 'ngx-take-until-destroy';
import { throwError } from 'rxjs';
import { catchError, take } from 'rxjs/operators';
declare var $: any;

@Component({
  selector: 'app-login-layout',
  templateUrl: './login-layout.component.html',
  styleUrls: ['./login-layout.component.scss']
})
export class LoginLayoutComponent implements OnInit, OnDestroy {
  inMaintenance: boolean;
  referralcode: any ='';
  mkt: any = '';
  isNewsExits: boolean;
  isCheckedDarkTheme: boolean = apiEndPointData.data.isDarkTheme ? apiEndPointData.data.isDarkTheme : false;
  loading: boolean;
  click_id: any = '';
  mySubscription: any;
  constructor(public router: Router, private route: ActivatedRoute, public commonService: CommonService,
    private authService: AuthFacadeService, private sessionService: SessionService, private b2cUserService: B2cUserService,
    private storeService: StoreService, public deviceInfoService: DeviceInfoService,private elementRef: ElementRef) {
    this.commonService.getLoginPopupOpen().subscribe(isChecked => {
      if (isChecked) {
        this.openLoginModel();
      }
    });
    this.route.queryParams.subscribe(params => {
      if (params && params['referralcode'] && params['referralcode'] !== '' && apiEndPointData.data.isB2C) {
        this.referralcode = params['referralcode'];
        this.commonService.setCookieValue('referralcodeset', JSON.stringify(params['referralcode']), 30);
        setTimeout(() => {
          this.OnSignUpClick();
        }, 500);
      } else if (params && params['mkt'] && params['mkt'] !== '' && apiEndPointData.data.isB2C) {
        this.mkt = params['mkt'];
        this.commonService.setCookieValue('mktset', JSON.stringify(params['mkt']), 30);
        this.getMarketingCode(params['mkt']);
      } else if (params && params['click_id'] && params['click_id'] !== '' && apiEndPointData.data.isB2C) {
        this.click_id = params['click_id'];
      } else if (params && params['login'] && +params['login'] === 1) {
        setTimeout(() => {
          this.openLoginModel();
        }, 500);
      }
    });
    if (this.router.getCurrentNavigation()?.extras.state) {
      const routeState = this.router.getCurrentNavigation().extras.state;
      if (routeState) {
        // console.log('routeState', routeState);
        if (routeState.data.name == 'login') {
          setTimeout(() => {
            this.openLoginModel();
          }, 500);
        } else if (routeState.data.name == 'Register') {
          setTimeout(() => {
            this.OnSignUpClick();
          }, 500);
        }
      }
    }
    this.commonService.getDarkThemeStatus().subscribe(isChecked => {
      this.isCheckedDarkTheme = isChecked;
    });
    const self = this;
    let currentUrl = this.router.url,previousUrl = null;
    this.mySubscription = this.router.events.subscribe(value => {
      if (value instanceof NavigationEnd) {
        previousUrl = currentUrl;
        currentUrl = value.urlAfterRedirects;
        let eventId = null;
      if (previousUrl !== currentUrl) {
        if (previousUrl.indexOf('/sports') !== 0 && currentUrl.indexOf('/event') !== 0) {
          if(previousUrl.indexOf('/event') === 0){
            const eventUrl = previousUrl.split('/');
            eventId = eventUrl && eventUrl[2] ? +eventUrl[2] : null;
          }
          self.removeCentralGroup(eventId);
        }
      }
      }
    });
  }

  isAccountPage(): boolean {
    const accountRoutes = ['/login', '/signup']; // Define your login and signup routes here
    return accountRoutes.includes(this.router.url);
  }

  ngOnInit(): void {
    this.isNewsExits = this.commonService.isNewsExits;
    this.inMaintenance = apiEndPointData.data.inMaintenance;
    const darkThemeCurrentState = this.commonService.getCookieValue('isCheckedDarkTheme');
    this.isCheckedDarkTheme = (darkThemeCurrentState != null && darkThemeCurrentState != undefined && darkThemeCurrentState != '') ? JSON.parse(darkThemeCurrentState).isCheckedDarkTheme : false;
    this.banner();
    this.getNews();
    this.authService.getTrendingGames();
    this.authService.getMostlyPlayedGames();
    this.authService.GetGuestMLConfig();
    this.authService.GetGuestCasinoConfig();
    this.storeService.stopHubConnections();
    this.sessionService.startCentralSignalrConnections();
    this.sessionService.connectCentralHubConnection();
    this.sessionService.startMarketSignalrConnections();
    this.sessionService.connectMarketHubConnection();
  }
  ngAfterViewInit() {
    var scrollTop = 0;
    $(window).scroll(function () {
      scrollTop = $(window).scrollTop();

      if (scrollTop >= 10) {
        $('#global-nav').addClass('nav_height');
      }
      else if (scrollTop < 10) {
        $('#global-nav').removeClass('nav_height');
      }
    });

  }
   getNews() {
      this.authService.getNews$()
          .pipe(
              untilDestroyed(this),
              take(1),
              catchError(err => throwError(err))
          ).subscribe(response => {
              if (response &&  response.length > 0) {
                  this.isNewsExits = true;
              }
          }, err => console.log('getNews', err));
    }
  banner() {
    if (apiEndPointData.data.isDB) {
      this.authService.getBannerData();
    }
  }
  getMarketingCode(code) {
    const output = '1';
    const getmktcode = sessionStorage.getItem('setmktcode');
    if (getmktcode !== code) {
      sessionStorage.removeItem('isCallMktApi');
    } else {
      sessionStorage.setItem('setmktcode', code);
    }
    const isCallMktApi = sessionStorage.getItem('isCallMktApi');
    if (isCallMktApi !== output) {
      sessionStorage.setItem('setmktcode', code);
      this.b2cUserService.getMarketing(code).pipe(catchError(err => throwError(err))).subscribe(response => {
      }, err => console.log('ReEmailVerification', err));
    }
  }
  openLoginModel() {
    if (this.click_id && this.referralcode) {
      this.router.navigate(['/login'], { queryParams: { referralcode: this.referralcode, click_id: this.click_id } });
    } else if (this.click_id) {
      this.router.navigate(['/login'], { queryParams: { click_id: this.click_id } });
    } else if (this.referralcode) {
      this.router.navigate(['/login'], { queryParams: { referralcode: this.referralcode } });
    } else {
      this.router.navigate(['/login']);
    }
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
  removejscssfile(filename, filetype) {
    var targetelement = (filetype == "js") ? "script" : (filetype == "css") ? "link" : "none" //determine element type to create nodelist from
    var targetattr = (filetype == "js") ? "src" : (filetype == "css") ? "href" : "none" //determine corresponding attribute to test for
    var allsuspects = document.getElementsByTagName(targetelement)
    for (var i = allsuspects.length; i >= 0; i--) { //search backwards within nodelist for matching elements to remove
      if (allsuspects[i] && allsuspects[i].getAttribute(targetattr) != null && allsuspects[i].getAttribute(targetattr).indexOf(filename) != -1)
        allsuspects[i].parentNode.removeChild(allsuspects[i]) //remove element by calling parentNode.removeChild()
    }
  }
  removeCentralGroup(eventId?:any) {
    const markets: ActiveMarket[] = GuestMLConfig.data.allActiveMarketList ? GuestMLConfig.data.allActiveMarketList : [];;
    const allMarkets = markets.sort((a, b) => {
      return fancyRankOrder.get(b.mt) - fancyRankOrder.get(a.mt);
    }).sort(GetSortOrder('ed'));
    const excludeSports = apiEndPointData.data.excludeSports;
    const excludeSport = excludeSports.map(x => x.name);
    const uniqueMarkets = arrayUniqueByKey(allMarkets.filter(v => !excludeSport.includes(v.st)), 'eid');
    let centralizationIds = null, matches = [];
    if (eventId != null) {
      matches  = allMarkets.filter((game) => {
        return (game.eid === eventId);
      });
    } 
    centralizationIds = matches.map(match => match.mc).filter(function (el) {
      return el != null && el != undefined && el != '';
    }).toString();
    if (centralizationIds && centralizationIds !== '' && centralizationIds.length > 0) {
      this.sessionService.removeAllCentralGroup(centralizationIds);
      this.storeService.removeAllStoreData();
    } else {
      const eventids:any = mapUniqueData(uniqueMarkets, 'eid');
    var result = arrayUniqueByKey(allMarkets.filter(function (o1) {
      return eventids.includes(o1.eid) && (o1.mt == FanceType.Market || o1.mt == FanceType.ManualOdds)
    }), 'eid');
     centralizationIds = result.map(match => match.mc).toString();
    }
    this.sessionService.removeCentralDashboardGroup(centralizationIds);
  }
  ngOnDestroy(): void {
    this.mySubscription.unsubscribe();
    this.elementRef.nativeElement.remove();
    if (apiEndPointData.data.isWALoginEnable) {
      const script = document.querySelector(
        'script[src="https://otpless.com/auth.js"]'
      );
      if (script) {
        document.body.removeChild(script);
      }
    }
  }
}
