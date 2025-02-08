import { Component, OnInit, Input, OnDestroy, ViewChild, ElementRef, AfterViewInit, HostListener, OnChanges } from '@angular/core';
import { MarketRateFacadeService } from '@clientApp-core/services/market/market-rates/market-rate-facade.service';
import { Subscription, throwError, BehaviorSubject, Observable, Subject, of } from 'rxjs';
import { MarketRates } from '@clientApp-core/models/market/market-rates.model';
import { untilDestroyed } from 'ngx-take-until-destroy';
import { Store, select } from '@ngrx/store';
import { ParkBetState } from '@clientApp-store/store.state';
import { getAllMarkets } from '@clientApp-store/selected-market/selectors/selected-market.selectors';
import { catchError, switchMap, take, takeUntil } from 'rxjs/operators';
import { Match } from '@clientApp-core/models/market/match.model';
import { MarketRunner } from '@clientApp-core/models/market/market-runner.model';
import { SessionService } from '@clientApp-core/services/session/session.service';
import * as SelectedMarket from '@clientApp-store/selected-market/actions/selected-market.actions';
import { DeviceInfoService } from '@clientApp-core/services/device-info/deviceinfo.services';
import * as M from "materialize-css/dist/js/materialize";
import { MarketFacadeService } from '@clientApp-core/services/market/market-facade.service';
import { CommonService } from '@clientApp-core/services/common/common.service';
import { AuthFacadeService, websiteSettings } from '@clientApp-core/services/authentication/authentication-facade.service';
import { fancyRankOrder, GetSortOrder } from '@clientApp-core/utilities/app-configuration';
import { apiEndPointData } from '@clientApp-core/services/config/connfig.service';
import { leftSidebarMapMarket, mapMatch } from '@clientApp-core/services/shared/dashboard-shared.service';
import { ChipFacadeService } from '@clientApp-core/services/chip/chip-facade.service';
import { arrayUniqueByKey , sortBySport, unionByBetDetailID, unionByBetId, unionByMatchId } from '@clientApp-core/services/shared/JSfunction.service';
import { ActiveMarket } from '@clientApp-core/models/market/activemarket.model';

import { ActivatedRoute, Router } from '@angular/router';
import { FanceType } from '@clientApp-core/enums/market-fancy.type';
declare var $: any;
declare var _: any;

@Component({
  selector: 'app-virtual-sports',
  templateUrl: './virtual-sports.component.html',
  styleUrls: ['./virtual-sports.component.scss']
})
export class VirtualSportsComponent implements OnInit,AfterViewInit,OnDestroy {
  @Input() market: ActiveMarket;
  @Input() matchIndex: number;
  @Input() tournamentId: any;
  groupedMarkets: any = [];
  config: any;
  commentary = 'Hey There';
  livebetfairScore: any;
  isAllowLiveScoreCall = true;
  betFairScore: boolean;
  sportScore: any;
  matches: any[] = [];
  allMarket: ActiveMarket[] = [];
  currentMarketVolumn: MarketRates[] = [];
  matchInfo: Match;
  marketRunner: MarketRunner[] = [];
  private subscription: Subscription;
  private _marketSubject = new BehaviorSubject<ActiveMarket>(null);
  marketCount: number;
  bookMakerCount: number;
  manualOddsCount: number;
  LineMarketCount: number;
  adSessionCount: number;
  meterpariCount: number;
  khadoCount: number;
  sportBookCount: number;
  showTv = false;
  channelno: any;
  host = websiteSettings.data.appVideoLink;
  StreamNamePreFix = websiteSettings.data.appStreamPreFix;
  allMarkets: ActiveMarket[];
  allMatches: ActiveMarket[];
  marketTypeCategory: any = [];
  marketTypeIds: any = [];
  isSocketRateEnabled: boolean;
  selectedMarkets = [];
  currentMenuIndex = 0;
  showTV = false;
  ipAddress: string = '';
  iframeUrl: any;
  team1: string = '';
  team2: string = '';
  isShowScore: boolean = true;
  isDarkTheme: boolean = false;
  notifier = new Subject();
  marketCategory: any = [];
  selectedIndex: number = -1;
  tournamentName: string = '';
  selectedCategory: string = 'All';
  matchInfo$ = new BehaviorSubject<Match>(null);
  videoUrl = 'assets/flashphoner/player.html';
  eventId: any;
  startIndex = 0;
  itemsPerPage = 10; 
  constructor(private store: Store<ParkBetState>,
    private marketFacadeService: MarketFacadeService,
    public marketRateService: MarketRateFacadeService,
    private sessionService: SessionService,
    public deviceInfoService: DeviceInfoService,
    public commonService: CommonService,
    private chipService: ChipFacadeService,private route: ActivatedRoute,private router: Router,
    private authService: AuthFacadeService) {
    this.getConfig();
    this.betFairScore = websiteSettings.data.isStartBetfairLiveScore;
    this.commonService.getDarkThemeStatus().subscribe(isChecked => {
      this.isDarkTheme = isChecked;
    });
    this.subscription = this.route.params.subscribe((params) => {
      if (params && !this.isEmpty(params)) {
        this.eventId = +params.id;
      }
    });
    this.commonService.getRealBalanceUseStatus().pipe(takeUntil(this.notifier),untilDestroyed(this)).subscribe(isChecked => {
      // if (!websiteSettings.data.appIsRealBalanceUse) {
      //   this.marketRateService.getWagerBetInfo();
      // } else {
        this.marketRateService.getBetInfo();
      // }
    });
  }
  ngOnInit(): void {
    this.commonService.isShowLiveTvCenter = true;
    const darkThemeCurrentState = this.commonService.getCookieValue('isCheckedDarkTheme');
    this.isDarkTheme = (darkThemeCurrentState != null && darkThemeCurrentState != undefined && darkThemeCurrentState != '') ? JSON.parse(darkThemeCurrentState).isCheckedDarkTheme : (apiEndPointData.data.isDarkTheme ? apiEndPointData.data.isDarkTheme : false);;
    this.getSelectedMatch();
    this.getMatchWiseMarketData();
    try {
      const str = this.market && this.market.en ? this.market.en : 
                  this.matchInfo && this.matchInfo.en ? this.matchInfo.en : '';
      let vrunnerName;
      if (str.includes(" V ")) {
        vrunnerName = this.market && this.market.en ? this.market.en.split(' V ') : null;
      } else if (str.includes(" vs ")) {
        vrunnerName = this.market && this.market.en ? this.market.en.split(' vs ') : [];
      } else {
        vrunnerName = this.market && this.market.en ? this.market.en.split(' v ') : null;
      }
      if ((vrunnerName !== null || vrunnerName !== undefined) && vrunnerName.length > 0) {
        this.team1 = vrunnerName[0];
        this.team2 = vrunnerName[1];
      } else {
        this.team1 = this.market && this.market.en ? this.market.en :
                     this.matchInfo && this.matchInfo.en ? this.matchInfo.en : '';
      }
      } catch (ex) {
        console.log(ex)
    }
    this.getTournamentName();
    localStorage.setItem('is_refreshed', JSON.stringify({ isRefreshed: false }));
    this.currentMarketVolumn = Object.assign([],this.marketRateService.curMarketsVol);
    this.marketRunner = Object.assign([],this.marketRateService.curMarketsRunners);
    this.isSocketRateEnabled = websiteSettings.data.isSocketRateEnabled;
    this.subscribeStore();
    this.host = websiteSettings.data.appVideoLink;
    this.StreamNamePreFix = websiteSettings.data.appStreamPreFix;
    // this.marketRateService.getMarketWiseNews(this.market.eid.toString());
    this.marketFacadeService.getVideo$().subscribe(matchid => {
      this.matchInfo = Object.assign([], this.marketRateService.curMatchInfo.find(x => x.eid == matchid));
       this.videoUrl = 'assets/flashphoner/player.html';
        if (this.matchInfo && this.matchInfo.ei && this.matchInfo.ep === true && this.matchInfo.ev !== '') {
          this.showTV = !this.showTV;  
          this.videoUrl = this.matchInfo.ev;
            var field = 'twitch.tv';
            var url = this.matchInfo.ev;
            if (url.indexOf(field) > -1) {
              if (url.indexOf('parent=#domain#') > -1) {
                const splitArr = url.split('parent=#domain#');
                const origin = window.location.origin.replace(/^https?\:\/\//i, "");
                this.videoUrl = splitArr[0] + 'parent=' + origin;
              }
            }          
        } else if (this.matchInfo && this.matchInfo.ei && this.matchInfo.ec != null) {
        this.showTV = !this.showTV;
        this.channelno = this.matchInfo.ec;
        const channelnoList = apiEndPointData.data.channelnoList ? apiEndPointData.data.channelnoList : [];
        const isNumberExitst = channelnoList.includes(+this.channelno);
          if (isNumberExitst == null || isNumberExitst == undefined || !isNumberExitst) {
            if (this.commonService.ipAddress && this.commonService.ipAddress.length > 0) {
              this.videoUrl = websiteSettings.data.externalVideoUrl + this.matchInfo.ec + "&ip=" + this.commonService.ipAddress;
            } else {
              this.getIp();
            }
          } else {
            this.videoUrl = 'assets/flashphoner/player.html';
          }
      } else {
        this.showTV = false;
      }
      if (this.deviceInfoService.isMobile()) {
        this.iframeUrl = '<iframe class="w-100" style="width:100%;height:auto;border:none;min-height:220px" src="' + this.videoUrl
      + '" frameborder="0" allow="autoplay; encrypted-media"  scrolling="no" width="100%" height="auto" marginwidth="0" marginheight="0" allowfullscreen="true" webkitallowfullscreen="true" mozallowfullscreen="true"></iframe>';
      } else {
        this.iframeUrl = '<iframe class="w-100" src="' + this.videoUrl
      + '" frameborder="0" allow="autoplay; encrypted-media"  scrolling="no" width="100%" height="400" marginwidth="0" marginheight="0" allowfullscreen="true" webkitallowfullscreen="true" mozallowfullscreen="true"></iframe>';
      }
     
    });
   
  }
  getMatchInfo$(): Observable<Match> {
    return this.matchInfo$.asObservable();
  }
  getIp(){
    const self = this, url = websiteSettings.data.ipAddApi ? websiteSettings.data.ipAddApi : apiEndPointData.data.ipAddApi;
    var ip =  $.getJSON(url, function (data: any) {
      self.commonService.ipAddress = data.ip;
      self.videoUrl = websiteSettings.data.externalVideoUrl + self.matchInfo.ec + "&ip=" + data.ip;
      if (self.deviceInfoService.isMobile()) {
        self.iframeUrl = '<iframe class="w-100" style="width:100%;height:auto;border:none;min-height:220px" src="' + self.videoUrl
      + '" frameborder="0" allow="autoplay; encrypted-media"  scrolling="no" width="100%" height="auto" marginwidth="0" marginheight="0" allowfullscreen="true" webkitallowfullscreen="true" mozallowfullscreen="true"></iframe>';
      } else {
        self.iframeUrl = '<iframe class="w-100" src="' + self.videoUrl
      + '" frameborder="0" allow="autoplay; encrypted-media"  scrolling="no" width="100%" height="400" marginwidth="0" marginheight="0" allowfullscreen="true" webkitallowfullscreen="true" mozallowfullscreen="true"></iframe>';
      }
    }).fail(function(ex){
      console.log('match comp getIp',ex.responseText);
   });
  }
  getCurrentMarket(): Observable<ActiveMarket> {
    return this._marketSubject.asObservable();
  }
  getTournamentName() {
    this.allMarkets = this.marketFacadeService.marketList;
    if (this.allMarkets && this.allMarkets.length > 0) {
      const obj = this.allMarkets.find(x => x.eid === this.market.eid);
      this.tournamentName = obj && obj.tn ? obj.tn : '';
    } else {
      this.tournamentName = this.market && this.market.tn ? this.market.tn : '';
    }
  }
  ngAfterViewInit() {
    var elems = document.querySelectorAll('.collapsible');
    var instances = M.Collapsible.init(elems, {});
    var tooltippedElems = document.querySelectorAll('.tooltipped');
    var instances = M.Tooltip.init(tooltippedElems, {});
    this.marketCategoryEvents();
    this.initMArketCategoryTabs();
    // this.getAllChips();
  }
  marketCategoryEvents() {
    var scrollTop = 0, self = this, isMultiMarket = false;
    $(window).scroll(function(){
      scrollTop = $(window).scrollTop();
      const selectedMatches = localStorage.getItem('selected_matches');
      if (selectedMatches != null && selectedMatches != undefined && JSON.parse(selectedMatches).length > 1) {
        isMultiMarket = true;
      } else {
        isMultiMarket = false;
      }
      const offsetHeight = document.getElementById('categories') ? document.getElementById('categories').offsetTop : null;
      const widgetScoreoffSetTop = document.getElementById('widgetIframe1'+ self.matchIndex) ? document.getElementById('widgetIframe1'+ self.matchIndex).offsetTop : null;
      const livetvoffSetTop = document.getElementById('live-tv') ? document.getElementById('live-tv').offsetTop : null;
      let scrollOffSetTop = livetvoffSetTop ? livetvoffSetTop : widgetScoreoffSetTop;
      if(self.matches && self.matches.length >0) {
       if ($(window).width() < 767) { 
         if (scrollTop >= offsetHeight && !isMultiMarket) {
           if (!self.commonService.isNewsExits) {
            $('#categories').addClass('pos-fix');
            $('#categories').addClass('pos-fix-nonews');
            $('#category-tab').addClass('tab-category');
           } 
        }
         else if ((scrollTop < offsetHeight || scrollTop < scrollOffSetTop) && !isMultiMarket) {
          if (!self.commonService.isNewsExits) {
            $('#categories').removeClass('pos-fix');
            $('#categories').removeClass('pos-fix-nonews');
            $('#category-tab').removeClass('tab-category');
           } 
         }
       } else {
        if (scrollTop >= offsetHeight && !isMultiMarket) {
          $('#categories').addClass('pos-fix');
          $('#category-tab').addClass('tab-category');
         }
         else if (scrollTop < offsetHeight || scrollTop < scrollOffSetTop && !isMultiMarket) {
          $('#categories').removeClass('pos-fix');
          $('#category-tab').removeClass('tab-category');
         } 
       }
      }
      });
    const scroll: any = document.querySelector(".select-category");
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
  initMArketCategoryTabs() {
    let tabinstances: any;
    if (tabinstances) {
      tabinstances.destroy();
    }
    var elemsTabs = document.querySelectorAll('.tabs');
    tabinstances = M.Tabs.init(elemsTabs, {});
  }

  private subscribeStore() {
    this.marketRateService.getAdhocMatchInfo$().pipe(takeUntil(this.notifier),untilDestroyed(this)).subscribe(match => {
      if(match && match.tid == this.tournamentId){
        this.sessionService.joinCentralGroup(match.mc);
        this.store.dispatch(SelectedMarket.UpsertSelectedMarket({ market: match }));
        this.sessionService.addMarketGroup('', 3, match.eid, match.mid, match.mc, 0, 0, 0);
      }
     
      // const matches = this.allMarket.filter(o2 => match.mid === o2.mid);
      // if (matches && matches.length === 0 && this.allMarket.find(x => x.eid === match.eid)) {
      //   if (websiteSettings.data.isSocketRateEnabled) {
      //     this.nodeCentralService.addnewMarket(match.mc);
      //   } else {
      //     this.sessionService.joinCentralGroup(match.mc);
      //   }
      //   this.store.dispatch(SelectedMarket.UpsertSelectedMarket({ market: match }));
      //   this.sessionService.addMarketGroup('', 3, match.eid, match.mid, match.mc, 0, 0, 0);
      //   this.getSelectedMatch();
      // } else if(this.router.url == "/market/virtual-sports" && matches && matches.length === 0 && this.allMarket.find(x => x.tid === match.tid)){
      //   if (websiteSettings.data.isSocketRateEnabled) {
      //     this.nodeCentralService.addnewMarket(match.mc);
      //   } else {
      //     this.sessionService.joinCentralGroup(match.mc);
      //   }
      //   this.store.dispatch(SelectedMarket.UpsertSelectedMarket({ market: match }));
      //   this.sessionService.addMarketGroup('', 3, match.eid, match.mid, match.mc, 0, 0, 0);
      //   this.getSelectedMatch();
      // }
    });
    this.marketRateService.getAddNewMarketInfo$().pipe(untilDestroyed(this)).subscribe(data => {
      this.marketRateService.curMarketsVol = Object.assign([], unionByBetId(this.marketRateService.curMarketsVol, data.marketInfo));
      this.marketRateService.curMarketsRunners = Object.assign([], unionByBetDetailID(this.marketRateService.curMarketsRunners,
        data.runnerInfo));

      this.matchInfo = Object.assign([], this.marketRateService.curMatchInfo.find(x => x.eid == this.market.eid));
      this.currentMarketVolumn = Object.assign([],this.marketRateService.curMarketsVol);
      this.marketRunner = Object.assign([],this.marketRateService.curMarketsRunners);
      this.matchInfo$.next(this.matchInfo);
      // this._marketSubject.next(this.market);
    });
    // for match wise client Limit  get :
    this.marketRateService.getewclChanges$().pipe(takeUntil(this.notifier),untilDestroyed(this)).subscribe(res => {
      if (res && res.length > 0) {
        for (let k = 0; k < res.length; k++) {
          const index = this.currentMarketVolumn.findIndex(x => x.mid == res[k].mid);
          if (index !== undefined && index !== null && index >= 0) {
            const data = res[k];
            this.currentMarketVolumn[index].mmr = data.mmr;
            this.currentMarketVolumn[index].mxr = data.mxr;
            this.currentMarketVolumn[index].mms = data.mms;
            this.currentMarketVolumn[index].mxs = data.mxs;
            this.currentMarketVolumn[index].mmp = data.mmp;
            this.currentMarketVolumn[index].miu = data.miu;
            this.currentMarketVolumn[index].mur = data.mur;
            this.currentMarketVolumn[index].mbr = data.mbr;
            this.currentMarketVolumn[index].mlr = data.mlr;
            this.currentMarketVolumn[index].mip = data.mip;
            this.currentMarketVolumn[index].mll = data.mll;
          }
        }

      }

    });
    // for Market wise client Limit  get :
    this.marketRateService.getmwclChanges$().pipe(takeUntil(this.notifier),untilDestroyed(this)).subscribe(res => {
      const index = this.currentMarketVolumn.findIndex(x => x.mid == res.mid);
      if (index !== undefined && index !== null && index >= 0) {
        const data = res;
        this.currentMarketVolumn[index].mmr = data.mmr;
        this.currentMarketVolumn[index].mxr = data.mxr;
        this.currentMarketVolumn[index].mms = data.mms;
        this.currentMarketVolumn[index].mxs = data.mxs;
        this.currentMarketVolumn[index].mmp = data.mmp;
        this.currentMarketVolumn[index].miu = data.miu;
        this.currentMarketVolumn[index].mur = data.mur;
        this.currentMarketVolumn[index].mbr = data.mbr;
        this.currentMarketVolumn[index].mlr = data.mlr;
        this.currentMarketVolumn[index].mip = data.mip;
        this.currentMarketVolumn[index].mll = data.mll;
      }
    });
    // This trigger has used to change client limit changes
    this.marketRateService.getClientLimitChanges$().pipe(takeUntil(this.notifier),untilDestroyed(this)).subscribe(res => {
    });
    // This trigger has used to change market limit changes
    this.marketRateService.getMarketLimitChanges$().pipe(takeUntil(this.notifier),untilDestroyed(this)).subscribe(res => {
    });
    // This trigger has used to change market bet allowed flag
    this.marketRateService.getMarketBetAllowChanges$().pipe(takeUntil(this.notifier),untilDestroyed(this)).subscribe((data: any) => {
      const index = this.currentMarketVolumn.findIndex(x => x.mid == data.appBetID);
      if (index !== undefined && index !== null && index >= 0) {
        this.currentMarketVolumn[index].mip = data.appIsBetAllow;
      }
    });
    // This trigger has used to change market volume amount
    this.marketRateService.getMarketRateVolumeChanges$().pipe(takeUntil(this.notifier),untilDestroyed(this)).subscribe((data: any) => {
      const index = this.currentMarketVolumn.findIndex(x => x.mid == data.appBetID);
      if (index !== undefined && index !== null && index >= 0) {
        this.currentMarketVolumn[index].mr = data.appMarketRate;
      }
    });
    //  This trigger has used to change market In-Play flag
    this.marketRateService.getInPlayChanges$().pipe(takeUntil(this.notifier),untilDestroyed(this)).subscribe((data: any) => {
      const index = this.currentMarketVolumn.findIndex(x => x.mid == data.appBetID);
      if (index !== undefined && index !== null && index >= 0) {
        this.currentMarketVolumn[index].mi = data.appIsInplay;
      }
    });
    //  This trigger has used to change market market status
    this.marketRateService.getMarketStatusChanges$().pipe(takeUntil(this.notifier),untilDestroyed(this)).subscribe((data: any) => {
      const index =this.currentMarketVolumn.findIndex(x => x.mid == data.appBetID);
      if (index !== undefined && index !== null && index >= 0) {
        this.currentMarketVolumn[index].ms = data.appBetStatus;
      }
    });
    // This trigger has used to chnage following things
    // 1.is show video flag
    // 2.is Commentary on
    // 3.is channel no.
    // 4.id of Commentary
    this.marketRateService.getMultiMatchWiseInfo$().pipe(takeUntil(this.notifier),untilDestroyed(this)).subscribe((data: any) => {
      if (data !== null && data !== undefined &&
        this.matchInfo !== null && this.matchInfo !== undefined) {
        if (data.appIsShowLive !== null && data.appIsShowLive !== undefined) {
          if (this.matchInfo.eid !== undefined && this.matchInfo.eid !== null
            && data.appMatchID !== null && data.appMatchID !== undefined) {
            if (this.matchInfo.eid === data.appMatchID) {
              this.matchInfo.ei = data.appIsShowLive;
              this.matchInfo.ep = data.appIsPlayVideoUrl;
              this.matchInfo.ev = data.appVideoUrl;
              this.matchInfo$.next(this.matchInfo);
            }
          }

        }
        if (data.appChannelNo !== null && data.appMatchID !== null
          && data.appMatchID !== undefined) {
          if (this.matchInfo.eid !== undefined && this.matchInfo.eid !== null
            && this.matchInfo.eid === data.appMatchID) {
            this.matchInfo.ec = data.appChannelNo;
            this.matchInfo$.next(this.matchInfo);
          }
        }
        if (data.appIsAutoCommentry != null && data.appCommentryID != null) {
          if (!data.appIsAutoCommentry) {
          }
        }
      }
    });
    this.marketRateService.getMultiMarketDetail$().subscribe((data: any) => {
      this.matchInfo = Object.assign([], this.marketRateService.curMatchInfo.find(x => x.eid == this.market.eid));
      this.currentMarketVolumn = Object.assign([],this.marketRateService.curMarketsVol);
      this.marketRunner = Object.assign([],this.marketRateService.curMarketsRunners);
      this.matchInfo$.next(this.matchInfo);
      // this.matchInfo = Object.assign([], this.marketRateService.curMatchInfo.find(x => x.eid == this.market.eid));
      // this.matchInfo$.next(this.matchInfo);
      // this.currentMarketVolumn = Object.assign([], this.marketRateService.curMarketsVol);
      // this.marketRunner = Object.assign([], this.marketRateService.curMarketsRunners);
      const matches = this.currentMarketVolumn.filter(x=> +x.eid == this.market.eid);
      const centralizationIds = matches.map(match => match.mc).toString();
        this.sessionService.joinMultiCentralGroup(centralizationIds);
      this._marketSubject.next(this.market);
    });
  }
  getMatchWiseMarketData() {
    // this.marketRateService.MatchWiseMarketRequest(this.market.eid).pipe(takeUntil(this.notifier),untilDestroyed(this), catchError(err => throwError(err))).subscribe(data => {
    //   if (data.matchInfo && data.marketInfo && data.runnerInfo) {
    //     this.marketRateService.curMatchInfo = Object.assign([], unionByMatchId(this.marketRateService.curMatchInfo, data.matchInfo));
    //     this.marketRateService.curMarketsVol = Object.assign([], unionByBetId(this.marketRateService.curMarketsVol, data.marketInfo));
    //     this.marketRateService.curMarketsRunners = Object.assign([], unionByBetDetailID(this.marketRateService.curMarketsRunners,
    //       data.runnerInfo));

        this.matchInfo = Object.assign([], this.marketRateService.curMatchInfo.find(x => x.eid == this.market.eid));
        this.matchInfo$.next(this.matchInfo);
        this.currentMarketVolumn = Object.assign([], this.marketRateService.curMarketsVol);
        this.marketRunner = Object.assign([], this.marketRateService.curMarketsRunners);
        const matches = this.currentMarketVolumn.filter(x=> +x.eid == this.market.eid);
        const centralizationIds = matches.map(match => match.mc).toString();
          this.sessionService.joinMultiCentralGroup(centralizationIds);
        if (!websiteSettings.data.appIsRealBalanceUse) {
          this.marketRateService.getWagerBetInfo();
        } else {
          this.marketRateService.getBetInfo();
        }
        this.marketFacadeService.setVideo(this.matchInfo.eid);

        this._marketSubject.next(this.market);
      // }
    // }, err => console.log('getMatchWiseMarketData', err));
  }
  private getSelectedMatch() {
    const self = this;
    this.store.pipe(takeUntil(this.notifier),select(getAllMarkets)).subscribe(matches => {
      if (matches && matches.length > 0) {
        this.selectedMarkets = matches;
        this.allMarket = Object.assign([],matches);
        this.selectedMarketData();
      } else {
        this.selectedMarkets = [];
      }
    });
  }
  selectedMarketData() {
    if(this.allMarket && this.allMarket.length > 0){
      const filterData = this.allMarket.filter(match => match.eid === this.market.eid);
      if (this.commonService.configData && this.commonService.configData.marketType) {
        this.marketTypeCategory = this.commonService.configData.marketType;
      }
      if (this.commonService.isMarketLiabilityClick === true) {
        this.allMatches = this.defaultMarketSorting(filterData);
        this.commonService.isMarketLiabilityClick = false;
      } else {
        this.allMatches = this.filteredMatches(filterData); // filter and sort categorywise matches/market
        if (this.allMatches.length == 0) {
          this.allMatches = this.defaultMarketSorting(filterData);
        }
      }
      this.marketTypeIds = [];
      this.allMatches = this.allMatches.map((market: ActiveMarket, index, array: any[]) => {
        return Object.assign({
          marketCount: this.changeFancyCount(index, market.mt),
          isShowFancyTitle: this.checkFancyTitleShow(market, index, array)
        }, market);
      });
      // this.allMatches = this.matches;
      this.matches = this.allMatches
      this.getvirtualGameData(this.startIndex, this.itemsPerPage);
      const isExitsCategoryName = this.allMatches.filter(bet => bet.hasOwnProperty('categoryName'));
      if (isExitsCategoryName.length > 0) {
        const categories =  this.allMatches.map((market: any) => {
          return Object.assign({ cn: market.categoryName, mt: market.mt, mscd: market.mscd });
        });
        this.marketCategory  = arrayUniqueByKey(categories, 'mscd')
        if (this.marketCategory.length <= 1) {
          this.setIndex(-1, 'All');
          this.marketCategory = [];
        } else {
          if (typeof this.marketCategory[this.selectedIndex] !== 'undefined' && this.marketCategory[this.selectedIndex] !== null) {
            this.setIndex(this.selectedIndex, this.marketCategory[this.selectedIndex]['cn']);
          } else {
            this.setIndex(-1, 'All');
          }
          this.initMArketCategoryTabs();
        }
      } else {
        this.setIndex(-1, 'All');
        this.marketCategory = [];
      }
    } else {
      this.matches = []
    }
  }
  onElementVisible(visible: boolean) {
    if (visible) {
      this.startIndex += this.itemsPerPage;
      this.getvirtualGameData(this.startIndex, this.startIndex + this.itemsPerPage);
    }
  }
  getvirtualGameData(startIndex: number, endIndex: number) {
    this.matches = this.allMatches.slice(0, endIndex);
  }
  // filter market type wise and order wise display market/matches
  filteredMatches(filterData) {
    if (this.marketTypeCategory && this.marketTypeCategory.length > 0) {
      const result = [];
      const betIds = [];
      let MarketCategory = [].concat(...this.marketTypeCategory.map(({ MarketCategory }) => MarketCategory || []));
      MarketCategory = MarketCategory.sort(GetSortOrder('appDisplayOrder'));
      if (MarketCategory && MarketCategory.length > 0) {
        MarketCategory.forEach(function (matchKey) { // sub-category loop
          filterData.forEach(function (item: ActiveMarket) { // matches list loop
                if(matchKey.appMarketCategoryId == item.mscd){
                let obj = { categoryName: matchKey.appMarketCategoryName };
                obj = { ...obj, ...item };
                if (!betIds.includes(obj['mid'])) {
                  betIds.push(obj['mid'])
                  result.push(obj);
                  }
                }
          });
        });
      } else {
        const data = this.defaultMarketSorting(filterData);
        return data;
      }

      return result;
    } else {
      const data = this.defaultMarketSorting(filterData);
      return data;
    }
  }
  // default/regular  sorting without category type id wise
  defaultMarketSorting(filterData) {
    return filterData.sort((a, b) => {
      return fancyRankOrder.get(a.mt) - fancyRankOrder.get(b.mt);
    });
  }
  // get config when market page refresh
  async getConfig() {
    this.authService.getConfig$().pipe(takeUntil(this.notifier),untilDestroyed(this), take(1),
      catchError(err => throwError(err))
    ).subscribe(response => {
      if (response) {
        this.commonService.configData = response;
        // get/set config market type category
        if (response && response.marketType) {
          this.marketTypeCategory = response.marketType;
          this.selectedMarketData();
        }
      }
    }, err => console.log('getConfig', err));
  }
  setIndex(index: number, category: string) {
    this.selectedIndex = index;
    this.selectedCategory = category;
  }



  changeFancyCount(index, fancyType) {
    if (index === 0) {
      this.marketCount = 0;
      this.bookMakerCount = 0;
      this.manualOddsCount = 0;
      this.LineMarketCount = 0;
      this.adSessionCount = 0;
      this.meterpariCount = 0;
      this.khadoCount = 0;
      this.sportBookCount = 0;
    }
    switch (fancyType) {
      case 0: {
        this.marketCount = this.marketCount + 1;
        return this.marketCount;
      }

      case 7: {
        this.bookMakerCount = this.bookMakerCount + 1;
        return this.bookMakerCount;
      }

      case 10: {
        this.manualOddsCount = this.manualOddsCount + 1;
        return this.manualOddsCount;
      }

      case 9: {
        this.LineMarketCount = this.LineMarketCount + 1;
        return this.LineMarketCount;
      }

      case 6: {
        this.adSessionCount = this.adSessionCount + 1;
        return this.adSessionCount;
      }

      case 11: {
        this.meterpariCount = this.meterpariCount + 1;
        return this.meterpariCount;
      }

      case 12: {
        this.khadoCount = this.khadoCount + 1;
        return this.khadoCount;
      }
      case 14: {
        this.sportBookCount = this.sportBookCount + 1;
        return this.sportBookCount;
      }
      default: {
        console.log('Invalid fancy');
        break;
      }
    }

  }
  checkFancyTitleShow(currentValue, index, array) {
    if (index > 0) {
      let previousValue = array[index - 1];
      if (currentValue.appFancyType === previousValue.appFancyType) {
        if (currentValue.categoryName == previousValue.categoryName) {
          return false;
        } else {
          return true;
        }
      } else {
        return true;
      }
    } else {
      return true;
    }
  }
  identify(index, item) {
    return item.mid;
  }
  trackByFun(index, item) {
    return index;
  }
  isEmpty(obj) {
    for (var key in obj) {
      if (obj.hasOwnProperty(key))
        return false;
    }
    return true;
  }
  public trackItem(index: number, item) {
    return item.trackId;
  }



  getAllChips() {
    this.chipService.getChips$().pipe(take(1)).subscribe(chipResponse => {
      this.commonService.chipList = chipResponse;
    });
  }
  ngOnDestroy() {
    this.matchInfo$.next(null);
    this.commonService.isShowLiveTvCenter = false;
    this.notifier.next();
    this.notifier.complete(); 
    this.subscription.unsubscribe(); 
    // this.marketRateService.curMatchInfo = [];
    // this.marketRateService.curMarketsVol = [];
    // this.marketRateService.curMarketsRate = [];
    // this.marketRateService.curMarketsRunners = [];


  }
}
