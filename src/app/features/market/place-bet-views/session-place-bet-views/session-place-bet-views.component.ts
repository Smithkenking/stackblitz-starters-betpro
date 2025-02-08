import { Component, OnInit, OnDestroy, Input, SimpleChanges, OnChanges, AfterViewInit, ViewChild } from '@angular/core';
import { filter, take } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { untilDestroyed } from 'ngx-take-until-destroy';
import { MarketRates } from '@clientApp-core/models/market/market-rates.model';
import { MarketRunner } from '@clientApp-core/models/market/market-runner.model';
import { EstimatedProfitLoss } from '@clientApp-core/models/bet/estimated-profit-loss.model';
import { PlaceBet } from '@clientApp-core/models/bet/place-bet.model';
import { Stake } from '@clientApp-core/models/bet/stake.model';
import { FanceType } from '@clientApp-core/enums/market-fancy.type';
import { AudioType } from '@clientApp-core/enums/audio.types';
import { BetFacadeService } from '@clientApp-core/services/bet/bet.facade.service';
import { MarketBet } from '@clientApp-core/models/market/market-bet.model';
import { getmarketProfitLoss } from '@clientApp-core/services/shared/shared.service';
import { DeviceInfoService } from '@clientApp-core/services/device-info/deviceinfo.services';
import { MarketRateFacadeService } from '@clientApp-core/services/market/market-rates/market-rate-facade.service';
import { CommonService } from '@clientApp-core/services/common/common.service';
import { PlaceFrom } from '@clientApp-core/enums/placefrom.types';
import { Router } from '@angular/router';
import { websiteSettings } from '@clientApp-core/services/authentication/authentication-facade.service';
import { SwiperComponent } from 'swiper/angular';
import { userProfileInfo } from '@clientApp-core/services/authentication/b2c-user.service';
import { DataLayerService } from '@clientApp-core/services/window/DataLayerService.service';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@clientApp-shared/shared.module';
import { EventShortnamePipe } from '@clientApp-shared/pipes/event-shortname.pipe';
declare var $: any;
@Component({
  standalone: true,
  selector: '[app-session-place-bet-views]',
  templateUrl: './session-place-bet-views.component.html',
  styleUrls: ['./session-place-bet-views.component.scss'],
  imports: [CommonModule, SharedModule, EventShortnamePipe]
})
export class SessionPlaceBetViewsComponent implements OnInit, OnChanges, AfterViewInit, OnDestroy {
  @Input() bet: Stake;
  rate: number;
  stake: number;
  panelProfitLoss: string;
  currentMarketVolumn: MarketRates[];
  betDetails: MarketRunner[];
  chips: any[];
  clientBets: MarketBet[];
  lblProfitLoss: any;
  currentMarketVol: MarketRates;
  deviceInfo = '';
  placeFrom = 0;
  isShowBetSlipBelowRunner: boolean;
  isPlaceBetAllowed = false;
  isDarkTheme: boolean = false;
  isCheckAcceptAnyOdds: boolean = false;
  isPlaceBet: boolean = false;
  betslipSliderMaxVal: any;
  originalChips: any[];
  isWager: boolean = false;
  isB2C: boolean;
  userProfile: any;
  @ViewChild('sessionbetslipSlider2', { static: false }) sessionbetslipSlider2: SwiperComponent;
  constructor(private betService: BetFacadeService, public commonService: CommonService,
    private toastr: ToastrService, public deviceInfoService: DeviceInfoService, public router: Router,
    private marketRateService: MarketRateFacadeService, private dataLayerService: DataLayerService) {
    this.commonService.getDarkThemeStatus().subscribe(isChecked => {
      this.isDarkTheme = isChecked;
    });
    this.commonService.getRealBalanceUseStatus().subscribe(isChecked => {
      this.isWager = websiteSettings.data.appIsRealBalanceUse;
    });
  }

  ngOnInit() {
    this.userProfile = userProfileInfo.data;
    this.isB2C = websiteSettings.data.isB2C;
    this.isWager = websiteSettings.data.appIsRealBalanceUse;
    this.isCheckAcceptAnyOdds = this.commonService.isCheckAcceptAnyOdds;
    this.isShowBetSlipBelowRunner = websiteSettings.data.isShowBetSlipBelowRunner;
    const darkThemeCurrentState = this.commonService.getCookieValue('isCheckedDarkTheme');
    this.isDarkTheme = (darkThemeCurrentState != null && darkThemeCurrentState != undefined && darkThemeCurrentState != '') ? JSON.parse(darkThemeCurrentState).isCheckedDarkTheme : false;
    this.selectFromStore();
    this.subscribeStore();
    this.rate = this.bet.rate;
    this.deviceInfo = 'browser=' + this.deviceInfoService.getDeviceInfo().browser
      + ':: device=' + this.getDevice() + ':: os=' + this.deviceInfoService.getDeviceInfo().os
      + ':: latitude=0 :: longitude=0';
    this.oneClickBet();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes && changes.bet && changes.bet.previousValue) {
      this.clearStake();
      this.isCheckAcceptAnyOdds = this.commonService.isCheckAcceptAnyOdds;
      this.isWager = websiteSettings.data.appIsRealBalanceUse;
      this.isB2C = websiteSettings.data.isB2C;
      this.subscribeStore();
      this.oneClickBet();
    }
  }
  ngAfterViewInit(): void {
    // if(this.isShowBetSlipBelowRunner){this.initRoundSlider();}
  }
  initRoundSlider() {
    const self = this;
    $("#betslip-slider").roundSlider({
      sliderType: "min-range",
      circleShape: "pie",
      startAngle: "315",
      lineCap: "round",
      width: 20,
      step: 500,
      min: self.currentMarketVol.mms,
      max: self.betslipSliderMaxVal,
      value: self.stake,
      svgMode: true,
      rangeColor: "url(#slider1_range_grad)",
      pathColor: "#eee",
      borderWidth: 0,
      startValue: 0,
      showTooltip: false,
      change: function (args) {
        // console.log('change', args.value);
        self.stake = args.value;
        self.onStakeChange(self.bet.betDetailId, self.bet.betId, false, true);
      },
      drag: function (args) {
        // console.log('drag',args);
        // console.log('drag',args.value);
        self.stake = args.value;
        if (args.preValue > args.value) {
          self.updateStake(self.bet.betDetailId, self.bet.betId, true, false);
        } else {
          self.updateStake(self.bet.betDetailId, self.bet.betId, true, true);
        }
        // const index = self.sessionbetslipSlider2.swiperRef.activeIndex;
        // self.chips[index].appChipsName = args.value;
      },
      valueChange: function (e) {
        var color = e.isInvertedRange ? "#FF5722" : "#8BC34A";

      },
      tooltipFormat: function (args) {
        return args.value;
      },
      beforeCreate: function (args) {
        if ($(window).width() < 767) {
          this.options.radius = 90;
        } else {
          this.options.radius = 130;
        }
      }
    });
  }
  subscribeStore() {
    this.currentMarketVolumn = Object.assign([], this.marketRateService.curMarketsVol);
    this.currentMarketVol = Object.assign([], this.currentMarketVolumn.find(x => x.mid == this.bet.betId));
    this.betDetails = Object.assign([], this.marketRateService.curMarketsRunners);
    this.chips = JSON.parse(JSON.stringify(this.commonService.chipList));
    this.originalChips = JSON.parse(JSON.stringify(this.chips));
    const maxappChips = Math.max.apply(Math, this.chips.map(function (o) { return o.appChips; }));
    if (this.currentMarketVol.mxs === -1) {
      this.betslipSliderMaxVal = maxappChips;
    } else {
      this.betslipSliderMaxVal = this.currentMarketVol.mxs;
    }
    // this.stake = this.currentMarketVol.mms;
    this.clientBets = this.commonService.marketClientBets;
    this.marketRateService.getMarketClientBetList$().pipe(
      filter(value => typeof (value) !== 'undefined' && value !== null)).subscribe(bets => {
        this.clientBets = bets;
        this.resetProfitLoss();
      });
    this.marketRateService.getCurrentMarketVolume$().pipe(untilDestroyed(this), take(1)).subscribe((data) => {
      if (data != null) {
      }
    });
  }
  oneClickBet() {
    if (websiteSettings.data.isShowOneClickBet) {
      // if(this.isShowBetSlipBelowRunner){this.initRoundSlider();}
      const isCheckedOneClickBet = this.commonService.getCookieValue('isCheckedOneClickBet');
      if ((isCheckedOneClickBet !== null && isCheckedOneClickBet != undefined && isCheckedOneClickBet != '')) {
        if (JSON.parse(isCheckedOneClickBet).isCheckedOneClickBet) {
          const oneClickSelectedStake = this.commonService.getCookieValue('oneClickSelectedStake');
          if (oneClickSelectedStake != null &&
            oneClickSelectedStake != undefined && oneClickSelectedStake != '' && JSON.parse(oneClickSelectedStake)) {
            const selectedStakeValue = JSON.parse(oneClickSelectedStake);
            this.stake = selectedStakeValue ? +selectedStakeValue : 0;
            this.onEnter();
          } else {
            this.toastr.error('Please select one click stake value again.', "Notification", {
              toastClass: "custom-toast-error"
            });
            this.commonService.setCookieValue('isCheckedOneClickBet', JSON.stringify({ isCheckedOneClickBet: false }));
            this.commonService.setOneClickBetStatus(false);
          }
        } else {
          this.commonService.setCookieValue('isCheckedOneClickBet', JSON.stringify({ isCheckedOneClickBet: false }));
          this.commonService.setOneClickBetStatus(false);
        }
      }
    }
  }
  getDevice() {
    if (this.deviceInfoService.isDesktop()) {
      this.placeFrom = PlaceFrom.Web;
      return 'Desktop';
    } else if (this.deviceInfoService.isMobile()) {
      this.placeFrom = PlaceFrom.Mobile;
      return 'Mobile';
    } else if (this.deviceInfoService.isTablet()) {
      this.placeFrom = PlaceFrom.Tablet;
      return 'Tablet';
    } else {
      return 'unknown';
    }
  }
  getMarketBets() {
    if (websiteSettings.data.getBetInfoApiThrough) {
      if (!websiteSettings.data.appIsRealBalanceUse) {
        this.marketRateService.getWagerBetInfo(this.bet.betId);
      } else {
        this.marketRateService.getBetInfo(this.bet.betId);
      }
    }
  }
  selectFromStore() {
    this.currentMarketVolumn = Object.assign([], this.marketRateService.curMarketsVol);
    this.betDetails = Object.assign([], this.marketRateService.curMarketsRunners);
    this.currentMarketVol = Object.assign([], this.currentMarketVolumn.find(x => x.mid == this.bet.betId));
    this.clientBets = this.commonService.marketClientBets;
    this.chips = JSON.parse(JSON.stringify(this.commonService.chipList));
    this.originalChips = JSON.parse(JSON.stringify(this.chips));
    const maxappChips = Math.max.apply(Math, this.chips.map(function (o) { return o.appChips; }));
    if (this.currentMarketVol.mxs === -1) {
      this.betslipSliderMaxVal = maxappChips;
    } else {
      this.betslipSliderMaxVal = this.currentMarketVol.mxs;
    }
  }
  overrideUpDownAndDecimalKey(event: KeyboardEvent) {
    try {
      let keynum = event.keyCode > 0 ? event.keyCode : (event.charCode > 0 ? event.charCode : 0);
      if (event.code && event.code.toLowerCase()) {
        if (event.code.toLowerCase().indexOf('numpad') >= 0 && event.code.toLowerCase().indexOf('numpadenter') < 0) {
          keynum = keynum - 48;
        }
        if (event.code.toLowerCase().indexOf('numpaddecimal') >= 0 || event.code.toLowerCase().indexOf('period') >= 0) {
          keynum = 46;
        }
      }

      if (keynum) {
        if (keynum === 38) {
          this.updateStake(this.bet.betDetailId, this.bet.betId, true, true);
          event.preventDefault();
          return false;
        } else if (keynum === 40) {
          this.updateStake(this.bet.betDetailId, this.bet.betId, true, false);
          event.preventDefault();
          return false;
        } else if (keynum === 37 || keynum === 39) {
          return true;
        }
      }
      if (event.code.indexOf('.') !== -1) {
        if (keynum === 46) { event.preventDefault(); return false; }
      }
      if (keynum === 46) { return true; }
      if (keynum > 31 && (keynum < 48 || keynum > 57)) { event.preventDefault(); return false; }
      if (keynum === 13) {
        if (this.rate && this.stake) {
          this.onStakeChange(this.bet.betDetailId, this.bet.betId, 0, true);
        }
        event.preventDefault(); return false;
      }
      return true;
    } catch (ex) {
      console.log('error:=' + ex);
    }
    return true;
  }
  onStakeChange(betDetailID, betID, validateValue, isMarketBet) {
    try {
      let error = false;
      this.isPlaceBetAllowed = true;
      let value = (!this.stake) ? 0 : this.stake;
      const marketVolumn = Object.assign([], this.currentMarketVolumn.find(x => x.mid == this.bet.betId));
      if (marketVolumn !== undefined && marketVolumn !== null) {
        const minStackValue = marketVolumn.mms;
        const maxStackValue = marketVolumn.mxs;

        if (validateValue && value < minStackValue) {
          value = minStackValue;
          this.marketRateService.setAudioType().next(AudioType.error);
          this.toastr.error(`The stake(s) you have entered are below the minimum ${minStackValue}.`, "Notification", {
            toastClass: "custom-toast-error"
          });
          this.stake = value;
          error = true;
          this.isPlaceBetAllowed = false;
          this.isPlaceBet = false;
        }
        if (validateValue && maxStackValue !== -1) {
          if (validateValue && value > maxStackValue) {
            value = maxStackValue;
            this.marketRateService.setAudioType().next(AudioType.error);
            // tslint:disable-next-line:max-line-length
            this.toastr.error(`The stake(s) you have entered are above the maximum ${maxStackValue}.`, "Notification", {
              toastClass: "custom-toast-error"
            });
            this.stake = value;
            error = true;
            this.isPlaceBetAllowed = false;
            this.isPlaceBet = false;
          }
        }
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
      } else {
        this.toastr.error('Stake Changes', "Notification", {
          toastClass: "custom-toast-error"
        });
        error = true;
        this.isPlaceBetAllowed = false;
        this.isPlaceBet = false;
      }
      return error ? false : true;
    } catch (ex) {
      console.log('error:=' + ex);
      return false;
    }
  }

  // button Stake Increamenet event
  updateStake(betDetailID, betID, isMarketBet, isIncrement) {
    try {
      this.isPlaceBetAllowed = true;
      const marketVolumn = Object.assign([], this.currentMarketVolumn.find(x => x.mid == this.bet.betId));
      if (marketVolumn !== undefined && marketVolumn != null) {
        const minStackValue = marketVolumn.mms;
        const maxStackValue = marketVolumn.mxs;
        let finalValue = this.calculateStake(isIncrement, minStackValue, maxStackValue);
        if (isIncrement) {
          if (maxStackValue !== -1) {
            if (finalValue > maxStackValue) {
              finalValue = maxStackValue;
              this.marketRateService.setAudioType().next(AudioType.error);
              this.toastr.error(`The stake(s) you have entered are above the maximum ${maxStackValue} .`, "Notification", {
                toastClass: "custom-toast-error"
              });
            }
          }
        } else {
          if (finalValue < minStackValue) {
            finalValue = minStackValue;
            this.marketRateService.setAudioType().next(AudioType.error);
            this.toastr.error(`The stake(s) you have entered are below the minimum ${minStackValue} .`, "Notification", {
              toastClass: "custom-toast-error"
            });
          }
        }
        this.stake = finalValue;
        if (isMarketBet) { this.calculateProfitLoss(betDetailID, betID); }
        // if(this.isShowBetSlipBelowRunner){
        // $("#betslip-slider").roundSlider('setValue', this.stake); 
        // $("#betslip-slider").roundSlider("refreshTooltip");
        // }
      } else {
        this.isPlaceBetAllowed = false;
        this.isPlaceBet = false;
        return false;
      }
    } catch (ex) {
      console.log('error:=' + ex);
    }
  }

  // set stack on textbox
  setStake(chipValue, isMarketBet) {
    try {
      this.isPlaceBetAllowed = true;
      let stake = 0;
      if (!isNaN(this.stake)) {
        stake = this.stake;
      }
      if (chipValue !== '' && chipValue !== '""') {
        // this.stake = stake + parseFloat(chipValue);
        this.stake = parseFloat(chipValue);
        let value = this.stake;
        const marketVolumn = Object.assign([], this.currentMarketVolumn.find(x => x.mid == this.bet.betId));
        if (marketVolumn !== undefined && marketVolumn != null) {
          const minStackValue = marketVolumn.mms;
          const maxStackValue = marketVolumn.mxs;
          if (value < minStackValue) {
            value = minStackValue;
            this.marketRateService.setAudioType().next(AudioType.error);
            this.toastr.error(`The stake(s) you have entered are below the minimum ${minStackValue} .`, "Notification", {
              toastClass: "custom-toast-error"
            });
            this.stake = value;
          }
          if (maxStackValue !== -1) {
            if (value > maxStackValue) {
              value = maxStackValue;
              this.marketRateService.setAudioType().next(AudioType.error);
              this.toastr.error(`The stake(s) you have entered are above the maximum ${maxStackValue} .`, "Notification", {
                toastClass: "custom-toast-error"
              });
              this.stake = value;
            }
          }
        } else {
          this.toastr.error('Stake Changes', "Notification", {
            toastClass: "custom-toast-error"
          });
          this.isPlaceBetAllowed = false;
          this.isPlaceBet = false;
          return false;
        }
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
  placeBet(betDetailID, betID) {
    try {
      if (this.betService.getBetStatus()) {
        this.isPlaceBet = false;
        return false;
      }
      this.betService.setOvelayStatus().next(true);
      if (!this.bet.rate || !this.stake || isNaN(this.bet.rate) || isNaN(this.stake)) {
        this.marketRateService.setAudioType().next(AudioType.error);
        this.toastr.error(`Please enter rate or stake value.`, "Notification", {
          toastClass: "custom-toast-error"
        });
        this.betService.setOvelayStatus().next(false);
        this.isPlaceBetAllowed = false;
        this.isPlaceBet = false;
        return false;
      }
      if (!this.isPlaceBetAllowed) { return false; }
      const placeBet = new PlaceBet();
      placeBet.clientId = 1880;
      placeBet.betId = betID;
      placeBet.betDetailId = betDetailID;
      placeBet.isBack = this.bet.isBack;
      placeBet.rate = this.bet.rate;
      placeBet.stake = this.stake;
      placeBet.fancyType = this.bet.marketType;
      placeBet.point = this.bet.point;
      placeBet.placeFrom = this.placeFrom;
      placeBet.deviceinfo = this.deviceInfo;
      placeBet.isWager = websiteSettings.data.appIsAutowagerPlacebet ? false : !this.isWager;;
      const walletId = JSON.parse(localStorage.getItem('wid'));
      if (walletId != null) {
        placeBet.walletId = walletId;
      }
      this.betService.setBetStatus(true);
      this.betService.placeBet(placeBet).pipe(take(1)).subscribe(response => {
        const result = response.split(';');
        if (result.length > 0) {
          if (result[0] !== 'false') {
            this.betService.setOvelayStatus().next(false);
            this.betService.setBetPlacedStatus().next(true);
            this.marketRateService.setAudioType().next(AudioType.placeBet);
            this.toastr.success(result[1], "Notification", {
              toastClass: "custom-toast-success"
            });
            const _currentSet = {
              'event': 'place_bet',
              'phone': '+' + userProfileInfo.data.appMobileNo,
              'Value': this.stake,
              'Sport_type': this.currentMarketVol.sn,
              'Markettype': 'sport'
            };
            this.dataLayerService.pingHome(_currentSet);
            setTimeout(() => {
              this.betService.setBetPlacedStatus().next(true);
              this.betService.setBetStatus(false);
              this.betService.setStake().next(this.bet);
              this.betService.setSelectedRunner().next();
            }, 2000);
            this.resetProfitLoss();
            this.getMarketBets();
          } else {
            this.marketRateService.setAudioType().next(AudioType.error);
            this.toastr.error(result[1], "Notification", {
              toastClass: "custom-toast-error"
            });
            this.betService.setOvelayStatus().next(false);
            this.betService.setBetStatus(false);
          }
        } else {
          this.marketRateService.setAudioType().next(AudioType.error);
          this.betService.setBetStatus(false);
        }
        this.betService.setBetStatus(false);
        this.betService.setOvelayStatus().next(false);
      }, (error) => {
        console.log('place bet error', error);
        this.betService.setOvelayStatus().next(false);
        this.betService.setBetStatus(false);
        this.betService.setStake().next(this.bet);
        this.toastr.error(error.status + error.statusText, 'Please Once Confirm Your Last Market BetList After Placing New Bet.');
        // Opps something went wrong please try again !
        this.router.navigateByUrl('/home');
      });
    } catch (ex) {
      console.log(`error:=` + ex);
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
    this.isPlaceBet = false;
    this.resetProfitLoss();
  }
  onEnter() {
    let value = (!this.stake) ? 0 : this.stake;
    if (value > 0) {
      if (this.onStakeChange(this.bet.betDetailId, this.bet.betId, true, true)) {
        this.placeBet(this.bet.betDetailId, this.bet.betId);
      }
    } else {
      this.marketRateService.setAudioType().next(AudioType.error);
      this.toastr.error(`please enter bet amount.`, "Notification", {
        toastClass: "custom-toast-error"
      });
    }
  }

  // calculate Stake
  private calculateStake(isIncrement, minStakeRate, maxStakeRate) {
    try {
      const multiplier = isIncrement ? 1 : -1;

      if (!this.stake) { this.stake = 0; }
      const changeValue = 1;
      let finalValue = this.stake + multiplier * changeValue;
      if (finalValue <= minStakeRate) { finalValue = minStakeRate; }
      if (maxStakeRate !== -1) {
        if (finalValue > maxStakeRate) { finalValue = maxStakeRate; }
      }
      return finalValue;
    } catch (ex) {
      console.log('error:=' + ex);
    }
    return minStakeRate;
  }

  private calculateProfitLoss(betDetailId, betId) {
    try {
      const marketVolumn = Object.assign([], this.currentMarketVolumn.find(x => x.mid == this.bet.betId));

      let betDetails: any = [];
      try {
        if (this.betDetails && this.betDetails.length > 0) {
          betDetails = this.betDetails.filter(value => value.mid === this.bet.betId);
        }
      } catch (err) {
        betDetails = null;
      }

      if (!this.rate || !this.stake || isNaN(this.rate) || isNaN(this.stake)) {
        this.resetProfitLoss();
        return false;
      }
      if (!this.betDetails || this.betDetails.length <= 0) { return false; }

      let calculated = 0;
      if (marketVolumn && (marketVolumn.mt === FanceType.Market || marketVolumn.mt === FanceType.ManualOdds)) {
        calculated = (this.rate - 1) * this.stake;
      } else if (marketVolumn && (marketVolumn.mt === FanceType.Session
        || marketVolumn.mt === FanceType.AdvanceSession)) {
        calculated = ((this.stake * this.bet.point) / 100);
      } else if (marketVolumn && (marketVolumn.mt === FanceType.Bookmakers)) {
        calculated = (((this.rate / 100) + 1) - 1) * this.stake;
      } else if (marketVolumn && (marketVolumn.mt === FanceType.LineMarket)) {
        calculated = this.stake;
      }
      this.panelProfitLoss = calculated.toFixed(2);

      this.lblProfitLoss = calculated.toFixed(2);

      // Chetan: if you dont want left Market Box PL update please uncomment it
      // return false;
      if (marketVolumn && marketVolumn.mt !== FanceType.Market
        && marketVolumn.mt !== FanceType.Bookmakers
        && marketVolumn.mt !== FanceType.ManualOdds) { return false; }
      const calculatedEstimatedProfitLoss: EstimatedProfitLoss[] = [];
      betDetails.map((bet: MarketRunner) => {
        const currentBet = { betId: this.bet.betId, marketType: bet.mn };
        let currentProfitLoss = getmarketProfitLoss(this.clientBets, bet.rid, currentBet);
        if (!this.bet.currentProfitLoss) { currentProfitLoss = 0; }

        let finalRate = parseFloat(currentProfitLoss.toFixed(2));

        const isSameItem = (betDetailId === bet.rid);
        if (this.bet.isBack) {// for back
          if (isSameItem) { // for same item, add calculated
            finalRate = finalRate + calculated;
          } else {// for different item, remove stake
            finalRate = finalRate - this.stake;
          }
        } else {// for lay
          if (isSameItem) { // for same item, remove calculated
            finalRate = finalRate - calculated;
          } else {// for different item, add stake
            finalRate = finalRate + this.stake;
          }
        }
        finalRate = +finalRate.toFixed(2);
        // Write logic to pass this value to runner.
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

  // reset profit and loss  bet detail is wises
  private resetProfitLoss() {
    try {
      const marketVolumn = Object.assign([], this.currentMarketVolumn.find(x => x.mid == this.bet.betId));

      if (marketVolumn && (marketVolumn.mt === FanceType.Market || marketVolumn.mt === FanceType.ManualOdds)) {

        let betDetails: any = [];
        try {
          if (this.betDetails && this.betDetails.length > 0) {
            betDetails = this.betDetails.filter(value => value.mid === this.bet.betId);
          }
        } catch (err) {
          betDetails = null;
        }
        const calculatedEstimatedProfitLoss: EstimatedProfitLoss[] = [];
        betDetails.map((bet: MarketRunner) => {
          const currentBet = { betId: this.bet.betId, marketType: bet.mn };
          const currentProfitLoss = getmarketProfitLoss(this.clientBets, bet.rid, currentBet);
          const estimatedProfitLoss = new EstimatedProfitLoss();
          estimatedProfitLoss.betId = bet.mid;
          estimatedProfitLoss.betDetailId = bet.rid;
          estimatedProfitLoss.estimatedProfitLoss = currentProfitLoss;
          calculatedEstimatedProfitLoss.push(estimatedProfitLoss);
        });
        this.betService.sendEstimatedProfitLoss().next(calculatedEstimatedProfitLoss);
      }
    } catch (ex) {
      console.log('error:=' + ex);
    }
  }

  omit_special_char(event) {
    var k;
    k = event.charCode;  //         k = event.keyCode;  (Both can be used)
    return ((k > 64 && k < 91) || (k > 96 && k < 123) || k == 8 || k == 32 || (k >= 48 && k <= 57));
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
