import { Component, HostListener, ViewChild, TemplateRef, OnInit, Inject, Renderer2, AfterViewInit, ElementRef } from '@angular/core';
import { NavigationStart, NavigationEnd, NavigationCancel, NavigationError, Router, Event, ActivatedRoute } from '@angular/router';
import { CommonService } from '@clientApp-core/services/common/common.service';
import { SessionService } from '@clientApp-core/services/session/session.service';
import { AuthFacadeService } from '@clientApp-core/services/authentication/authentication-facade.service';
import { take } from 'rxjs/operators';
import { fromEvent } from 'rxjs';
import { ConnectionState } from '@clientApp-core/enums/connectionState-type';
import { DOCUMENT, LocationStrategy } from '@angular/common';
import { apiEndPointData } from '@clientApp-core/services/config/connfig.service';
import { ToastrService } from 'ngx-toastr';
import * as M from "materialize-css/dist/js/materialize";
import { StoreService } from '@clientApp-core/services/store/store.service';
import { MarketRateFacadeService } from '@clientApp-core/services/market/market-rates/market-rate-facade.service';
import { DeviceInfoService } from '@clientApp-core/services/device-info/deviceinfo.services';
import { Meta, Title } from '@angular/platform-browser';
import { DataLayerService } from '@clientApp-core/services/window/DataLayerService.service';
declare var $: any;

export let locationDetails = {};
declare let gtag: Function;
declare let fbq: Function;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, AfterViewInit {
  loading = false;
  status = 'ONLINE';
  isConnected = true;
  isChatEnable = apiEndPointData.data.isChatEnable;
  wa = apiEndPointData.data.wa;
  favIcon: HTMLLinkElement = window.document.querySelector('#appIcon');
  script = this.renderer.createElement('script');
  toastRef;
  isBlackListIpAddModalInstances: any;
  websiteOrigin: any;
  isShowWhatsapptext: boolean = true;
  inMaintenance: boolean;
  previousUrl: string = null;
  currentUrl: string = null;
  user: any;
  isShowCokkieContent: boolean;
  @ViewChild('template', { static: true }) template: TemplateRef<any>;
  @ViewChild('verifyIpAdd', { static: true }) verifyIpAdd: ElementRef;
  constructor(@Inject(DOCUMENT) private document: Document, private router: Router
    , private storeService: StoreService
    , public commonService: CommonService
    , private marketRateFacadeService: MarketRateFacadeService
    , private sessionService: SessionService
    , private _authService: AuthFacadeService
    , private renderer: Renderer2
    , private toastr: ToastrService
    , private titleService: Title
    , private location: LocationStrategy, public deviceInfoService: DeviceInfoService,
    private activatedRoute: ActivatedRoute,
    private metaService: Meta, private dataLayerService: DataLayerService) {
    locationDetails = document.location;
    this.initalizeCss();
    history.pushState(null, null, window.location.href);
    // check if back or forward button is pressed.
    this.location.onPopState(() => {
      history.pushState(null, null, window.location.href);
    });
    router.events.subscribe((routerEvent: Event) => {
      if (routerEvent instanceof NavigationEnd) {
        this.previousUrl = this.currentUrl;
        this.currentUrl = routerEvent.url;
        this.user = JSON.parse(localStorage.getItem('token'));
        this.commonService.setPreviousUrl(this.previousUrl);
        if (routerEvent.url !== routerEvent.urlAfterRedirects && (this.user == null || this.user == undefined || this.user == "")) {
          localStorage.setItem('Deeplinked', routerEvent.url);
        } else {
          localStorage.removeItem('Deeplinked');
        }
        if (this.user == null || this.user == undefined || this.user == "") {
          this.isShowWhatsapptext = true;
        } else {
          this.isShowWhatsapptext = false;
        }
        if (apiEndPointData.data.isGoogleAnalyticsEnable) {
          gtag('config', apiEndPointData.data.GoogleAnalyticsTrackingID,
            {
              'page_path': routerEvent.urlAfterRedirects
            }
          );

        }
        if (apiEndPointData.data.isMetaPixelEnable) {
          fbq('track', 'PageView');
        }
        var rt = this.getChild(this.activatedRoute)
        rt.data.subscribe(data => {

          if (data.title) {
            this.titleService.setTitle(data.title);
            this.metaService.updateTag({ name: 'title', content: data.title })
          } else {
            this.setTitle();
            this.metaService.removeTag("name='title'")
          }
          // if (data.description) {
          //   this.metaService.updateTag({ name: 'description', content: data.description })
          // } else {
          //   this.metaService.removeTag("name='description'")
          // }
          // if (data.keywords) {
          //   this.metaService.updateTag({ name: 'keywords', content: data.keywords })
          // } else {
          //   this.metaService.removeTag("name='keywords'")
          // }
          // if (data.robots) {
          //   this.metaService.updateTag({ name: 'robots', content: data.robots })
          // } else {
          //   this.metaService.updateTag({ name: 'robots', content: "follow,index" })
          // }


        })
      }
      window.scrollTo(0, 0);
      this.checkRouterEvent(routerEvent);
    });
    this.isConnected = window.navigator.onLine;
    fromEvent(window, 'online').subscribe(e => {
      this.toastr.clear(this.toastRef.ToastId);
      console.log('ONLINE');
      this.checkCurrentStatus();
      const user = JSON.parse(localStorage.getItem('token'));
      if (user != null) {
        this.isBlackListIpAddress();
      }
    });
    fromEvent(window, 'offline').subscribe(e => {
      this.isConnected = false;
      console.log('OFFLINE');
      this.toastRef = this.toastr.error('Make sure your device is connected to the internet.', 'No Internet Connection', {
        toastClass: "custom-toast-error",
        closeButton: false,
        progressBar: false,
        timeOut: 0,
        tapToDismiss: false
      });
    });
    this.commonService.getLoadingStatus().subscribe(status => {
      this.loading = status;
    });
  }
  @HostListener('window:focus', ['$event'])
  onFocus(event: any): void {
    this.checkCurrentStatus();
  }
  @HostListener("window:visibilitychange", ["$event"])
  onVisibilityChange($event) {
    const isVisible = $event.target.visibilityState === 'visible';
    if (isVisible) {
      this.checkCurrentStatus();
    } else {
      // tab is not-visible
    }
  }
  @HostListener('window:blur', ['$event'])
  onBlur(event: any): void {
  }
  @HostListener('contextmenu', ['$event'])
  onRightClick(event) {
    event.preventDefault();
  }
  checkRouterEvent(routerEvent: Event): void {
    if (routerEvent instanceof NavigationStart) {
      this.loading = true;
      this.commonService.setLoadingStatus(true);
    }
    if (routerEvent instanceof NavigationEnd
      || routerEvent instanceof NavigationCancel
      || routerEvent instanceof NavigationError) {
      let linkEl: any = document.head.querySelector('link[href*="/custom.min.css"]');
      if (Boolean(linkEl.sheet)) {
        this.loading = false;
        this.commonService.setLoadingStatus(false);
      } else {
        this.loading = true;
        this.commonService.setLoadingStatus(true);
      }

    }
  }
  checkCurrentStatus() {
    const user = JSON.parse(localStorage.getItem('token'));
    if (this.checkCurrentStateToProcced(this.sessionService.centeralHubState,
      this.sessionService.marketHubState)) {
      console.log('Disconnected');
      this.sessionService.connectCentralHubConnection();
      this.sessionService.connectMarketHubConnection();
    }
  }
  private checkCurrentStateToProcced(marketHubState: number, centralHubState: number): boolean {
    if (marketHubState === ConnectionState.connected && centralHubState === ConnectionState.connected) {
      return false;
    } else {
      return true;
    }
  }
  ngOnInit() {
    const self = this;
    this.inMaintenance = apiEndPointData.data.inMaintenance;
    this._authService.getBlockData();
    this.websiteOrigin = window.location.host;
    const uiTheme = apiEndPointData.data.themes ? apiEndPointData.data.themes : null;
    this.favIcon.href = uiTheme ? uiTheme.fic : '';
    // this.setTitle();
    if (apiEndPointData.data.isGoogleAnalyticsEnable) {
      this.loadGoogleAnalytics(apiEndPointData.data.GoogleAnalyticsTrackingID);
    }
    if (apiEndPointData.data.isGoogleTagManagerEnable) {
      this.setGTagManager();
    }
    if (apiEndPointData.data.isMetaPixelEnable) {
      this.setMetaPixel();
    }
    const getCookieValue = this.commonService.getCookieValue('cookies_accepted');
    if (getCookieValue && getCookieValue == 'yes') {
      this.isShowCokkieContent = true;
    } else {
      this.isShowCokkieContent = false;
    }
    let linkEl: any = document.head.querySelector('link[href*="/custom.min.css"]');
    this.loading = !Boolean(linkEl.sheet);
    linkEl.addEventListener('load', function () {
      self.loading = false;
    });
    linkEl.onerror = () => {
      self.loading = false;
      console.log("An error occurred loading the stylesheet!");
    };
    const channel = new BroadcastChannel('tabSyncChannel');
    const specificRoutes = ['/event/', '/casinoGame/'];
    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        const currentUrl = event.url;
        if (this.isSpecificRoute(currentUrl)) {
          channel.postMessage(currentUrl);
        }
      }
    });
    window.addEventListener('focus', () => {
      const currentUrl = window.location.href;
      if (this.isSpecificRoute(currentUrl)) {
        channel.postMessage(currentUrl);
      }
    });
    channel.addEventListener('message', event => {
      const receivedUrl = event.data;
      if (this.isSpecificRoute(receivedUrl) && receivedUrl !== window.location.href) {
        this.router.navigateByUrl('/home');
      }
    });

  }
  isSpecificRoute(url: string): boolean {
    return ['/event/', '/casinoGame/'].some(route => url.includes(route));
  }
  ngAfterViewInit() {
    const self = this;
    $(window).scroll(function () {
      if ($(this).scrollTop() > 100) {
        $('.scrollToTop').fadeIn();
      } else {
        $('.scrollToTop').fadeOut();
      }
    });
    this.isBlackListIpAddModalInstances = M.Modal.init(this.verifyIpAdd.nativeElement, { dismissible: false });
    if (apiEndPointData.data.isMetaPixelEnable) {
      $(document.body).prepend('<noscript><img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=' + apiEndPointData.data.MetaPixelId + '&ev=PageView&noscript=1"/></noscript>')
    }
  }
  capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }
  loadStyle(styleName: string) {
    const head = this.document.getElementsByTagName('head')[0];

    const style = this.document.createElement('link');
    style.id = 'client-theme';
    style.rel = 'stylesheet';
    style.href = `${styleName}`;

    head.appendChild(style);

  }
  loadGoogleAnalytics(trackingID: string): void {

    let gaScript = document.createElement('script');
    gaScript.setAttribute('async', 'true');
    gaScript.setAttribute('src', `https://www.googletagmanager.com/gtag/js?id=${trackingID}`);

    let gaScript2 = document.createElement('script');
    gaScript2.innerHTML =
      `window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());

      gtag('config', '${trackingID}');`;

    document.documentElement.firstChild.appendChild(gaScript);
    document.documentElement.firstChild.appendChild(gaScript2);
  }
  setGTagManager() {

    const s = this.document.createElement('script');
    s.innerHTML = `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
    new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
    j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
    'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
    })(window,document,'script','dataLayer','${apiEndPointData.data.GoogleTagManagerId}')`;
    const head = this.document.getElementsByTagName('head')[0];
    head.appendChild(s);
    $(document.body).prepend('<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=' + apiEndPointData.data.GoogleTagManagerId + ' height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>');
  }
  setMetaPixel() {
    const head = document.getElementsByTagName('head')[0];
    const script: HTMLScriptElement = document.createElement('script');
    script.innerHTML = `!function(f,b,e,v,n,t,s)
    {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};
    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
    n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t,s)}(window, document,'script',
    'https://connect.facebook.net/en_US/fbevents.js');
    fbq('init', '${apiEndPointData.data.MetaPixelId}');
    fbq('track', 'PageView')`;
    head.appendChild(script);
  }
  scrollToTop() {
    $('html, body').animate({ scrollTop: 0 }, 100);
  }
  initalizeCss() {
    this.loading = true;
    var commonCssPath = apiEndPointData.data.commonCssPath;
    for (var c = 0; c < commonCssPath.length; c++) {
      this.loadStyle(apiEndPointData.data.commonContentPath + commonCssPath[c]);
    }
    var themeCssPath = apiEndPointData.data.themeCssPath;
    for (var c = 0; c < themeCssPath.length; c++) {
      // this.loadStyle(apiEndPointData.data.themeBasePath + themeCssPath[c]);
      this.loadStyle(themeCssPath[c]);
    }
    // this.loading = false;
  }
  isBlackListIpAddress() {
    this._authService.IsBlackListIpAddress$().pipe(take(1)).subscribe((data: any) => {
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
  onWhatsappClick() {
    const _currentSet = {
      'event': 'whatsapp_click'
    };
    this.dataLayerService.pingHome(_currentSet);
    const user = JSON.parse(localStorage.getItem('token'));
    if (user != null) {
      window.open(apiEndPointData.data.WhatsappURLafterLogin, '_blank');
    } else {
      window.open(apiEndPointData.data.WhatsappURLbeforeLogin, '_blank');
    }
  }
  logOut() {
    this.isBlackListIpAddModalInstances.close();
    this._authService.LogOut$();
    this.storeService.clearStore();
  }
  getChild(activatedRoute: ActivatedRoute) {
    if (activatedRoute.firstChild) {
      return this.getChild(activatedRoute.firstChild);
    } else {
      return activatedRoute;
    }

  }
  acceptAllCookies() {
    this.isShowCokkieContent = true;
    this.commonService.setCookieValue('cookies_accepted', 'yes');
  }
  setTitle() {
    const origin = window.location.host;
    let url = origin.lastIndexOf(".") > -1 ? origin.substring(0, origin.lastIndexOf(".")) : origin;
    const websiteName = this.capitalizeFirstLetter(url.replace(/^(?:https?:\/\/)?(?:www\.)?/i, ""));
    const title = apiEndPointData.data.title ? apiEndPointData.data.title + websiteName : websiteName;
    this.titleService.setTitle(title);
  }
}
