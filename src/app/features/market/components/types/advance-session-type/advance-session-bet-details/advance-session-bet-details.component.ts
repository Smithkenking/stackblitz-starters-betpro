import { Component, OnInit, Input, OnDestroy, HostListener } from '@angular/core';
import { SessionDetail } from '@clientApp-core/services/market/types/session-detail';
import { Stake } from '@clientApp-core/models/bet/stake.model';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { MarketRunner } from '@clientApp-core/models/market/market-runner.model';
import { MarketRates } from '@clientApp-core/models/market/market-rates.model';
import { MarketType } from '@clientApp-core/services/market/types/market';
import { MarketRateFacadeService } from '@clientApp-core/services/market/market-rates/market-rate-facade.service';
import { BetFacadeService } from '@clientApp-core/services/bet/bet.facade.service';
import { CommonService } from '@clientApp-core/services/common/common.service';
import { FanceType } from '@clientApp-core/enums/market-fancy.type';
import { untilDestroyed } from 'ngx-take-until-destroy';
import { MarketBet } from '@clientApp-core/models/market/market-bet.model';
import { AudioType } from '@clientApp-core/enums/audio.types';
import { ToastrService } from 'ngx-toastr';
import { websiteSettings } from '@clientApp-core/services/authentication/authentication-facade.service';
import { takeUntil } from 'rxjs/operators';
import { getRunnerById } from '@clientApp-core/services/shared/shared.service';
import { apiEndPointData } from '@clientApp-core/services/config/connfig.service';

@Component({
  selector: '[app-advance-session-bet-details]',
  templateUrl: './advance-session-bet-details.component.html',
  styleUrls: ['./advance-session-bet-details.component.scss']
})
export class AdvanceSessionBetDetailsComponent implements OnInit, OnDestroy {
  @Input() matchId: number;
  @Input() marketRunner: MarketRunner[];
  @Input() currentMarketVolumns: MarketRates[];
  @Input() betId: number;
  @Input() marketType: string;
  @Input() market: MarketType;

  showPosition = false;
  sessionDetail: SessionDetail;
  session$ = new BehaviorSubject<SessionDetail>(null);
  preventDefaultEvent = false;
  placeBetInfo: any;
  vBet: Stake;
  vIsBack: boolean;
  vSelectedRunner = '';
  currSeleItem: string;
  currSelectedItem: string;
  priority = 1;
  maxLiability: any;
  currentMarketVolumn: Partial<MarketRates>;
  marketClientBets: MarketBet[] = [];
  position = { x: -100, y: -100 };
  notifier = new Subject();
  isShowPlaceBetCounter: boolean = false;
  marketNews: any = [];
  news: any = '';
  showLimitPopup: boolean = false;
  isShowBetSlipBelowRunner: boolean;
  loaderPath: any;
  togglePanelView: boolean;
  vBetId: number;
  displayOverlay: boolean;
  constructor(private marketRateFacadeService: MarketRateFacadeService
    , private betService: BetFacadeService, public commonService: CommonService
    , private toastr: ToastrService
  ) { }
   @HostListener('document:click', ['$event']) onDocumentClick(event) {
    this.showLimitPopup=false;
  }
  ngOnInit(): void {
    this.setmatkettemplate();
    this.subscribeStore();
    this.isShowBetSlipBelowRunner = websiteSettings.data.isShowBetSlipBelowRunner;
    this.isShowPlaceBetCounter = websiteSettings.data.isShowPlaceBetCounter;
    this.loaderPath = apiEndPointData.data.loaderPath;
    if (this.isShowBetSlipBelowRunner) {
      this.betSlipConfiguation();
    }

  }
  setmatkettemplate() {
    const curMarketRunners = getRunnerById(this.marketRunner, this.betId, this.matchId);
    const filteredBetDetails = curMarketRunners.filter(betDetail => betDetail.mid === this.betId);
    if (filteredBetDetails != null
      && filteredBetDetails.length > 0) {
      const sessionDetails = filteredBetDetails.map(betDetail => {
        // tslint:disable-next-line:max-line-length
        return this.setRateBoxTemp(betDetail);
      }).filter(betDetail => betDetail !== undefined);
      if (sessionDetails !== undefined && sessionDetails.length > 0) {
        this.sessionDetail = sessionDetails[0];
        this.session$.next(sessionDetails[0]);
      }
    }
  }
  setRateBoxTemp(betDetail: MarketRunner) {
    const sessionDetail = new SessionDetail();
    const volumnData = this.currentMarketVolumns.find(c => c.mid == this.betId);
    sessionDetail.betDetailId = betDetail.rid;
    sessionDetail.betTitle = volumnData.mn;   
    if (volumnData) {
      sessionDetail.isBetAllowed = volumnData.mip && volumnData.mip.toString().toLowerCase() === 'true';
      sessionDetail.minStake = volumnData.mms && volumnData.mms !== -1 ? volumnData.mms.toString() : 'No Limit';
      sessionDetail.maxStake = volumnData.mxs && volumnData.mxs !== -1 ? volumnData.mxs.toString() : 'No Limit';
      sessionDetail.maxProfit = volumnData.mmp && volumnData.mmp !== -1 ? volumnData.mmp.toString() : 'No Limit';
    }
    for (let i = 0; i < 3; i++) {
      sessionDetail[`backRate${i + 1}`] = null;
      sessionDetail[`totalBackAmount${i + 1}`] = '';
      sessionDetail[`layRate${i + 1}`] = null;
      sessionDetail[`totalBackAmount${i + 1}`] = '';
    }
    return sessionDetail;
  }
  betSlipConfiguation() {
    this.betService.getSelectedRunner$().subscribe(x => this.vSelectedRunner = x);
    this.betService.getStake$().pipe(takeUntil(this.notifier),untilDestroyed(this)).subscribe(bet => {
      if (bet && bet.betId === this.betId && this.betService.selectedBetDetailId === bet.betDetailId &&
        this.betService.lastSelectedItem === bet.currentSelectedItem) {
        this.togglePanelView = !this.togglePanelView;
        this.betService.selectedBetDetailId = bet.betDetailId;
        this.betService.lastSelectedItem = bet.currentSelectedItem;
      } else if (bet.betId === this.betId && bet.closeMe) {
        this.togglePanelView = false;
        this.vSelectedRunner = '';
        this.currSelectedItem = '';
      } else if (bet.betId === this.betId && !bet.closeMe) {
        this.betService.selectedBetDetailId = bet.betDetailId;
        this.betService.lastSelectedItem = bet.currentSelectedItem;
        this.togglePanelView = true;
      }
    });
    this.betService.getOvelayStatus$().pipe(takeUntil(this.notifier),untilDestroyed(this)).subscribe(display => {
      this.displayOverlay = display;
    });
    this.betService.getBetId$().pipe(takeUntil(this.notifier),untilDestroyed(this)).subscribe(betid => {
      if (betid) {
        this.vBetId = betid;
      }
    });
  }
  getSessionDetail(): Observable<SessionDetail> {
    return this.session$.asObservable();
  }

  identify(index, item) {
    return item.appRate;
  }
  subscribeStore() {
      this.marketRateFacadeService.getRunningMarketDetail$().pipe(takeUntil(this.notifier),untilDestroyed(this))
        .subscribe(runningMarket => {
          this.getRunnigMarketDetails(runningMarket);
        });
    this.marketRateFacadeService.getMarketClientBetList$().pipe(takeUntil(this.notifier),untilDestroyed(this)).subscribe(marketClientBets => {
      this.marketClientBets = marketClientBets.filter(bet =>
        bet.clientBetDetails.matchID === this.matchId
        && bet.clientBetDetails.betID === this.betId);
      if (websiteSettings.data.isShowMaxLiability && this.marketClientBets && this.marketClientBets.length > 0) {
        this.calculateMaxLiability();
      }
    });
    this.marketRateFacadeService.getMarketNewsChanges$().subscribe((data: any) => {
      var result = this.marketNews.filter(function (o1) {
        return !data.some(function (o2) {
          return o1.mc == o2.mc;
        });
      });
      this.marketNews = Object.assign([], (data.concat(this.marketNews)));
      this.getMarketNews();
    });
  }
  getMarketNews() {
    const currentmarketvolumn = this.currentMarketVolumns.find(c => c.mid == this.betId);
    if (currentmarketvolumn !== null && currentmarketvolumn !== undefined) {
      const marketNews = this.marketNews.filter(x => x.ci == currentmarketvolumn.mc);
      if (marketNews !== null && marketNews !== undefined) {
        this.news = marketNews;
      }
    }
  }
  getRunnigMarketDetails(runningMarket: any) {
    this.currentMarketVolumn = this.currentMarketVolumns.find(c => c.mid == this.betId);
        const marketRunners = getRunnerById(this.marketRunner, this.betId, this.matchId);
    if (this.currentMarketVolumn && marketRunners) {
      const filteredBetDetails = marketRunners.filter(betDetail => betDetail.mid === this.betId);
      const filteredRunningMarket = runningMarket?.mi === +this.currentMarketVolumn.mc ? runningMarket : null;
      if (filteredBetDetails != null
        && filteredRunningMarket != null
        && filteredRunningMarket !== undefined
        && filteredBetDetails.length > 0) {

        const sessionDetails = filteredBetDetails.map(betDetail => {
          return this.setMarketRunnerInformation(betDetail, filteredRunningMarket, this.currentMarketVolumn);
        }).filter(betDetail => betDetail !== undefined);

        const tempSessionDetails = sessionDetails[0];
        if (sessionDetails !== undefined && sessionDetails.length > 0 && sessionDetails[0].position !== undefined && sessionDetails[0].position !== null) {
          sessionDetails[0].position = (sessionDetails[0].position).reverse();
          if (sessionDetails[0].position !== null && sessionDetails[0].position !== undefined) {
            const isFindData = this.commonService.sessionPostion.filter(obj => {
              if (obj.betDetailId === sessionDetails[0].betDetailId) { return true; }
            });
            if (isFindData.length === 0) {
              this.commonService.sessionPostion.push(sessionDetails[0]);
            }
          }
          this.sessionDetail = sessionDetails[0];
          this.session$.next(sessionDetails[0]);
        } else {
          if (tempSessionDetails.position === undefined) {
            const setFindData: any = this.commonService.sessionPostion.filter((obj) => {
              if (obj.betDetailId === tempSessionDetails.betDetailId) { return true; }
            });
            if (setFindData.length === 0) {
              this.sessionDetail = sessionDetails[0];
              this.session$.next(sessionDetails[0]);
            } else {
              const sessionDetail = setFindData[0];
              sessionDetail.backPoint1 = null;
              sessionDetail.backRate1 = null;
              sessionDetail.backPoint2 = null;
              sessionDetail.backRate2 = null;
              sessionDetail.backPoint3 = null;
              sessionDetail.backRate3 = null;
              sessionDetail.layPoint1 = null;
              sessionDetail.layRate1 = null;
              sessionDetail.layPoint2 = null;
              sessionDetail.layRate2 = null;
              sessionDetail.layPoint3 = null;
              sessionDetail.layRate3 = null;
              this.sessionDetail = sessionDetail;
              this.session$.next(sessionDetail);
            }
          } else {
            this.sessionDetail = sessionDetails[0];
            this.session$.next(sessionDetails[0]);
          }
        }

      }
    }
  }

  setMarketRunnerInformation(betDetail: MarketRunner,
    runningMarket: any,
    currentMarketVolumn: Partial<MarketRates>) {
    const sessionDetail = new SessionDetail();
    const volumnData = currentMarketVolumn;
    sessionDetail.isBetAllowed = volumnData.mip && volumnData.mip.toString().toLowerCase() === 'true';
    sessionDetail.minStake = volumnData.mms && volumnData.mms !== -1 ? volumnData.mms.toString() : 'No Limit';
    sessionDetail.maxStake = volumnData.mxs && volumnData.mxs !== -1 ? volumnData.mxs.toString() : 'No Limit';
    sessionDetail.maxProfit = volumnData.mmp && volumnData.mmp !== -1 ? volumnData.mmp.toString() : 'No Limit';
    sessionDetail.time = this.getDateTimeString(new Date());
    sessionDetail.betDetailId = betDetail.rid;
    sessionDetail.betTitle = currentMarketVolumn.mn;
    let marketRate: any;
    if (runningMarket !== undefined
      && runningMarket !== null
      && !!runningMarket.rt
      && runningMarket.rt.length > 0) {
      marketRate =(runningMarket.rt);
    }
    if (marketRate === null || marketRate === undefined) { return sessionDetail; }
    if (marketRate.length > 0) {
      let vRatelength = marketRate.filter(value => value.ib === true).length;
      vRatelength = 3;
      try {
        for (let k = 0; k < vRatelength; k++) {
          const vRatelist = marketRate.filter(value => (k + 1) === value.pr);
          if (vRatelist.length > 0) {
            // tslint:disable-next-line:max-line-length
            const filteredBackRate = vRatelist.filter(value => value.ib === true && (k + 1) == value.pr);
            if (filteredBackRate.length > 0) {
              const maxRate = Math.max.apply(Math, filteredBackRate.map(rate => rate.re));
              const filteredLayRate = marketRate.filter(value => {
                return value.ib === false
                  && value.re <= maxRate
                  && (k + 1) === value.pr;
              });
              sessionDetail[`backRate${k + 1}`] = filteredBackRate[0].re;
              sessionDetail[`backPoint${k + 1}`] = filteredBackRate[0].pt;

              if (filteredLayRate != null && filteredLayRate.length > 0) {
                sessionDetail[`layRate${k + 1}`] = filteredLayRate[0].re;
                sessionDetail[`layPoint${k + 1}`] = filteredLayRate[0].pt;
                if (!!filteredLayRate[0].re) {
                  sessionDetail.position = this.setPosition(filteredLayRate[0].re);
                }
              }
            }
          }
        }
      } catch (ex) {
        console.log('Error in sessionRunnerinformation', ex);
      }
      return sessionDetail;
    } else {
      return sessionDetail;
    }
  }

  placeBet(marketDetail: SessionDetail, rate: number, isBack: boolean, currentItem: string, point: number) {
    if (!this.currentMarketVolumn.mip) {
      this.marketRateFacadeService.setAudioType().next(AudioType.error);
      this.toastr.error(`You are not allowed to place bet for this market.`,"Notification",{
        toastClass: "custom-toast-error"
      });
      return false;
    }
    if (rate != null && !this.betService.getBetStatus()) {

      const placeBet = new Stake();
      placeBet.matchId = this.matchId;
      placeBet.betId = this.betId;
      placeBet.betDetailId = marketDetail.betDetailId;
      placeBet.betTitle = marketDetail.betTitle;
      placeBet.marketType = this.currentMarketVolumn.mt;
      placeBet.isBack = isBack;
      placeBet.isRunnerTypeMarket = false;
      placeBet.rate = rate;
      placeBet.point = point;
      this.placeBetInfo = placeBet;
      placeBet.currentSelectedItem = currentItem;
      placeBet.closeMe = false;
      this.vIsBack = isBack;
      this.vBet = placeBet;
      this.currSeleItem = currentItem;
      this.currSelectedItem = marketDetail.betDetailId.toString() + '_' + currentItem;
      this.betService.setStake().next(placeBet);
      this.betService.setBetId().next(this.betId);
      if (this.vSelectedRunner !== this.betId.toString() + '_' + marketDetail.betDetailId.toString() + '_' +
        this.vIsBack.toString() + '_' + currentItem) {
        this.betService.setSelectedRunner().next(this.betId.toString() + '_' + marketDetail.betDetailId.toString() + '_' +
          this.vIsBack.toString() + '_' + currentItem);
      } else {
        this.currSelectedItem = '';
        this.betService.sendEstimatedProfitLoss().next([]);
        this.betService.setSelectedRunner().next();
      }
    }
  }

  setPosition(rateParam: any): any {
    let clientsBets: any = [];
    if (this.marketClientBets != null && this.marketClientBets !== undefined && this.marketClientBets.length > 0) {
      clientsBets = this.marketClientBets.filter(bet => bet.clientBetDetails.betID === this.betId);
    }
    if (clientsBets.length > 0) {
      const rate = +rateParam;
      const sessionRateList = [];
      for (let i = rate + 5; i > rate - 5; i--) {
        sessionRateList.push({
          'appRate': String(i),
          'appPL': clientsBets.length > 0 ? this.setPlByRate(i, clientsBets) : 0
        });
      }
      return sessionRateList;
    }
    return null;
  }

  private setPlByRate(winnerRate, bets): any {
    let pl = 0;
    const calulatedpl = bets.map(bet => {
      bet.clientBetDetails.isBack ?
        winnerRate >= +bet.clientBetDetails.rate ?
          pl += bet.clientBetDetails.profit : pl -= bet.clientBetDetails.stake
        : winnerRate >= +bet.clientBetDetails.rate ?
          pl -= bet.clientBetDetails.stake : pl += bet.clientBetDetails.profit;
      return pl;
    });
    return calulatedpl[calulatedpl.length - 1];
  }

  calculateMaxLiability() {
    const fancyMarkBetIds = this.currentMarketVolumns.map(item => (item.mt === FanceType.AdvanceSession && item.mid && item.mid !== undefined) ? item.mid : undefined);
    let marketClientBets = this.commonService.marketClientBets;
    marketClientBets = marketClientBets.filter(bet => fancyMarkBetIds.find(fbetId => bet.clientBetDetails.betID === fbetId));
    if (marketClientBets != null && marketClientBets !== undefined && marketClientBets.length > 0) {
      if (marketClientBets.length > 0) {
        const minRate = Math.min.apply(Math, marketClientBets.map(rate => +rate.clientBetDetails.rate)) - 1;
        const maxRate = Math.max.apply(Math, marketClientBets.map(rate => +rate.clientBetDetails.rate)) + 1;
        const clientsBets = marketClientBets.filter(bet => bet.clientBetDetails.betID === this.betId);
        let A = 0;
        for (let i = minRate; i < maxRate; i++) {
          const B = this.setPlByRate(i, clientsBets);
          if (A > B) {
            A = B;
          }
        }
        this.maxLiability = A.toFixed(2);
        if (this.sessionDetail && this.sessionDetail['layRate1'] !== null && this.sessionDetail['layRate1'] !== undefined) {
          this.sessionDetail.position = this.setPosition(this.sessionDetail['layRate1']);
          this.session$.next(this.sessionDetail);
        }
      }
    }
  }
  private getDateTimeString(ed) {
    // tslint:disable-next-line:max-line-length
    const strDateTime = [this.getFormattedDatePart(ed.getDate()), '-', this.getFormattedDatePart(ed.getMonth() + 1), '-', this.getFormattedDatePart(ed.getFullYear()), ' ', this.getFormattedDatePart(ed.getHours()), ':', this.getFormattedDatePart(ed.getMinutes()), ':', this.getFormattedDatePart(ed.getSeconds()), ':', this.getFormattedDatePart(ed.getMilliseconds())].join('');
    return strDateTime;
  }

  private getFormattedDatePart(num) {
    return num < 10 ? '0' + num.toString() : num;
  }

  onStart(event) {
    this.preventDefaultEvent = true;
  }

  onStop(event) {
    this.preventDefaultEvent = false;
  }
  ngOnDestroy() {
    this.notifier.next();
    this.notifier.complete();
   }
}
