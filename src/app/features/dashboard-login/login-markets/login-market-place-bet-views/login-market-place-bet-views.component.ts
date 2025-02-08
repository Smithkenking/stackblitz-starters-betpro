import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FanceType } from '@clientApp-core/enums/market-fancy.type';
import { EstimatedProfitLoss } from '@clientApp-core/models/bet/estimated-profit-loss.model';
import { Stake } from '@clientApp-core/models/bet/stake.model';
import { MarketRates } from '@clientApp-core/models/market/market-rates.model';
import { MarketRunner } from '@clientApp-core/models/market/market-runner.model';
import { BetFacadeService } from '@clientApp-core/services/bet/bet.facade.service';
import { CommonService } from '@clientApp-core/services/common/common.service';
import { apiEndPointData } from '@clientApp-core/services/config/connfig.service';
import { DeviceInfoService } from '@clientApp-core/services/device-info/deviceinfo.services';
import { getmarketProfitLoss } from '@clientApp-core/services/shared/shared.service';
import { SwiperOptions } from 'swiper';
import { SwiperComponent } from 'swiper/angular';
declare var $: any;
@Component({
  selector: '[app-login-market-place-bet-views]',
  templateUrl: './login-market-place-bet-views.component.html',
  styleUrls: ['./login-market-place-bet-views.component.scss']
})
export class LoginMarketPlaceBetViewsComponent implements OnInit, AfterViewInit {
  @Input() bet: Stake;
  rate: number;
  stake: number;
  panelProfitLoss: string;
  currentMarketVolumn: MarketRates[];
  betDetails: MarketRunner[];
  lblProfitLoss: any;
  isPlaceBetAllowed = false;
  cuuRate: number;
  currentMarketVol: MarketRates;
  isDarkTheme: boolean = false;
  isdisplayRateControl: boolean = true;
  chip = [500, 1000, 2000, 5000, 10000, 20000, 50000, 100000, 200000];
  isShowBetSlipBelowRunner: boolean;
  @ViewChild('betslipSlider2', { static: false }) betslipSlider2: SwiperComponent;
  constructor(private betService: BetFacadeService, public commonService: CommonService, private deviceInfoService : DeviceInfoService) {
      this.commonService.getDarkThemeStatus().subscribe(isChecked => {
        this.isDarkTheme = isChecked;
      });
     }

  ngOnInit() {
    this.isShowBetSlipBelowRunner = apiEndPointData.data.isShowBetSlipBelowRunner;
    const darkThemeCurrentState = this.commonService.getCookieValue('isCheckedDarkTheme');
    this.isDarkTheme = (darkThemeCurrentState != null && darkThemeCurrentState != undefined && darkThemeCurrentState != '') ? JSON.parse(darkThemeCurrentState).isCheckedDarkTheme : false;
    this.subscribeStore();
    this.cuuRate = JSON.parse(JSON.stringify(this.bet.rate));
  }
  ngAfterViewInit(): void {
  //   if(this.isShowBetSlipBelowRunner){
  //   const self = this;
  //   $("#betslip-slider").roundSlider({
  //     sliderType: "min-range",
  //     circleShape: "pie",
  //     startAngle: "315",
  //     lineCap: "round",
  //     width: 20,
  //     min: 0,
  //     max: 200000,
  //     value: 10,
  //     step: 500,
  //     svgMode: true,
  //     rangeColor: "url(#slider1_range_grad)",
  //     pathColor: "#eee",
  //     borderWidth: 0,
  //     startValue: 0,
  //     change: function (args) {
  //       // console.log('change', args.value);
  //       self.stake = args.value;
  //       self.onStakeChange(self.bet.betDetailId,self.bet.betId, false, true);
  //     },
  //     drag: function (args) {
  //       // console.log('drag',args);
  //       // console.log('drag',args.value);
  //       self.stake = args.value;
  //       if (args.preValue > args.value) {
  //         self.updateStake(self.bet.betDetailId, self.bet.betId, true, false);
  //       } else {
  //         self.updateStake(self.bet.betDetailId, self.bet.betId, true, true);
  //       }
  //       },
  //     valueChange: function (e) {
  //       var color = e.isInvertedRange ? "#FF5722" : "#8BC34A";
      
  //     },
  //     tooltipFormat:  function (args) {
  //       return args.value;
  //     },
  //     beforeCreate: function (args) {
  //       if ($(window).width() < 767) {
  //         this.options.radius = 90;
  //       } else {
  //         this.options.radius = 130;
  //       }
  //     }
  //   });
  // }
  }
  ngOnChanges(changes: SimpleChanges) {
    if (changes && changes.bet && changes.bet.previousValue) {
      this.cuuRate = JSON.parse(JSON.stringify(this.bet.rate));
      this.clearStake();
    }
  }
  onStakeKeuUpEvent(stake: any) {
    var containputiner: any = document.querySelector("#"+stake);
    // console.log(containputiner.value);
    this.stake = containputiner.value;
    this.onStakeChange(this.bet.betDetailId,this.bet.betId, false, true);
  }
  subscribeStore() {
    this.currentMarketVolumn =Object.assign([],this.commonService.curMarketsVol);
    this.currentMarketVol = Object.assign([], this.currentMarketVolumn.find(x => x.mid == this.bet.betId));
    this.betDetails = Object.assign([],this.commonService.curMarketsRunners);
  }

  trackByFn(index, item) {
    return item.chipsTemplateId;
  }
  onStakeChange(betDetailID, betID, validateValue, isMarketBet) {
    try {
        if (!this.stake) {
          this.clearStake();
        }
        if (isMarketBet) {
          this.calculateProfitLoss(betDetailID, betID);
      }
      // if(this.isShowBetSlipBelowRunner){
      // $("#betslip-slider").roundSlider('setValue', this.stake); 
      // $("#betslip-slider").roundSlider("refreshTooltip");
      // }
    } catch (ex) {
      console.log('error:=' + ex);
    }
  }
  setStake(chipValue, isMarketBet) {
    try {
      this.isPlaceBetAllowed = true;
      let stake = 0;
      if (!isNaN(this.stake)) {
        stake = this.stake;
      }
      if (chipValue !== '' && chipValue !== '""') {
        this.stake = parseFloat(chipValue);
      } else {
        this.stake = 0;
      }
      if (isMarketBet) {
        this.calculateProfitLoss(this.bet.betDetailId, this.bet.betId);
      }
      // if(this.isShowBetSlipBelowRunner){
      // $("#betslip-slider").roundSlider('setValue', this.stake); 
      // $("#betslip-slider").roundSlider("refreshTooltip");
      // }
    } catch (ex) {
      console.log('error:=' + ex);
    }
  }
  cancelBet() {
    this.betService.setStake().next(this.bet);
    this.betService.setSelectedRunner().next();
  }
  clearStake() {
    this.stake = null;
    this.lblProfitLoss = '';
    this.isPlaceBetAllowed = false;
    this.betService.sendEstimatedProfitLoss().next([]);
  }
  private calculateProfitLoss(betDetailId, betId) {
    try {
      const marketVolumn = Object.assign([], this.currentMarketVolumn.find(x => x.mid == this.bet.betId));

      let betDetails;
      try {
        betDetails = this.betDetails.filter(value => value.mid === this.bet.betId);
      } catch (err) {
        betDetails = null;
      }

      if (!this.bet.rate || !this.stake || isNaN(this.bet.rate) || isNaN(this.stake)) {
        return false;
      }
      if (!this.betDetails || this.betDetails.length <= 0) { return false; }

      let calculated = 0;
      if (marketVolumn.mt === FanceType.Market || marketVolumn.mt === FanceType.ManualOdds || marketVolumn.mt === FanceType.Virtual) {
        calculated = (this.bet.rate - 1) * this.stake;
      } else if (marketVolumn.mt === FanceType.Session
        || marketVolumn.mt === FanceType.AdvanceSession) {
        calculated = ((this.stake * this.bet.rate) / 100);
      } else if (marketVolumn.mt === FanceType.Bookmakers) {
        calculated = (((this.bet.rate / 100) + 1) - 1) * this.stake;
      } else if (marketVolumn.mt === FanceType.LineMarket) {
        calculated = this.stake;
      }
      this.panelProfitLoss = calculated.toFixed(2);

      this.lblProfitLoss = calculated.toFixed(2);

     
      if (marketVolumn.mt !== FanceType.Market
        && marketVolumn.mt !== FanceType.Bookmakers
        && marketVolumn.mt !== FanceType.ManualOdds && marketVolumn.mt !== FanceType.Virtual) { return false; }
      const calculatedEstimatedProfitLoss: EstimatedProfitLoss[] = [];
      betDetails.map((bet: MarketRunner) => {
        const currentBet = { betId: this.bet.betId, betName: bet.mn }
        let currentProfitLoss = getmarketProfitLoss([], bet.rid, currentBet);

        if (!this.bet.currentProfitLoss) { currentProfitLoss = 0; }

        let finalRate = parseFloat(currentProfitLoss.toFixed(2));

        const isSameItem = (betDetailId === bet.rid);
        if (this.bet.isBack) {
          if (isSameItem) { 
            finalRate = finalRate + calculated;
          } else {
            finalRate = finalRate - this.stake;
          }
        } else {
          if (isSameItem) { 
            finalRate = finalRate - calculated;
          } else {
            finalRate = finalRate + this.stake;
          }
        }
        finalRate = +finalRate.toFixed(2);
        const estimatedProfitLoss = new EstimatedProfitLoss();
        estimatedProfitLoss.betId = bet.mid;
        estimatedProfitLoss.betDetailId = bet.rid;
        estimatedProfitLoss.estimatedProfitLoss = finalRate;
        calculatedEstimatedProfitLoss.push(estimatedProfitLoss);
      });
      this.betService.sendEstimatedProfitLoss().next(calculatedEstimatedProfitLoss);
    } catch (ex) {
      console.log('calculateProfitLoss error :' + ex);
    }
  }
  updateStake(betDetailID, betID, isMarketBet, isIncrement) {
    try {
      if (this.stake >= 0) {
        let finalValue = this.calculateStake(isIncrement, 0, 0);
        this.stake = finalValue;
        if (isMarketBet) { this.calculateProfitLoss(betDetailID, betID); }
      } else {
        this.stake = 0;
      }
    } catch (ex) {
      console.log('error:=' + ex);
    }
  }
  private calculateStake(isIncrement, minStakeRate, maxStakeRate) {
    try {
      const multiplier = isIncrement ? 1 : -1;

      if (!this.stake) { this.stake = 0; }
      const changeValue = 1;
      let finalValue = this.stake + multiplier * changeValue;
      return finalValue;
    } catch (ex) {
      console.log('error:=' + ex);
    }
    return minStakeRate;
  }
  openLoginModel() {
    this.cancelBet();
    this.commonService.setLoginPopupOpen(true);
  }
  omit_special_char(event)
  {   
     var k;  
     k = event.charCode;  //         k = event.keyCode;  (Both can be used)
     return((k > 64 && k < 91) || (k > 96 && k < 123) || k == 8 || k == 32 || (k >= 48 && k <= 57)); 
  }
  checkIfNumber(e) {
    e = e || window.event;
    var charCode = (typeof e.which == "undefined") ? e.keyCode : e.which;
    var charStr = String.fromCharCode(charCode);
    if (!charStr.match(/^[0-9]+$/)) {
      e.preventDefault();
    } else {
      if (this.stake && this.stake.toString().length == 6)
        return false;
    }
     
  }
  focusFunction() {
    this.stake = null;
    this.clearStake();
    // if(this.isShowBetSlipBelowRunner){
    // $("#betslip-slider").roundSlider('setValue', 0); 
    // $("#betslip-slider").roundSlider("refreshTooltip");
    // }
  }
  ngOnDestroy() { }

}
