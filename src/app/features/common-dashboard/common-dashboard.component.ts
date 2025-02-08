import { Component, OnInit, Input, OnDestroy, SimpleChanges, AfterViewInit, ViewChild } from '@angular/core';
import { CommonService } from '@clientApp-core/services/common/common.service';
import { mapMarket } from '@clientApp-core/services/shared/dashboard-shared.service';
import { fancyRankOrder, GetSortOrder } from '@clientApp-core/utilities/app-configuration';
import { AuthFacadeService, GuestMLConfig, websiteSettings } from '@clientApp-core/services/authentication/authentication-facade.service';
import { SessionService } from '@clientApp-core/services/session/session.service';
import { StoreService } from '@clientApp-core/services/store/store.service';
import { MarketRateFacadeService } from '@clientApp-core/services/market/market-rates/market-rate-facade.service';
import { ActivatedRoute, Router } from '@angular/router';
import { apiEndPointData } from '@clientApp-core/services/config/connfig.service';
import { DeviceInfoService } from '@clientApp-core/services/device-info/deviceinfo.services';
import { BehaviorSubject, Observable, Subject, of, throwError } from 'rxjs';
import { untilDestroyed } from 'ngx-take-until-destroy';
import { catchError, switchMap, take, takeUntil } from 'rxjs/operators';
import { mapSportCount, arrayUniqueByKey, sortBySport, mapUniqueData, getInplayMarkets } from '@clientApp-core/services/shared/JSfunction.service';
import { ActiveMarket } from '@clientApp-core/models/market/activemarket.model';
import { FanceType, GameType } from '@clientApp-core/enums/market-fancy.type';
import { userProfileInfo } from '@clientApp-core/services/authentication/b2c-user.service';
import { DataLayerService } from '@clientApp-core/services/window/DataLayerService.service';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@clientApp-shared/shared.module';
import { HighlightDirective } from '@clientApp-shared/directive/highlight.directive';
import { CheckFancyTypePipe } from "../../shared/pipes/check-fancy-type.pipe";
import { CheckInplayTypePipe } from "../../shared/pipes/check-inplay-type.pipe";
import { Top8marketsPipe } from "../../shared/pipes/top8markets.pipe";
import { OrdinalDatePipe } from "../../shared/pipes/ordinal-date.pipe";
import { AllInplayMarketPipe } from "../../shared/pipes/all-inplay-market.pipe";
import { SportsIconPipe } from "../../shared/pipes/sports-icon.pipe";
import { InplayMarketsPipe } from "../../shared/pipes/inplay-markets.pipe";
import { UpComingMarketsPipe } from "../../shared/pipes/up-coming-markets.pipe";
import { NameFormatePipe } from "../../shared/pipes/name-formate.pipe";
import { BetFacadeService, clientBalance } from '@clientApp-core/services/bet/bet.facade.service';
import { SlickCarouselComponent, SlickCarouselModule } from 'ngx-slick-carousel';
import { MarketFacadeService } from '@clientApp-core/services/market/market-facade.service';
import { RacingTimePipe } from '@clientApp-shared/pipes/racing-time.pipe';
import * as moment from 'moment-timezone';
import { IstToPktPipe } from '@clientApp-shared/pipes/ist-to-pkt.pipe';
import { LiabilityComponent } from '@clientApp-shared/components/liability/liability.component';
declare var $: any;
@Component({
  standalone: true,
  selector: 'app-common-dashboard',
  templateUrl: './common-dashboard.component.html',
  styleUrls: ['./common-dashboard.component.scss'],
  imports: [CommonModule, SharedModule, HighlightDirective, CheckFancyTypePipe,
    CheckInplayTypePipe, Top8marketsPipe, OrdinalDatePipe, AllInplayMarketPipe,
    SportsIconPipe, InplayMarketsPipe, UpComingMarketsPipe,
    NameFormatePipe, SlickCarouselModule, IstToPktPipe, LiabilityComponent]
})
export class CommonDashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() allMarkets: ActiveMarket[];
  @ViewChild('slickModal') slickModal: SlickCarouselComponent;
  @ViewChild('liability', { static: true }) liabilityRef: LiabilityComponent;  
  user: any;
  groupedSportType: any = [];
  notifier = new Subject();
  account: any;
  WalletList: any = [];
  excludeSport = [];
  excludeSports = [];
  selectedSport = 'Cricket';
  uniqueMarkets: ActiveMarket[] = [];
  sportList = [];
  selectedMatchcookie: any = [];
  rmatches: any[];
  horseRacing: any[];
  greyhoundRacing: any[];
  private _marketSubject = new BehaviorSubject<boolean>(null);
  cpuWorker: any;
  selectedTournament: string = 'All Tournament';
  selectedCount = 'All';
  isUpcomingMarkets: boolean = false;
  routeSubscription: any;
  showAllInplayEvents: number = 8;
  showAllUpcomingEvents: number = 8;
  loading = false;
  virtualSportsWorker: any
  isCheckDevice: boolean = false;
  @ViewChild('allSlider') allSlider: any;
  slickConfig = {
    infinite: true,
    autoplay: false,
    variableWidth: true,
    speed: 500,
    autoplaySpeed: 1500,
    cssEase: 'linear',
    swipeToSlide: false,
    slidesToShow: 8,
    slidesToScroll: 1,
    dots: false,
    arrows: true,
    responsive: [

      {
        breakpoint: 1500,
        settings: {
          slidesToShow: 6,
          slidesToScroll: 5
        }
      },

      {
        breakpoint: 1199,
        settings: {
          slidesToShow: 5,
          slidesToScroll: 4
        }
      },

      {
        breakpoint: 767,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
          speed: 500,
          autoplaySpeed: 500,
          variableWidth: false,
        }
      }]
  }
  isVirtualMarkets: boolean = false;
  constructor(public commonService: CommonService,
    public sessionService: SessionService,
    private storeService: StoreService,
    private marketRateService: MarketRateFacadeService,
    public router: Router,
    public betService: BetFacadeService,
    public deviceInfoService: DeviceInfoService,
    private marketRateFacadeService: MarketRateFacadeService,
    private authService: AuthFacadeService, private route: ActivatedRoute, private marketService: MarketFacadeService,
    private dataLayerService: DataLayerService) {
      this.routeSubscription = this.route.params.pipe().subscribe((params) => {
        if (params && !this.isEmpty(params)) {
          const selectedSport = params["sport"];
          if (selectedSport === 'Upcoming') {
            this.isUpcomingMarkets = true;
            this.isVirtualMarkets = false;
          } else if(selectedSport === 'E-Sports'){
            this.isUpcomingMarkets = false;
            this.isVirtualMarkets = true;
            this.selectedSport = 'Inplay';
          } else {
            this.isUpcomingMarkets = false;
            this.isVirtualMarkets = false;
            this.selectedSport = selectedSport;
          }
          this.selectedTournament = "All Tournament";
        } else {
          this.selectedSport = 'Inplay';
        }
      });
  }

  ngOnInit() {
    this.user = JSON.parse(localStorage.getItem('token'));
    // this.excludeSports = apiEndPointData.data.excludeSports;
    // this.excludeSport = this.excludeSports.map(x => x.name);
    if (this.user != null) {
      // this.isB2C = websiteSettings.data.isB2C;
      // this.isWager = !websiteSettings.data.appIsRealBalanceUse;
      // this.isAutowagerPlacebet = websiteSettings.data.appIsAutowagerPlacebet;
      // this.isListwithTournament = websiteSettings.data.isLeftSideBarTournamentView;
      // this.getMarkets();
      this.getConfig();
      this.betService.getBalanceAndWallet();
      this.betService.checkBalanceAndWallet$().pipe(
        switchMap((resp) => {
          return of(resp);
        }
        )
      ).subscribe(value => {
        this.account = value.clientBalance;
        this.WalletList = value.lstWalletAmount;
        if (this.account && this.account.liability) {
          this.account.liability = Math.abs(this.account.liability);
        }
        this.commonService.accountbalance = this.account.balance;
        const output = '1';
        const getLowBalMsg = localStorage.getItem('showLowBalMsg');
        if (this.account.balance == 0 && getLowBalMsg !== output) {
          localStorage.setItem('showLowBalMsg', '1');
          this.router.navigateByUrl('/deposit');
        } else if (this.account.balance < 100 && getLowBalMsg !== output) {
          localStorage.setItem('showLowBalMsg', '1');
          // this.toastr.error('Your balance is low, please Recharge now and start earning more!', "Low balance", {
          //     toastClass: "custom-toast-error",
          //     closeButton: true,
          //     timeOut: 0,
          //     tapToDismiss: false,
          //     // @ts-ignore
          //     buttons: this.toastButtons
          // })
          //     .onAction.subscribe(x => {
          //         // alert(`${x.title} is pressed`);
          //         // console.log(x);
          //         if (x.title == 'Deposit') {
          //             this.router.navigateByUrl('/deposit');
          //         } else if (x.title == 'Refer a friend') {
          //             this.router.navigateByUrl('/referandearn');
          //         }
          //     });
          //   }).onTap
          //   .pipe(take(1))
          //   .subscribe(() => { this.router.navigateByUrl('/deposit');});

        }
      });
      // this.newsService.getNews();
      // this.getNews();
      // this.getBalanceAndLiability();
      // this.authService.notificationList();
      // this.getNotificationList();
      // this.marketRateFacadeService.getNotificationFromSignalr$().subscribe((item: any) => {
      //     this.marketRateFacadeService.setAudioType().next(AudioType.notification);
      //     this.selectedNotification = item;
      //     this.notificationRef.open();
      //     if (item?.isc && item?.dpt) {
      //         setTimeout(() => {
      //             this.notificationRef?.close();
      //             this.selectedNotification = null;
      //         }, item?.dpt);
      //     }
      //     this.authService.notificationList();
      // });
      // const allMarkets = this.marketService.marketList;
      // this.isShowVirtualSports = allMarkets.some(el => el.mt == FanceType.Sportbook);
    }
    if (typeof Worker !== 'undefined') {
      this.cpuWorker = new Worker(new URL('../../worker/cpu.worker', import.meta.url),
        { type: "module" });
      this.cpuWorker.onmessage = ({ data }) => {
        const marketDetail = data.marketDetail, mi = data.mi;
        if (this.allMarkets && this.allMarkets.length > 0
          && marketDetail && marketDetail.length > 0) {
          this.allMarkets?.map((obj: any) => {
            const eventObj = this.allMarkets.find(x => data.mi == +x.mc);
            if (eventObj.eid == obj.eid) {
              obj.marketDetail = marketDetail;
            }
          });
        }
      };
      this.virtualSportsWorker = new Worker('../../worker/virtualsports.worker',
        { type: "module" });
      this.virtualSportsWorker.onmessage = ({ data }) => {
        this.allMarkets = this.allMarkets.concat(data);
        this.addObjtoAllMarkets();
        // this.getCategoryType();
        // this.getGropWiseData();
      };
    } else {
      // Web workers are not supported in this environment.
      // You should add a fallback so that your 
      // program still executes correctly.
    }
    this.getConfig();
    this.user = JSON.parse(localStorage.getItem('token'));
    this.excludeSports = apiEndPointData.data.excludeSports;
    this.excludeSport = this.excludeSports.map(x => x.name);
    if (this.allMarkets && this.allMarkets.length > 0) {
      this.addObjtoAllMarkets();
      this.getCategoryType();
      this._marketSubject.next(true);
    }
    this.getRunningMarketDetail();
    this.marketRateFacadeService.getAddNewDashboardMarketInfo$().subscribe(data => {
      this.allMarkets =  this.allMarkets.concat(data);
      this.marketService.marketList = Object.assign([],this.allMarkets);
      this.addObjtoAllMarkets();
      // this.virtualSportsWorker.postMessage(data);
    });
    this.marketRateFacadeService.eventDateChangeStatus$().subscribe(data => {
      // console.log('eventDateChange', data);
      if (this.allMarkets && this.allMarkets.length > 0) {
        this.allMarkets.forEach(x => {
          if (x.eid == data.eid) {
            x.ed = data.ed;
          }

        });
      }
    });
  }
  ngOnChanges(changes: SimpleChanges) {
    if (changes && changes.allMarkets && changes.allMarkets.previousValue) {
      this.addObjtoAllMarkets();
      this.getCategoryType();
      this._marketSubject.next(true);
    }
  }
  getBalanceAndLiability() {
    this.marketRateFacadeService.getBalance$().subscribe((data: any) => {
      const balance = data && data.length > 0 ? data[0].appBalance : null;
      if (balance !== null && balance !== undefined && balance >= 0) {
        this.account.balance = balance;
        this.commonService.accountbalance = this.account.balance;
        clientBalance.balance = balance;
      }
      const withdrawableAmount = data && data.length > 0 ? data[0].appWithdrawableAmount : null;
      if (withdrawableAmount !== null && withdrawableAmount !== undefined && withdrawableAmount >= 0) {
        this.account.withdrawableAmount = withdrawableAmount;
        clientBalance.withdrawableAmount = withdrawableAmount;
      }
    });
    this.marketRateFacadeService.getLiability$().subscribe((liability: any) => {
      if (liability !== null && liability !== undefined && liability >= 0) {
        this.account.liability = Math.abs(liability);
        clientBalance.liability = Math.abs(liability);
      }
    });
    this.marketRateFacadeService.getWallet$().subscribe((wallet: any) => {
      if (wallet !== null && wallet !== undefined) {
        var objIndex = this.WalletList.findIndex(x => x.walletId == wallet.walletId);
        if (objIndex !== undefined && objIndex !== null && objIndex >= 0) {
          this.WalletList[objIndex].walletName = wallet.walletName;
          this.WalletList[objIndex].walletAmount = wallet.walletAmount;
        } else {
          this.WalletList.push(wallet);
        }
      }
    });
  }
  ngAfterViewInit(): void {
    setTimeout(() => {
      this.sportScrollEvent();
    }, 1000);
    const scroll:any = document.querySelector(".sports-scroll ");
    var isDown = false;
    var scrollX;
    var scrollLeft;
    if(scroll){
    // Mouse Up Function
    scroll.addEventListener("mouseup", () => {
    isDown = false;
    scroll.classList.remove("active");
    });

    // Mouse Leave Function
    scroll.addEventListener("mouseleave", () => {
    isDown = false;
    scroll.classList.remove("active");
    });

    // Mouse Down Function
    scroll.addEventListener("mousedown", (e) => {
    e.preventDefault();
    isDown = true;
    scroll.classList.add("active");
    scrollX = e.pageX - scroll.offsetLeft;
    scrollLeft = scroll.scrollLeft;
    });

    // Mouse Move Function
    scroll.addEventListener("mousemove", (e) => {
    if (!isDown) return;
    e.preventDefault();
    var element = e.pageX - scroll.offsetLeft;
    var scrolling = (element - scrollX) * 2;
    scroll.scrollLeft = scrollLeft - scrolling;
    });
  }
  }
  sportScrollEvent() {
    const scroll: any = this.allSlider?.nativeElement;;
    var isDown = false;
    var scrollX;
    var scrollLeft;
    if (scroll) {
      // Mouse Up Function
      scroll.addEventListener("mouseup", () => {
        isDown = false;
        scroll.classList.remove("active");
      });

      // Mouse Leave Function
      scroll.addEventListener("mouseleave", () => {
        isDown = false;
        scroll.classList.remove("active");
      });

      // Mouse Down Function
      scroll.addEventListener("mousedown", (e) => {
        e.preventDefault();
        isDown = true;
        scroll.classList.add("active");
        scrollX = e.pageX - scroll.offsetLeft;
        scrollLeft = scroll.scrollLeft;
      });

      // Mouse Move Function
      scroll.addEventListener("mousemove", (e) => {
        if (!isDown) return;
        e.preventDefault();
        var element = e.pageX - scroll.offsetLeft;
        var scrolling = (element - scrollX) * 2;
        scroll.scrollLeft = scrollLeft - scrolling;
      });
    }
  }
  onUpcomingCountClick(selectedCount) {
    this.selectedCount = selectedCount;
    this.selectedTournament = 'All Tournament';
  }
  getCurrentMarket$(): Observable<boolean> {
    return this._marketSubject.asObservable();
  }
  addObjtoAllMarkets() {
    this.allMarkets = this.allMarkets.sort((a, b) => {
      return fancyRankOrder.get(b.mt) - fancyRankOrder.get(a.mt);
    }).sort(GetSortOrder('ed'));
    let result: any;
    if (apiEndPointData.data.marketnames) {
      const mapData = apiEndPointData.data.marketnames.map(element => {
        return element.toLowerCase().replace(/\s/g, '');
      });
      result = this.allMarkets.filter(item => mapData.includes(item.mn.toLowerCase().replace(/\s/g, '')));
    } else {
      const eventids: any = mapUniqueData(this.allMarkets, 'eid');
      result = this.allMarkets.filter(function (o1) {
        return eventids.includes(o1.eid) && (o1.mt == FanceType.Market || o1.mt == FanceType.Sportbook)
      });
    }
    this.uniqueMarkets = Object.assign([], result);
    this.joinCentralGroup();
    const result1 = this.allMarkets.reduce((r, o) => {
      r[this.excludeSport.includes(o.st) ? 'racingMarkets' : 'allMarkets'].push(o);
      return r;
    }, { racingMarkets: [], allMarkets: [] });
    const racingMarkets = result1.racingMarkets;
    if (racingMarkets && racingMarkets.length > 0) {
      this.rmatches = mapMarket(racingMarkets.sort((a, b) => {
        return fancyRankOrder.get(b.mt) - fancyRankOrder.get(a.mt);
      }).sort(GetSortOrder('ed')));
      //  
      this.horseRacing = this.allMarkets.filter(market => market.st === 'Horse Racing').sort((a: any, b: any) => b.ed - a.ed);
      this.greyhoundRacing = this.allMarkets.filter(market => market.st === 'Greyhound Racing').sort((a: any, b: any) => b.ed - a.ed); 
    }
    if (this.router.url.indexOf('/home') !== 0 && this.router.url.indexOf('/sports/Upcoming') !== 0) {
      // this.selectedSport = 'Inplay';
    } else {
      this.selectedSport = 'Cricket';
    }
  }

  trackByFn(index, item) {
    return index;
  }
  onSportsClick(selectedSports: string) {
    if (this.deviceInfoService.isMobile()) {
      this.showAllInplayEvents = 4;
      this.showAllUpcomingEvents = 4;
    } else {
      this.showAllInplayEvents = 10;
      this.showAllUpcomingEvents = 10;
    }
    this.selectedTournament = 'All Tournament';
    this.selectedSport = selectedSports;
    // if (this.selectedSport !== 'All Sports') {
    //   localStorage.setItem('selectedSport', selectedSports);
    // }
    this.joinCentralGroup();
  }
  onTournamentClick(tournament: string) {
    this.selectedTournament = tournament;

  }

  onMarketClick(match: any, betId?) {
    if (this.user !== null) {
      var matchCookie = [];
      if (this.commonService.getCookieValue('selected_match_name')) {
        matchCookie = JSON.parse(this.commonService.getCookieValue('selected_match_name'));
      }
      if (matchCookie != null) {
        this.selectedMatchcookie = matchCookie;
      }
      var selectedMatchName = match.eid;
      const matchObj = new Object({
        id: selectedMatchName,
        type: 'Match',
        date: new Date()
      });
      this.selectedMatchcookie.push(matchObj);
      var selectedMatchcookieStr = JSON.stringify(this.selectedMatchcookie);
      this.commonService.setCookieValue('selected_match_name', selectedMatchcookieStr);
    }
    let matches;
    if (betId && betId !== undefined) {
      matches = this.allMarkets.filter((game) => {
        return (game.eid === match.eid && game.mid === betId);
      });
    } else {
      matches = this.allMarkets.filter((game) => {
        return game.eid === match.eid;
      });
    }
    if (apiEndPointData.data.isdr) {
      this.removeAllGroup();
    }
    this.storeService.removeAllStoreData();
    this.marketRateService.curMatchInfo = [];
    this.marketRateService.curMarketsVol = [];
    this.marketRateService.curMarketsRate = [];
    this.marketRateService.curMarketsRunners = [];
    const _currentSet = {
      'event': 'sports_game',
      'Sport_type': match.st,
      'phone': '+' + userProfileInfo.data.appMobileNo,
    };
    this.dataLayerService.pingHome(_currentSet);
    const eventName = ((match.en.trim())).replace(/\s/g, '');
    if (betId && betId !== undefined) {
      this.router.navigate(['event', match.eid,betId, eventName]);
    } else if(match.gt === GameType.Virtual){
      this.router.navigate(['event', 'virtual-sports', match.tid]);
    } else {
      this.router.navigate(['event', match.eid, eventName]);
    }
  }
  onPinClick(match: any) {
    let multiSelectedMatch: any;
    multiSelectedMatch = JSON.parse(localStorage.getItem('multiselected_matchIds'));

    if (multiSelectedMatch === null) {
      multiSelectedMatch = [];
      multiSelectedMatch.push(match.eid);
      document.getElementById('multipin' + match.mid).classList.add('active');
    } else {
      let obj: any;
      obj = multiSelectedMatch.find(x => x == match.eid);
      if (obj) {
        multiSelectedMatch = multiSelectedMatch.filter(x => x !== obj);
        document.getElementById('multipin' + match.mid).classList.remove('active');
      } else {
        multiSelectedMatch.push(match.eid);
        document.getElementById('multipin' + match.mid).classList.add('active');
      }
    }
    this.commonService.setEventCounts('Favourite', multiSelectedMatch.length);
    localStorage.setItem('multiselected_matchIds', JSON.stringify(multiSelectedMatch));
  }

  removeAllGroup() {
    if (!this.deviceInfoService.isMobile() && this.uniqueMarkets && this.uniqueMarkets.length > 0) {
      const centralizationIds = this.uniqueMarkets.map(match => match.mc).filter(function (el) {
        return el != null && el != undefined && el != '';
      }).toString();
      this.sessionService.removeCentralDashboardGroup(centralizationIds);
    }
  }


  getHRMarket(matchId) {
    return this.allMarkets.filter(x => x.eid === matchId);
  }
  fnEventWise(index, item) {
    return item.mid;
  }
  getBetNameArray(betName) {
    const arr = betName.split(': ');
    if (arr && arr.length >= 2) {

      let time = arr[1];
      let hours = Number(time.match(/^(\d+)/)[1]);
      let minutes = Number(time.match(/:(\d+)/)[1]);
      let AMPM = time.match(/\s(.*)$/)[1];
      let AMPMTrim = AMPM.trim().toLowerCase();
      if (AMPMTrim == "pm" && hours < 12) hours = hours + 12;
      if (AMPMTrim == "am" && hours == 12) hours = hours - 12;
      let sHours = hours.toString();
      let sMinutes = minutes.toString();
      if (hours < 10) sHours = "0" + sHours;
      if (minutes < 10) sMinutes = "0" + sMinutes;
      const timeFormate = sHours + ":" + sMinutes;
      return timeFormate;
    }
    return '';
  }
  getCategoryType() {
    let uniqueMarkets = arrayUniqueByKey(this.allMarkets.filter((v) => !this.excludeSport.includes(v.st)), 'eid');
    if (this.router.url.indexOf('/sports/Upcoming') == 0) {
      uniqueMarkets = uniqueMarkets.filter(x => !x.mi);
    }
    const totalMatches = uniqueMarkets.length;
    let groupedSportType = mapSportCount(uniqueMarkets, this.allMarkets.filter((v) => !this.excludeSport.includes(v.st)));
    // var result1 = sortBySport(groupedSportType.filter((v) => !this.excludeSport.includes(v.sport)));
    // var result2 = groupedSportType.filter((v) => this.excludeSport.includes(v.sport)).sort((a, b) => {
    //   return this.excludeSport.indexOf(a.sport) - this.excludeSport.indexOf(b.sport);
    // });
    this.groupedSportType = sortBySport(groupedSportType);
    if (this.router.url.indexOf('/home') !== 0 && this.router.url.indexOf('/sports/Upcoming') !== 0) {
      this.groupedSportType.unshift({ sport: 'Inplay', count: totalMatches, inPlayCount: arrayUniqueByKey(getInplayMarkets(this.allMarkets), 'eid').length });
    }
    setTimeout(() => {
      this.sportScrollEvent();
    }, 500);
  }
  joinCentralGroup() {
    let isShowDashboardRate: boolean;
    const user = JSON.parse(localStorage.getItem('token'));
    if (user == null || user == undefined || user == '') {
      isShowDashboardRate = apiEndPointData.data.isdr;
    } else {
      isShowDashboardRate = websiteSettings.data.isShowDashboardRate;
    }
    this.isCheckDevice =  window.matchMedia("only screen and (max-width: 576px)").matches;

    if (isShowDashboardRate && (!this.deviceInfoService.isMobile() || !this.isCheckDevice)) {
      let uniqueSports: any = [];
      if (this.selectedSport === 'All Sports') {
        uniqueSports = this.uniqueMarkets;
      } else {
        uniqueSports = this.uniqueMarkets.filter(x => x.st === this.selectedSport)
      }
      // const uniqueMarkets = this.upcomingMarkets.filter(v => !this.excludeSport.includes(v.st));
      const centralizationIds = uniqueSports.map(match => match.mc).toString();
      this.sessionService.joinCentralDashboardGroup(centralizationIds);
    }
  }
  getRunningMarketDetail() {
    let isShowDashboardRate: boolean;
    const user = JSON.parse(localStorage.getItem('token'));
    if (user == null || user == undefined || user == '') {
      isShowDashboardRate = apiEndPointData.data.isdr;
    } else {
      isShowDashboardRate = websiteSettings.data.isShowDashboardRate;
    }
    this.isCheckDevice =  window.matchMedia("only screen and (max-width: 576px)").matches;

    if (isShowDashboardRate && (!this.deviceInfoService.isMobile() || !this.isCheckDevice)) {
      this.marketRateFacadeService.getRunningDashboardMarketDetail$().pipe(takeUntil(this.notifier), untilDestroyed(this)).subscribe((runningMarket) => {
        if (runningMarket != null) {
          this.cpuWorker.postMessage(runningMarket);
        }
      });
    }
  }
  getConfig() {
    this.authService.getConfig$()
      .pipe(takeUntil(this.notifier), take(1),
        untilDestroyed(this),
        catchError(err => throwError(err))
      ).subscribe(response => {
        if (response) {
          if (websiteSettings.data.isShowDashboardRate && !this.deviceInfoService.isMobile()) {
            this.joinCentralGroup()
            this.getRunningMarketDetail();
          }
          this.getCategoryType();
        }
      }, err => console.log('getConfig', err));
  }
  isEmpty(obj: any) {
    for (var key in obj) {
      if (obj.hasOwnProperty(key))
        return false;
    }
    return true;
  }
  onLiabilityClick() {
    if (this.account && this.account.liability !== 0) {
        this.liabilityRef.openPopup();
    }
}
  onScrollInplayEvents() {
    this.showAllInplayEvents += 4;
  }
  onScrollUpInplayEvents() {
    this.showAllInplayEvents -= 4;
  }
  onScrollUpcomingEvents() {
    this.showAllUpcomingEvents += 8;
  }
  onScrollUpUpcomingEvents() {
    this.showAllUpcomingEvents -= 8;
  }
  ngOnDestroy() {
    this.cpuWorker.terminate();
    this.virtualSportsWorker.terminate();
    this.routeSubscription.unsubscribe();
    this.notifier.next();
    this.notifier.complete();
  }
}
