import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { Stake } from '@clientApp-core/models/bet/stake.model';
import { BetFacadeService } from '@clientApp-core/services/bet/bet.facade.service';
import { untilDestroyed } from 'ngx-take-until-destroy';
declare var $: any;
import * as M from "materialize-css/dist/js/materialize";
import { CommonService } from '@clientApp-core/services/common/common.service';
import { apiEndPointData } from '@clientApp-core/services/config/connfig.service';
import { AuthFacadeService, websiteSettings } from '@clientApp-core/services/authentication/authentication-facade.service';
import { MarketRates } from '@clientApp-core/models/market/market-rates.model';
import { MarketRateFacadeService } from '@clientApp-core/services/market/market-rates/market-rate-facade.service';
import { EstimatedProfitLoss } from '@clientApp-core/models/bet/estimated-profit-loss.model';
import { NavigationEnd, Router } from '@angular/router';
import { UntypedFormGroup } from '@angular/forms';
import { DeviceInfoService } from '@clientApp-core/services/device-info/deviceinfo.services';
import { ToastrService } from 'ngx-toastr';
import { catchError, takeUntil } from 'rxjs/operators';
import { Subject, throwError } from 'rxjs';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@clientApp-shared/shared.module';
import { MarketPlaceBetViewsComponent } from '../place-bet-views/market-place-bet-views/market-place-bet-views.component';
import { SessionPlaceBetViewsComponent } from '../place-bet-views/session-place-bet-views/session-place-bet-views.component';
@Component({
  standalone: true,
  selector: 'app-bet-panel-layout',
  templateUrl: './bet-panel-layout.component.html',
  styleUrls: ['./bet-panel-layout.component.scss'],
  imports:[CommonModule, SharedModule, MarketPlaceBetViewsComponent,SessionPlaceBetViewsComponent]
})
export class BetPanelLayoutComponent implements OnInit, AfterViewInit, OnDestroy {
  isOpenBottomBetSlip: boolean = false;
  isOpenQuickBet: boolean = false;
  isDetailBetSlip: boolean = false;
  bet: Stake;
  togglePanelView: boolean;
  lastSelectedItem: string;
  displayOverlay: boolean;
  modalInstances: any;
  loaderPath: any;
  isShowPlaceBetCounter: boolean = false;
  currentMarketVolumn: Partial<MarketRates>;
  user: any;
  oneClickInstances: any;
  oneClickStakeData = [];
  selectedIndex = 0;
  stakeSettingForm: UntypedFormGroup;
  isEditStakeValue: boolean = false;
  selectedStakeValue: string;
  isCheckedOneClickBet: boolean = false;
  isEditOneClick: boolean = false;
  isShowBetSlipBelowRunner: boolean;
  isBetPlacedSuccessfully:boolean = false;
  notifier = new Subject();
  @ViewChild('betpanelModal', { static: true }) template: ElementRef;
  constructor(private betService: BetFacadeService,private router: Router, public commonService: CommonService,private authService: AuthFacadeService,
    private marketRateService: MarketRateFacadeService, public deviceInfoService: DeviceInfoService,private toastr: ToastrService) {
    this.betService.getStake$().pipe(takeUntil(this.notifier),untilDestroyed(this)).subscribe(bet => {
      if (this.bet && this.bet.betDetailId === bet.betDetailId &&
        this.lastSelectedItem === bet.currentSelectedItem) {
        this.togglePanelView = !this.togglePanelView;
        this.bet = bet;
        this.resetBookValue();
        this.openModal();
      } else if (this.bet && bet.betId === this.bet.betId && bet.closeMe) {
        this.togglePanelView = false;
        this.resetBookValue();
        this.openModal();
      } else if (!bet.closeMe) {
        this.bet = bet;
        this.lastSelectedItem = bet.currentSelectedItem;
        this.togglePanelView = true;
        this.resetBookValue();
        this.openModal();
      } else if (bet.betId === undefined && bet.closeMe) {
        this.togglePanelView = false;
        this.resetBookValue();
        this.openModal();
      }
      
    });
    this.betService.getOvelayStatus$().pipe(takeUntil(this.notifier),untilDestroyed(this)).subscribe(display => {
      this.displayOverlay = display;
    });
    this.betService.getBetPlacedStatus$().pipe(takeUntil(this.notifier),untilDestroyed(this)).subscribe(display => {
      this.isBetPlacedSuccessfully = display;
    });
    this.router.events.subscribe(val => {
      if (
        val instanceof NavigationEnd) {
          if (val.urlAfterRedirects.indexOf('/event') !== 0) {
            if (this.isDetailBetSlip && this.isOpenBottomBetSlip) {
              this.cancelBet();
            }
          }
      }
  });
  this.commonService.getQuickBetStatus().subscribe(isChecked => {
    if (isChecked) {
      this.isOpenQuickBet = true;
      this.isOpenBottomBetSlip = false;
      this.cancelBet();
    } else {
      this.isOpenQuickBet = false;
    }
  });
  this.commonService.getOneClickBetStatus().subscribe(isChecked => {
    this.isCheckedOneClickBet = isChecked;
  });
   }
   ngOnInit(): void {
    this.getConfig();
    this.isShowBetSlipBelowRunner = websiteSettings.data.isShowBetSlipBelowRunner;
    this.user = JSON.parse(localStorage.getItem('token'));
    this.loaderPath = apiEndPointData.data.loaderPath;
    this.init();
  }
ngAfterViewInit() {
    this.modalInstances = M.Modal.init(this.template?.nativeElement, {
      dismissible: false
    });
  }
  openModal() {
    // if(this.isShowBetSlipBelowRunner){
    //   if (this.togglePanelView && this.bet) {
    //     this.modalInstances.open();
    //   } else {
    //     this.modalInstances.close();
    //   }
    // } 
    // else { 
      if ($(window).width() < 767) {
        if (this.togglePanelView && this.bet) {
          this.modalInstances.open();
        } else {
          this.modalInstances.close();
        }
      } else {
    if (this.togglePanelView && this.bet) {
        this.isOpenBottomBetSlip = true;
        this.isDetailBetSlip = true;
        this.isOpenQuickBet = false;
      } else {
        this.isDetailBetSlip = false;
        this.isOpenBottomBetSlip = false;
      }
    }
    // }
  }
  toggleBetSlip() {
    this.isOpenBottomBetSlip = !this.isOpenBottomBetSlip;
    if (this.isDetailBetSlip && !this.isOpenBottomBetSlip) {
      this.cancelBet();
    }
  }
  cancelBet() {
    this.isBetPlacedSuccessfully = false;
    this.betService.setStake().next(this.bet);
    this.betService.setSelectedRunner().next();
    this.resetBookValue();
  }
  resetBookValue() {
    const calculatedEstimatedProfitLoss: EstimatedProfitLoss[] = [];
    const estimatedProfitLoss = new EstimatedProfitLoss();
    estimatedProfitLoss.betId = this.bet?.betId;
    estimatedProfitLoss.betDetailId = 0;
    estimatedProfitLoss.estimatedProfitLoss = 0;
    calculatedEstimatedProfitLoss.push(estimatedProfitLoss);
    this.betService.sendEstimatedProfitLoss().next(calculatedEstimatedProfitLoss);
  }
  onChange(isChecked: boolean) {
    if (this.betService.getBetStatus()) {
      return false;
    }
    const isCheckedOneClickBet = !isChecked;
    if (isCheckedOneClickBet) {
      this.isDetailBetSlip = false;
      this.isCheckedOneClickBet = true;
      this.commonService.setCookieValue('isCheckedOneClickBet', JSON.stringify({ isCheckedOneClickBet: true }));
      this.commonService.setOneClickBetStatus(true);
      const oneClickSelectedStake = this.commonService.getCookieValue('oneClickSelectedStake');
      if (oneClickSelectedStake != null && oneClickSelectedStake != undefined && oneClickSelectedStake != '' && JSON.parse(oneClickSelectedStake)) {
        this.selectedStakeValue = JSON.parse(oneClickSelectedStake);
         this.toastr.success(`Quick bet is activated and amount is ${this.selectedStakeValue}`,"Notification",{
          toastClass: "custom-toast-success"
        });
      } else {
        const oneClickStakeValuesData = this.commonService.getCookieValue('oneClickStakeValuesData');
        if (oneClickStakeValuesData != null && oneClickStakeValuesData != undefined && oneClickStakeValuesData != '' && JSON.parse(oneClickStakeValuesData)) {
          this.oneClickStakeData = JSON.parse(oneClickStakeValuesData);
        } else {
          this.oneClickStakeData = apiEndPointData.data.oneClickStakeValue;
        }
         this.toastr.success(`Quick bet is activated and amount is ${this.oneClickStakeData[0]}`,"Notification",{
          toastClass: "custom-toast-success"
        });
        this.commonService.setCookieValue('oneClickSelectedStake', JSON.stringify(+this.oneClickStakeData[0]));
        this.commonService.setOneClickStakeStatus(this.oneClickStakeData[0]);
      }
    } else {
      this.toastr.success(`Quick bet deactivated`,"Notification",{
        toastClass: "custom-toast-success"
      });
      this.isCheckedOneClickBet = false;
      this.isEditStakeValue = false;
      this.isEditOneClick = false;
      this.commonService.setOneClickBetStatus(false);
      this.commonService.setCookieValue('isCheckedOneClickBet', JSON.stringify({ isCheckedOneClickBet: false }));
    }
  }
  setChipValue(stakeValue: string, index: number) {
    if(stakeValue != null && +stakeValue > 0){
      this.selectedIndex = index;
      this.commonService.setCookieValue('oneClickSelectedStake', JSON.stringify(+stakeValue));
      this.toastr.success(`Quick bet is activated and amount is ${stakeValue}`,"Notification",{
        toastClass: "custom-toast-success"
      });
      this.commonService.setOneClickStakeStatus(stakeValue);
      this.selectedStakeValue = stakeValue;
      this.toggleBetSlip();
    }
  }
  init() {
    const oneclickCurrentState = this.commonService.getCookieValue('isCheckedOneClickBet');
    this.isCheckedOneClickBet = (oneclickCurrentState != null && oneclickCurrentState != undefined && oneclickCurrentState != '' && JSON.parse(oneclickCurrentState).isCheckedOneClickBet) ? true : false;
    this.commonService.setOneClickBetStatus(this.isCheckedOneClickBet);
    const oneClickStakeValuesData = this.commonService.getCookieValue('oneClickStakeValuesData');
    if (oneClickStakeValuesData != null && oneClickStakeValuesData != undefined && oneClickStakeValuesData != '' && JSON.parse(oneClickStakeValuesData)) {
      this.oneClickStakeData = JSON.parse(oneClickStakeValuesData);
    } else {
      this.oneClickStakeData = apiEndPointData.data.oneClickStakeValue;
    }
    const oneClickSelectedStake = this.commonService.getCookieValue('oneClickSelectedStake');
    this.selectedStakeValue = oneClickSelectedStake != null && oneClickSelectedStake != undefined && oneClickSelectedStake != '' ? JSON.parse(oneClickSelectedStake) : '';
    if (oneClickSelectedStake != null && oneClickSelectedStake != undefined && oneClickSelectedStake != '' && JSON.parse(oneClickSelectedStake)) {
      const ind = this.oneClickStakeData.findIndex(x => x === JSON.parse(oneClickSelectedStake));
      this.selectedIndex = ind > -1 ? ind : 0;
    } else {
      this.selectedIndex = 0;
      this.commonService.setCookieValue('oneClickSelectedStake', JSON.stringify(+this.oneClickStakeData[0]));
      this.commonService.setOneClickStakeStatus(this.oneClickStakeData[0]);
    }
  }
  onQuickBetClick(){
    this.isOpenQuickBet = true;
    this.isOpenBottomBetSlip = false;
    this.cancelBet();
  }
  getConfig() {
    this.authService.getConfig$()
      .pipe(takeUntil(this.notifier),
        untilDestroyed(this),
        catchError(err => throwError(err))
      ).subscribe(response => {
        if (response) {
          this.isShowBetSlipBelowRunner = websiteSettings.data.isShowBetSlipBelowRunner;
        }
      }, err => console.log('getConfig', err));
  }
  ngOnDestroy() {
    this.isBetPlacedSuccessfully = false;
    this.notifier.next();
    this.notifier.complete();
  }
}
