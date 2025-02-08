import { Component, OnInit, OnDestroy, Input, ViewChild, SimpleChanges, OnChanges, AfterViewInit } from '@angular/core';
import { catchError, filter, switchMap, take } from 'rxjs/operators';
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
import { MarketRateFacadeService } from '@clientApp-core/services/market/market-rates/market-rate-facade.service';
import { DeviceInfoService } from '@clientApp-core/services/device-info/deviceinfo.services';
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
import { of, throwError } from 'rxjs';
declare var $: any;
@Component({
  standalone: true,
  selector: '[app-market-place-bet-views]',
  templateUrl: './market-place-bet-views.component.html',
  styleUrls: ['./market-place-bet-views.component.scss'],
  imports: [CommonModule, SharedModule]
})
export class MarketPlaceBetViewsComponent implements OnInit, AfterViewInit, OnChanges, OnDestroy {
  @Input() bet: Stake;
  rate: number;
  stake: number;
  panelProfitLoss: string;
  currentMarketVolumn: MarketRates[];
  betDetails: MarketRunner[];
  chips: any[];
  clientBets: MarketBet[];
  hideAdjustedRate = true;
  lblProfitLoss: any;
  isPlaceBetAllowed = false;
  deviceInfo = '';
  placeFrom = 0;
  isShowBetSlipBelowRunner: boolean;
  cuuRate: number;
  currentMarketVol: MarketRates;
  isDarkTheme: boolean = false;
  isdisplayRateControl: boolean = true;
  rateLimit: number = 0;
  ratePoint: number = 0;
  upperLimit: number = 0;
  lowerLimit: number = 0;
  isCheckAcceptAnyOdds: boolean = false;
  isPlaceBet: boolean = false;
  betslipSliderMaxVal: any;
  originalChips: any[];
  isWager: boolean = false;
  isB2C: boolean;
  userProfile: any;
  allInBal: any;
  @ViewChild('betslipSlider2', { static: false }) betslipSlider2: SwiperComponent;
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
    this.subscribeStore();
    this.cuuRate = JSON.parse(JSON.stringify(this.bet.rate));
    this.displayRateControl();
    this.getRateLimit();
    this.deviceInfo = 'browser=' + this.deviceInfoService.getDeviceInfo().browser
    + ':: device=' + this.getDevice() + ':: os=' + this.deviceInfoService.getDeviceInfo().os
    + ':: latitude=0 :: longitude=0';
    this.oneClickBet();
  }
  ngOnChanges(changes: SimpleChanges) {
    if (changes && changes.bet && changes.bet.previousValue) {
      this.cuuRate = JSON.parse(JSON.stringify(this.bet.rate));
      this.clearStake();
      this.displayRateControl();
      this.getRateLimit();
      this.isCheckAcceptAnyOdds = this.commonService.isCheckAcceptAnyOdds;
      this.isWager = websiteSettings.data.appIsRealBalanceUse;
      this.isB2C = websiteSettings.data.isB2C;
      this.subscribeStore();
      this.oneClickBet();
    }
  }
  ngAfterViewInit(): void {
  }
  oneClickBet() {
    if(websiteSettings.data.isShowOneClickBet) {
      const isCheckedOneClickBet = this.commonService.getCookieValue('isCheckedOneClickBet');
      if ((isCheckedOneClickBet !== null && isCheckedOneClickBet != undefined && isCheckedOneClickBet != '')) {
        if(JSON.parse(isCheckedOneClickBet).isCheckedOneClickBet){
        const oneClickSelectedStake = this.commonService.getCookieValue('oneClickSelectedStake');
        if (oneClickSelectedStake != null &&
            oneClickSelectedStake != undefined && oneClickSelectedStake != '' && JSON.parse(oneClickSelectedStake)) {
          const selectedStakeValue = JSON.parse(oneClickSelectedStake);
          this.stake = selectedStakeValue ? +selectedStakeValue : 0;
          this.onEnter(); 
        } else {
          this.toastr.error('Please select one click stake value again.',"Notification",{
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
  subscribeStore() {
    this.currentMarketVolumn =Object.assign([],this.marketRateService.curMarketsVol);
    this.currentMarketVol = Object.assign([], this.currentMarketVolumn.find(x => x.mid == this.bet.betId));
    this.betDetails = Object.assign([],this.marketRateService.curMarketsRunners);
    this.chips = JSON.parse(JSON.stringify(this.commonService.chipList));
    this.originalChips = JSON.parse(JSON.stringify(this.chips));
    const maxappChips = Math.max.apply(Math, this.chips.map(function(o) { return o.appChips; }));
    if (this.currentMarketVol.mxs === -1) {
      this.betslipSliderMaxVal = maxappChips;
    } else {
      this.betslipSliderMaxVal = this.currentMarketVol.mxs;
    }
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
    this.allInBal = this.commonService.accountbalance;
    this.betService.checkBalanceAndWallet$().pipe(
      switchMap((resp) => {
        return of(resp);
      }
      )
    ).subscribe(value => {
      this.commonService.accountbalance = value.clientBalance.balance;
      this.allInBal = this.commonService.accountbalance;
    });
   
  }
  getRateLimit() {
    if (this.currentMarketVol && this.currentMarketVol.mur !== 0) {
      let rate = JSON.parse(JSON.stringify(this.bet.rate));
        if (!this.bet.rate) {
          rate = 0;
        }
      this.ratePoint = this.getPoint(rate);
      if (this.bet.marketType == FanceType.Market) {
        this.rateLimit = this.ratePoint * this.currentMarketVol.mur;
      } else {
        this.rateLimit = JSON.parse(JSON.stringify(this.currentMarketVol.mur));
      }
      this.upperLimit = +parseFloat(rate + this.rateLimit).toFixed(2);
      this.lowerLimit = +(rate - this.rateLimit).toFixed(2);
    } else {
      this.isdisplayRateControl = true;
    }
  }
  overrideUpDownAndDecimalKey(event: KeyboardEvent, rateStakeType: string) {
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
          if (rateStakeType === 'Rate') {
            this.UpdateRate(this.bet.betDetailId, this.bet.betId, true, true);
          } else {
            this.updateStake(this.bet.betDetailId, this.bet.betId, true, true);
          }

          event.preventDefault();
          return false;
        } else if (keynum === 40) {
          if (rateStakeType === 'Rate') {
            this.UpdateRate(this.bet.betDetailId, this.bet.betId, true, false);
          } else {
            this.updateStake(this.bet.betDetailId, this.bet.betId, true, false);
          }
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
        if (this.bet.rate && this.stake) {
          if (rateStakeType === 'Rate') {
            this.onRateChange(this.bet.betDetailId, this.bet.betId, 0, true);
          } else {
            this.onStakeChange(this.bet.betDetailId, this.bet.betId, 0, true);
          }
        }
        event.preventDefault(); return false;
      }
      return true;
    } catch (ex) {
      console.log('error:=' + ex);
    }
    return true;
  }
  onRateChange(betDetailId, betId, validateValue, isMarketBet) {
    try {
      if (this.isdisplayRateControl) {
        this.bet.rate = JSON.parse(JSON.stringify(this.cuuRate));
        return false
      };
      this.isPlaceBetAllowed = true;
      const elementValue = this.bet.rate;
      let value = (!elementValue) ? 0 : elementValue;

      if (validateValue) {
        const marketVolumn = Object.assign([], this.currentMarketVolumn.find(x => x.mid == this.bet.betId));
        if (marketVolumn !== undefined && marketVolumn !== null) {
          const minBetRate = marketVolumn.mmr;
          const maxBetRate = marketVolumn.mxr;
          if ((value < minBetRate || value < this.lowerLimit) || (value > maxBetRate || value > this.upperLimit)) {
            if (value < minBetRate || value < this.lowerLimit) {
              if (value < this.lowerLimit) {
                value = this.lowerLimit;
              } else {
                value = minBetRate;
              }
              this.marketRateService.setAudioType().next(AudioType.error);
              this.toastr.error(`The minimum odds are ${value}. Your odds have been updated accordingly.`,"Notification",{
                toastClass: "custom-toast-error"
              });
              this.isPlaceBetAllowed = false;
              this.isPlaceBet = false;
            } else if (value > maxBetRate || value > this.upperLimit) {
              if (value > this.upperLimit) {
                value = this.upperLimit;
              } else {
                value = maxBetRate;
              }
              this.marketRateService.setAudioType().next(AudioType.error);
              // tslint:disable-next-line:max-line-length
              this.toastr.error(`The maximum odds are ${value}. Your odds have been updated accordingly.`,"Notification",{
                toastClass: "custom-toast-error"
              });
              this.isPlaceBetAllowed = false;
              this.isPlaceBet = false;
            }
          } else if (value > minBetRate && value < maxBetRate) {
            const obj: any = this.findAdjustedValue(value);
            const adjustedValue = obj.value;
            if (parseFloat(adjustedValue) !== value) {
              value = adjustedValue;
              this.marketRateService.setAudioType().next(AudioType.error);
              // tslint:disable-next-line:max-line-length
              this.toastr.error(`Odds between ' ${obj.minVal.toString()} and ${obj.maxVal.toString()}' must be in increments of  ${obj.diffPoint.toString()}. Your odds have been updated accordingly.`,"Notification",{
                toastClass: "custom-toast-error"
              });
              this.isPlaceBetAllowed = false;
              this.isPlaceBet = false;
            }
          }
          this.bet.rate = value;
        } else {
          return false;
        }
      }
      if (isMarketBet === true) {
        this.calculateProfitLoss(betDetailId, betId);
      }
    } catch (ex) {
      console.log('error:=' + ex);
    }
  }
  onStakeChange(betDetailID, betID, validateValue, isMarketBet) {
    try {

      let error = false;
      this.isPlaceBetAllowed = true;
      let value = (!this.stake) ? 0 : this.stake;
      const marketVolumn =Object.assign([], this.currentMarketVolumn.find(x => x.mid == this.bet.betId));
      if (marketVolumn !== undefined && marketVolumn !== null) {
        const minStackValue = marketVolumn.mms;
        const maxStackValue = marketVolumn.mxs;

        if (validateValue && value < minStackValue) {
          value = minStackValue;
          this.marketRateService.setAudioType().next(AudioType.error);
          this.toastr.error(`The stake(s) you have entered are below the minimum ${minStackValue}.`,"Notification",{
            toastClass: "custom-toast-error"
          });
          this.stake = value;
          error = true;
          this.isPlaceBet = false;
        }
        if (validateValue && maxStackValue !== -1) {
          if (validateValue && value > maxStackValue) {
            value = maxStackValue;
            this.marketRateService.setAudioType().next(AudioType.error);
            this.toastr.error(`The stake(s) you have entered are above the maximum ${maxStackValue}.`,"Notification",{
              toastClass: "custom-toast-error"
            });
            this.stake = value;
            error = true;
            this.isPlaceBet = false;
          }
        }
        if (!this.stake) {
          this.clearStake();
        }
        if (isMarketBet) {
          this.calculateProfitLoss(betDetailID, betID);
        }
      } else {
        this.toastr.error('System Expection, Stake Changes',"Notification",{
          toastClass: "custom-toast-error"
        });
        this.isPlaceBetAllowed = false;
        this.isPlaceBet = false;
        error = true;
      }
      return error ? false : true;
    } catch (ex) {
      console.log('error:=' + ex);
      return false;
    }
  }

  // button Rate Increamenet event
  UpdateRate(betDetailId, betId, isMarketBet, isIncrement) {
    try {
      if (this.isdisplayRateControl) return false;
      const marketVolumn = Object.assign([], this.currentMarketVolumn.find(x => x.mid == this.bet.betId));
      // if (marketVolumn.mt === FanceType.ManualOdds || marketVolumn.mt === FanceType.Virtual) return true; // return when manual odds.
      this.hideAdjustedRate = false;
      let value = this.bet.rate;

      if (!this.bet.rate) {
        value = 0;
      }

      if (marketVolumn !== undefined && marketVolumn != null) {
        const iMinBetRate = marketVolumn.mmr;
        const iMaxBetRate = marketVolumn.mxr;
        if (marketVolumn.mt === FanceType.Market || marketVolumn.mt === FanceType.ManualOdds || marketVolumn.mt === FanceType.Virtual) {
          this.bet.rate = this.calculateRate(value, isIncrement, iMinBetRate, iMaxBetRate);
        } else if (marketVolumn.mt === FanceType.Bookmakers) {
          this.bet.rate = this.calculateBookMakerRate(value, isIncrement, iMinBetRate, iMaxBetRate);
        }
        if (isMarketBet) { this.calculateProfitLoss(betDetailId, betId); }
      } else {
        this.toastr.error('Rate increment',"Notification",{
          toastClass: "custom-toast-error"
        });
      }
    } catch (ex) {
      console.log('error:=' + ex);
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
              this.toastr.error(`The stake(s) you have entered are above the maximum ${maxStackValue} .`,"Notification",{
                toastClass: "custom-toast-error"
              });
            }
          }
        } else {
          if (finalValue < minStackValue) {
            finalValue = minStackValue;
            this.marketRateService.setAudioType().next(AudioType.error);
            this.toastr.error(`The stake(s) you have entered are below the minimum ${minStackValue} .`,"Notification",{
              toastClass: "custom-toast-error"
            });
          }
        }
        this.stake = finalValue
        if (isMarketBet) { this.calculateProfitLoss(betDetailID, betID); }
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
            this.toastr.error(`The stake(s) you have entered are below the minimum ${minStackValue} .`,"Notification",{
              toastClass: "custom-toast-error"
            });
            this.stake = value;
          }
          if (maxStackValue !== -1) {
            if (value > maxStackValue) {
              value = maxStackValue;
              this.marketRateService.setAudioType().next(AudioType.error);
              this.toastr.error(`The stake(s) you have entered are above the maximum ${maxStackValue} .`,"Notification",{
                toastClass: "custom-toast-error"
              });
              this.stake = value;
            }
          }
        } else {
          this.toastr.error('Stake Changes',"Notification",{
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
      if (!this.bet.rate || !this.stake || isNaN(this.bet.rate) || isNaN(this.stake)) {
        this.isPlaceBet = false;
        this.marketRateService.setAudioType().next(AudioType.error);
        this.toastr.error(`Please enter rate or stake value.`,"Notification",{
          toastClass: "custom-toast-error"
        });
        this.betService.setOvelayStatus().next(false);
        this.isPlaceBetAllowed = false;
        return false;
      }
      if (!this.isPlaceBetAllowed) { this.isPlaceBet = false; return false; }

      this.betService.setOvelayStatus().next(true);
      const placeBet = new PlaceBet();
      placeBet.betId = betID;
      placeBet.betDetailId = betDetailID;
      placeBet.isBack = this.bet.isBack;
      placeBet.rate = this.bet.rate;
      placeBet.stake = this.stake;
      placeBet.fancyType = this.bet.marketType;
      placeBet.point = this.bet.point;
      placeBet.placeFrom = this.placeFrom;
      placeBet.deviceinfo = this.deviceInfo;
      placeBet.isJodiRates = this.bet.isJodiRates;
      placeBet.isWager = websiteSettings.data.appIsAutowagerPlacebet ? false : !this.isWager;
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
            this.isPlaceBet = true;
            this.marketRateService.setAudioType().next(AudioType.placeBet);
            this.toastr.success(result[1],"Notification",{
              toastClass: "custom-toast-success"
            });
            const _currentSet ={
              'event': 'place_bet',
              'phone': '+' + userProfileInfo.data.appMobileNo,
              'Value': this.stake,
              'Sport_type' :  this.currentMarketVol.sn,
              'Markettype':'sport'
              };
              this.dataLayerService.pingHome(_currentSet);
            setTimeout(() => {
              this.betService.setBetPlacedStatus().next(false);
              this.betService.setBetStatus(false);
              this.betService.setStake().next(this.bet);
            }, 2000);
              this.getMarketBets();
              this.betService.setSelectedRunner().next();
                 
          } else {
            this.isPlaceBet = false;
            this.marketRateService.setAudioType().next(AudioType.error);
            this.toastr.error(result[1],"Notification",{
              toastClass: "custom-toast-error"
            });
            this.betService.setOvelayStatus().next(false);
            this.betService.setBetStatus(false);
          }
        } else {
          this.isPlaceBet = false;
          this.marketRateService.setAudioType().next(AudioType.error);
          this.betService.setBetStatus(false);
        }
        this.isPlaceBet = false;
        this.betService.setBetStatus(false);
        this.betService.setOvelayStatus().next(false);
        this.betService.getBalance();
      }, (error) => {
        this.isPlaceBet = false;
        console.log('place bet error', error);
        this.betService.setOvelayStatus().next(false);
        this.betService.setBetStatus(false);
        this.betService.setStake().next(this.bet);
        this.toastr.error(error.status + error.statusText, 'Please Once Confirm Your Last Market BetList After Placing New Bet.',{
          toastClass: "custom-toast-error"
        });
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
    this.resetProfitLoss();
  }

  clearStake() {
    this.stake = null;
    this.lblProfitLoss = '';
    this.isPlaceBetAllowed = false;
    this.isPlaceBet = false;
    this.resetProfitLoss();
  }
  onMinClick(){
    const marketVolumn = Object.assign([], this.currentMarketVolumn.find(x => x.mid == this.bet.betId));
    if (marketVolumn !== undefined && marketVolumn != null) {
      this.stake = marketVolumn.mms;
      this.calculateProfitLoss(this.bet.betDetailId, this.bet.betId);
    }
  }
  onMaxClick(){
    const marketVolumn = Object.assign([], this.currentMarketVolumn.find(x => x.mid == this.bet.betId));
    if (marketVolumn !== undefined && marketVolumn != null) {
      this.stake =  marketVolumn.mxs;
      this.calculateProfitLoss(this.bet.betDetailId, this.bet.betId);
    }
  }
  onAllInClick(){
    this.setStake(this.allInBal,true);
  }
  onEnter() {
    let value = (!this.stake) ? 0 : this.stake;
    if (value > 0) {
      if (this.onStakeChange(this.bet.betDetailId, this.bet.betId, true, true)) {
        this.placeBet(this.bet.betDetailId, this.bet.betId);
      }
    } else {
      this.marketRateService.setAudioType().next(AudioType.error);
      this.toastr.error(`please enter bet amount.`,"Notification",{
        toastClass: "custom-toast-error"
      });
    }
  }

  displayRateControl() {
    this.currentMarketVolumn = Object.assign([],this.marketRateService.curMarketsVol);
    this.currentMarketVol = Object.assign([], this.currentMarketVolumn.find(x => x.mid == this.bet.betId));
    if (this.currentMarketVol &&  this.currentMarketVol.mur !== 0) {  // this.currentMarketVol.au &&
      if (this.bet.isBack && this.currentMarketVol.mbr) {
        this.isdisplayRateControl = false;  // show +/- button
      } else if (!this.bet.isBack && this.currentMarketVol.mlr) {
        this.isdisplayRateControl = false; // show +/- button
      } else {
        this.isdisplayRateControl = true; // hide +/- button
      }
    } else {
      this.isdisplayRateControl = true; // hide +/- button
    }

  }
  // Calculate Rate and return right value
  private calculateRate(rate, isIncrement, iminBetRate, imaxBetRate) {
    let finalRate = 0;
    try {
      if (isIncrement) {
        finalRate = +parseFloat(rate + this.ratePoint).toFixed(2);
      } else {
        finalRate = +(rate - this.ratePoint).toFixed(2);
      }
      if (finalRate <= this.lowerLimit) { finalRate = this.lowerLimit; } else if (finalRate >= this.upperLimit) { finalRate = this.upperLimit; }
      if (finalRate <= iminBetRate) { finalRate = iminBetRate; } else if (finalRate >= imaxBetRate) { finalRate = imaxBetRate; }
    } catch (ex) {
      console.log('error:=' + ex);
    }
    return finalRate;
  }
  private getPoint(strRate) {
    let vPoint = 0.01;
    if (strRate >= 0 && strRate < 2) {
      vPoint = 0.01;
    } else if (strRate >= 2 && strRate < 3) {
      vPoint = 0.02;
    } else if (strRate >= 3 && strRate < 4) {
      vPoint = 0.05;
    } else if (strRate >= 4 && strRate < 6) {
      vPoint = 0.1;
    } else if (strRate >= 6 && strRate < 10) {
      vPoint = 0.2;
    } else if (strRate >= 10 && strRate < 20) {
      vPoint = 0.5;
    } else if (strRate >= 20 && strRate < 30) {
      vPoint = 1;
    } else if (strRate >= 30 && strRate < 50) {
      vPoint = 2;
    } else if (strRate >= 50 && strRate < 100) {
      vPoint = 5;
    } else if (strRate >= 100) {
      vPoint = 10;
    }
    return vPoint;
  }
  // Calculate BookMaker Rate and return right value
  private calculateBookMakerRate(rate, isIncrement, iminBetRate, imaxBetRate) {
    let finalRate = 0;
    try {
      if (isIncrement) {
        finalRate = +parseFloat(rate + this.ratePoint).toFixed(2);
      } else {
        finalRate = +(rate - this.ratePoint).toFixed(2);
      }
      if (finalRate <= this.lowerLimit) { finalRate = this.lowerLimit; } else if (finalRate >= this.upperLimit) { finalRate = this.upperLimit; }
      if (finalRate <= iminBetRate) { finalRate = iminBetRate; } else if (finalRate >= imaxBetRate) { finalRate = imaxBetRate; }
    } catch (ex) {
      console.log('error:=' + ex);
    }
    return finalRate;
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

      let betDetails;
      try {
        if(this.currentMarketVol.mt == FanceType.Sportbook){
          betDetails = this.betDetails.filter(value => value.mid === this.bet.betId && value.rid == betDetailId);
        } else {
          betDetails = this.betDetails.filter(value => value.mid === this.bet.betId);
        }
      } catch (err) {
        betDetails = null;
      }

      if (!this.bet.rate || !this.stake || isNaN(this.bet.rate) || isNaN(this.stake)) {
        this.resetProfitLoss();
        return false;
      }
      if (!this.betDetails || this.betDetails.length <= 0) { return false; }

      let calculated = 0;
      if (marketVolumn.mt === FanceType.Market || marketVolumn.mt === FanceType.ManualOdds || marketVolumn.mt === FanceType.Virtual || marketVolumn.mt === FanceType.Sportbook) {
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

      // Chetan: if you dont want left Market Box PL update please uncomment it
      // return false;
      if (marketVolumn.mt !== FanceType.Market
        && marketVolumn.mt !== FanceType.Bookmakers
        && marketVolumn.mt !== FanceType.ManualOdds && marketVolumn.mt !== FanceType.Virtual
        && marketVolumn.mt !== FanceType.Sportbook) { return false; }
      const calculatedEstimatedProfitLoss: EstimatedProfitLoss[] = [];
      betDetails.map((bet: MarketRunner) => {
        const currentBet = { betId: this.bet.betId, betName: bet.mn }
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
        estimatedProfitLoss.liability = this.stake;
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
      let clientsBets: any = [];
      if (this.betDetails != null && this.betDetails !== undefined && this.betDetails.length > 0) {
        if(this.currentMarketVol.mt == FanceType.Sportbook){
          clientsBets = this.betDetails.filter(value => value.mid === this.bet.betId && value.rid == this.bet.betDetailId);
        } else {
          clientsBets = this.betDetails.filter(value => value.mid === this.bet.betId);
        }
      }
      if (clientsBets.length > 0) {
        const calculatedEstimatedProfitLoss: EstimatedProfitLoss[] = [];
        clientsBets.map((bet: MarketRunner) => {
          const currentBet = { betId: this.bet.betId, betName: bet.mn };
          const currentProfitLoss = getmarketProfitLoss(this.clientBets, bet.rid, currentBet);
          this.panelProfitLoss = '';
          const estimatedProfitLoss = new EstimatedProfitLoss();
          estimatedProfitLoss.betId = bet.mid;
          estimatedProfitLoss.betDetailId = bet.rid;
          estimatedProfitLoss.estimatedProfitLoss = currentProfitLoss;
          calculatedEstimatedProfitLoss.push(estimatedProfitLoss);
        });
        if(this.currentMarketVol.mt == FanceType.Sportbook){
          this.betService.sendEstimatedProfitLoss().next([]);
        } else {
          this.betService.sendEstimatedProfitLoss().next(calculatedEstimatedProfitLoss);
        }
      }

    } catch (ex) {
      console.log('error:=' + ex);
    }
  }

  private findAdjustedValue(rate) {
    let point = 0.01;
    let retObj = { diffPoint: 0, minVal: 0, maxVal: 0 };
    if (rate >= 0 && rate < 2) {
      point = 0.01;
      retObj = { diffPoint: 0.01, minVal: 0, maxVal: 2 };
    } else if (rate >= 2 && rate < 3) {
      point = 0.02;
      retObj = { diffPoint: 0.02, minVal: 2, maxVal: 3 };
    } else if (rate >= 3 && rate < 4) {
      point = 0.05;
      retObj = { diffPoint: 0.05, minVal: 3, maxVal: 4 };
    } else if (rate >= 4 && rate < 6) {
      point = 0.1;
      retObj = { diffPoint: 0.1, minVal: 4, maxVal: 6 };
    } else if (rate >= 6 && rate < 10) {
      point = 0.2;
      retObj = { diffPoint: 0.2, minVal: 6, maxVal: 10 };
    } else if (rate >= 10 && rate < 20) {
      point = 0.5;
      retObj = { diffPoint: 0.5, minVal: 10, maxVal: 20 };
    } else if (rate >= 20 && rate < 30) {
      point = 1;
      retObj = { diffPoint: 1, minVal: 20, maxVal: 30 };
    } else if (rate >= 30 && rate < 50) {
      point = 2;
      retObj = { diffPoint: 2, minVal: 30, maxVal: 50 };
    } else if (rate >= 50 && rate < 100) {
      point = 5;
      retObj = { diffPoint: 5, minVal: 50, maxVal: 100 };
    } else if (rate >= 100) {
      point = 10;
      retObj = { diffPoint: 10, minVal: 100, maxVal: 1000 };
    }
    let strResponse = parseFloat(rate);
    const strMode = (strResponse % point).toFixed(2);
    if (+strMode !== 0) {
      const strtemp = strResponse - +strMode;
      const ifinalRate = (strtemp + point).toFixed(2);
      strResponse = +ifinalRate;
    }
    retObj['value'] = strResponse;
    return retObj;
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
  //   if(this.isShowBetSlipBelowRunner){
  //   $("#betslip-slider").roundSlider('setValue', 0); 
  //   $("#betslip-slider").roundSlider("refreshTooltip");
  // }
  }
  onOneClick() {
    this.commonService.setQuickBetStatus(true);
      // this.oneclickRef.openPopup();
  }
  onChangeAcceptAnyOdd(isChecked: boolean) {
    this.betService.setAcceptAnyOddtRequest(isChecked).pipe(untilDestroyed(this), catchError(err => throwError(err))).subscribe(data => {
      if (data && data.result) {
        this.toastr.success(data.result.message,"Notification",{
          toastClass: "custom-toast-success"
        });
        this.getAcceptAnyOdd();
      }
    }, err => console.log('setAcceptAnyOddtRequest', err));
  }
  getAcceptAnyOdd() {
    this.betService.getAcceptAnyOddtRequest().pipe(untilDestroyed(this), catchError(err => throwError(err))).subscribe(data => {
      if (data) {
        this.isCheckAcceptAnyOdds = data.appIsAcceptAnyOdds;
        this.commonService.isCheckAcceptAnyOdds = data.appIsAcceptAnyOdds;
      }
      
    }, err => console.log('getAcceptAnyOddtRequest', err));
  }
  ngOnDestroy() {
   }

}
