import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Stake } from '@clientApp-core/models/bet/stake.model';
import { MarketRates } from '@clientApp-core/models/market/market-rates.model';
import { MarketRunner } from '@clientApp-core/models/market/market-runner.model';
import { websiteSettings } from '@clientApp-core/services/authentication/authentication-facade.service';
import { BetFacadeService } from '@clientApp-core/services/bet/bet.facade.service';
import { CommonService } from '@clientApp-core/services/common/common.service';
import { apiEndPointData } from '@clientApp-core/services/config/connfig.service';
import { MarketRateFacadeService } from '@clientApp-core/services/market/market-rates/market-rate-facade.service';
import { MarketType } from '@clientApp-core/services/market/types/market';
import { SessionDetail } from '@clientApp-core/services/market/types/session-detail';
import { getRunnerById } from '@clientApp-core/services/shared/shared.service';
import { untilDestroyed } from 'ngx-take-until-destroy';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: '[app-login-advance-session-bet-details]',
  templateUrl: './login-advance-session-bet-details.component.html',
  styleUrls: ['./login-advance-session-bet-details.component.scss']
})
export class LoginAdvanceSessionBetDetailsComponent implements OnInit {
  @Input() matchId: number;
  @Input() marketRunner: MarketRunner[];
  @Input() currentMarketVolumns: MarketRates[];
  @Input() betId: number;
  @Input() marketType: string;
  @Input() market: MarketType;
  @Output() openPopup =  new EventEmitter();
  sessionDetail: SessionDetail;
  session$ = new BehaviorSubject<SessionDetail>(null);
  placeBetInfo: any;
  vBet: Stake;
  vIsBack: boolean;
  vSelectedRunner = '';
  currSeleItem: string;
  currSelectedItem: string;
  priority = 1;
  currentMarketVolumn: Partial<MarketRates>;
  notifier = new Subject();
  isShowPlaceBetCounter: boolean = false;
  isShowBetSlipBelowRunner: boolean;
  displayOverlay: boolean;
  togglePanelView: boolean;
  vBetId: number;
  loaderPath:any;
  constructor(private marketRateFacadeService: MarketRateFacadeService
    , private betService: BetFacadeService,public commonService: CommonService
  ) { }

  ngOnInit(): void {
    this.setmatkettemplate();
    this.subscribeStore();
    this.loaderPath = apiEndPointData.data.loaderPath;
    this.isShowPlaceBetCounter = websiteSettings.data.isShowPlaceBetCounter;
    this.isShowBetSlipBelowRunner = apiEndPointData.data.isShowBetSlipBelowRunner;
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
    if (volumnData) {
      sessionDetail.betTitle = volumnData.mn;
      sessionDetail.isBetAllowed = volumnData.mip && volumnData.mip.toString().toLowerCase() === 'true';
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
  openLoginModel(){
    this.openPopup.emit();
  }
  getSessionDetail(): Observable<SessionDetail> {
    return this.session$.asObservable();
  }
  subscribeStore() {
      this.marketRateFacadeService.getRunningMarketDetail$().pipe(takeUntil(this.notifier),untilDestroyed(this))
        .subscribe(runningMarket => {
          this.getRunnigMarketDetails(runningMarket);
        });
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
        this.sessionDetail = sessionDetails[0];
        this.session$.next(sessionDetails[0]);
      }
    }
  }

  setMarketRunnerInformation(betDetail: MarketRunner,
    runningMarket: any,
    currentMarketVolumn: Partial<MarketRates>) {
    const sessionDetail = new SessionDetail();
    const volumnData = currentMarketVolumn;
    sessionDetail.isBetAllowed = volumnData.mip && volumnData.mip.toString().toLowerCase() === 'true';
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
                  sessionDetail.position = null;
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

  private getDateTimeString(dt) {
    const strDateTime = [this.getFormattedDatePart(dt.getDate()), '-', this.getFormattedDatePart(dt.getMonth() + 1), '-', this.getFormattedDatePart(dt.getFullYear()), ' ', this.getFormattedDatePart(dt.getHours()), ':', this.getFormattedDatePart(dt.getMinutes()), ':', this.getFormattedDatePart(dt.getSeconds()), ':', this.getFormattedDatePart(dt.getMilliseconds())].join('');
    return strDateTime;
  }

  private getFormattedDatePart(num) {
    return num < 10 ? '0' + num.toString() : num;
  }
  ngOnDestroy() {
    this.notifier.next();
    this.notifier.complete();
   }
}
