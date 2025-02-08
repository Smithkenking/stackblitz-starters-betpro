import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, Validators } from '@angular/forms';
import { B2cUserService, userProfileInfo } from '@clientApp-core/services/authentication/b2c-user.service';
import { CommonService } from '@clientApp-core/services/common/common.service';
import { CountryISO, PhoneNumberFormat, SearchCountryField } from 'ngx-intl-tel-input';
import { untilDestroyed } from 'ngx-take-until-destroy';
import { ToastrService } from 'ngx-toastr';
import { throwError } from 'rxjs';
import { catchError, take } from 'rxjs/operators';
import { ChangePasswordComponent } from '../change-password/change-password.component';
import * as M from "materialize-css/dist/js/materialize";
import { apiEndPointData } from '@clientApp-core/services/config/connfig.service';
import * as lib from "google-libphonenumber";
import { BonusService } from '@clientApp-core/services/authentication/bonus.service';
import { CampaignAction } from '@clientApp-core/enums/campaignaction.types';
import { ActivatedRoute, Router } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { websiteSettings } from '@clientApp-core/services/authentication/authentication-facade.service';
const phoneNumberUtil = lib.PhoneNumberUtil.getInstance();

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss']
})
export class UserProfileComponent implements OnInit, AfterViewInit, OnDestroy {
  userProfile: any;
  selectedBonusIndex: number = 0;
  loading: boolean = false;
  isShowOTPBox: boolean = false;
  updateMobilePageInstances: any;
  separateDialCode = false;
  PhoneNumberFormat = PhoneNumberFormat;
  SearchCountryField = SearchCountryField;
  PhonePacleHolder: string = 'Enter mobile number'; //'789XXXXXXX';
  CountryISO = CountryISO;
  preferredCountries: CountryISO[] = [CountryISO.UnitedStates, CountryISO.UnitedKingdom];
  onlyCountries: CountryISO[] = [CountryISO.Pakistan];
  selectedCountryISO = CountryISO.Pakistan;
  numbervalidation: boolean;
  numberrequiredvalidation: boolean;
  isOtpCheck: boolean = false;
  isResendOtp: boolean = false;
  resendOTPLimit: number = 0;
  displayotptimer: any
  interval: any;
  isSendOTP: boolean;
  isValidOTP: boolean = true;
  campaignSubscriptionList: any = [];
  UpdateMobileNoForm = this.fb.group({
    mobileNo: ['', Validators.required],
  });
  showOtpComponent = true;
  otp: string;
  config = {
    allowNumbersOnly: true,
    length: 6,
    isPasswordInput: false,
    disableAutoFocus: false,
    placeholder: '',
    inputStyles: {
      'width': '50px',
      'height': '50px'
    }
  };
  @ViewChild('updateMobilePage', { static: true }) updateMobilePage: ElementRef;
  @ViewChild('changepassword', { static: true }) changepasswordRef: ChangePasswordComponent;
  constructor(private b2cUserService: B2cUserService, private toastr: ToastrService, private router: Router,
    public commonService: CommonService, private fb: UntypedFormBuilder, private bonusService: BonusService, private _decimalPipe: DecimalPipe) {
  }

  ngOnInit(): void {
    this.isSendOTP = apiEndPointData.data.isSendOTP;
    this.userProfile = userProfileInfo.data;
    this.b2cUserService.getUserInfo$().pipe(
      untilDestroyed(this),
      catchError(err => throwError(err))
    ).subscribe(response => {
      if (response.isSuccess) { 
        this.userProfile = response.result.message;
      } else {
        this.toastr.error(response.result.message, "Notification", {
          toastClass: "custom-toast-error"
        });
      }
    }, err => console.log('getUserProfile', err));
    this.getcampaign();
  }
  ngAfterViewInit(): void {
    this.updateMobilePageInstances = M.Modal.init(this.updateMobilePage.nativeElement, { dismissible: false });
  }
  changePswdClick() {
    const token = JSON.parse(localStorage.getItem('token'));
    if (websiteSettings.data.demoLoginUserName != token.clientName) {
      this.changepasswordRef.openPopup();
    } else {
      this.toastr.error('You are not allowed to access this page', "Notification", {
        toastClass: "custom-toast-error"
      });
    }
  }
  referEarnClick() {
    const token = JSON.parse(localStorage.getItem('token'));
    if (websiteSettings.data.demoLoginUserName != token.clientName) {
      this.router.navigateByUrl('/referandearn');
    } else {
      this.toastr.error('You are not allowed to access this page', "Notification", {
        toastClass: "custom-toast-error"
      });
    }
    // this.referEarn.openPopup();
  }
  trackByFun(index, item) {
    return index;
  }
  onNextClick() {
    if (this.selectedBonusIndex >= 0 && this.selectedBonusIndex < this.userProfile.wagerList.length - 1) {
      this.selectedBonusIndex = ++this.selectedBonusIndex;
    }
  }
  onPreviousClick() {
    if (this.selectedBonusIndex > 0) {
      this.selectedBonusIndex = --this.selectedBonusIndex;
    }
  }
  onEditMobileClick() {
    this.numberrequiredvalidation = false;
    this.numbervalidation = false;
    this.isShowOTPBox = false;
    this.UpdateMobileNoForm.reset();
    this.onConfigChange();
    if (this.userProfile.appMobileNo) {
      const appMobileNo = '+' + this.userProfile.appMobileNo;
      const number = phoneNumberUtil.parseAndKeepRawInput(appMobileNo, 'IN');
      this.selectedCountryISO = phoneNumberUtil.getRegionCodeForNumber(number);
      const PNF = lib.PhoneNumberFormat;
      const phone = {
        "number": (number.getNationalNumber()).toString(),
        "internationalNumber": phoneNumberUtil.format(number, PNF.INTERNATIONAL),
        "nationalNumber": phoneNumberUtil.format(number, PNF.NATIONAL),
        "e164Number": phoneNumberUtil.format(number, PNF.E164),
        "countryCode": phoneNumberUtil.getRegionCodeForNumber(number),
        "dialCode": '+' + number.getCountryCode()
      }
      this.UpdateMobileNoForm.controls['mobileNo'].setValue(phone);
    }
    this.updateMobilePageInstances.open();
  }
  UpdateMobile() {
    if (this.UpdateMobileNoForm.valid && this.otp && this.otp.length === 6 && !this.numberrequiredvalidation && !this.numbervalidation) {
      this.loading = true;
      let number = '';
      const mobilectrl = this.UpdateMobileNoForm.value.mobileNo;
      const mobileNo = mobilectrl.dialCode + '' + mobilectrl.number;
      number = mobileNo.replace(/\D/g, '');
      const body = {
        "mobileNo": number,
        "OtpType": "UMN",
        "OTP": this.otp
      }
      this.isValidOTP = true;
      this.b2cUserService.UpdateMobile(body).pipe(catchError(err => throwError(err))).subscribe((reponse: any) => {
        if (reponse.isSuccess) {
          this.toastr.success(reponse.result.message, "Notification", {
            toastClass: "custom-toast-success"
          });
          this.isResendOtp = false;
          this.otptimer(1);
          this.updateMobilePageInstances.close();
        } else {
          this.isResendOtp = true;
          this.otptimer(0);
          this.toastr.error(reponse.result.message, "Notification", {
            toastClass: "custom-toast-error"
          });
        }
        this.loading = false;
      }, err => { this.loading = false; console.log('RegistrationUpdateMobile', err) });
    } else {
      this.loading = false;
      this.isValidOTP = false;
      Object.keys(this.UpdateMobileNoForm.controls).forEach(field => {
        const control = this.UpdateMobileNoForm.get(field);
        control.markAsTouched({ onlySelf: true });
      });
      if ((this.UpdateMobileNoForm.value.mobileNo == "" || this.UpdateMobileNoForm.value.mobileNo == null)) {
        this.numberrequiredvalidation = true;
      } else if (this.UpdateMobileNoForm.controls['mobileNo'].invalid) {
        this.numbervalidation = true;
      }
    }
  }
  onResendOtpClick() {
    if (this.isSendOTP) {
      if (this.UpdateMobileNoForm.valid && this.resendOTPLimit <= apiEndPointData.data.resendOTPLimit) {
        this.resendOTPLimit = ++this.resendOTPLimit;
        this.onConfigChange();
        this.isResendOtp = false;
        let number = '', UserName = '', OtpType = '';
        OtpType = 'CMN';
        const mobilectrl = this.UpdateMobileNoForm.value.mobileNo;
        const mobileNo = mobilectrl.dialCode + '' + mobilectrl.number;
        number = mobileNo.replace(/\D/g, '');
        this.b2cUserService.SendWhatappOTP(number, OtpType, UserName).pipe(catchError(err => throwError(err))).subscribe((reponse: any) => {
          if (reponse.status) {
            this.isShowOTPBox = true;
            this.otptimer(1);
            this.toastr.success(reponse.msg, "Notification", {
              toastClass: "custom-toast-success"
            });
          } else {
            this.otptimer(0);
            this.isResendOtp = true;
            this.toastr.error(reponse.msg, "Notification", {
              toastClass: "custom-toast-error"
            });
          }
        }, err => { this.isResendOtp = true; console.log('SendWhatappOTP', err) });
      }
    } else {
      if (this.UpdateMobileNoForm.valid && !this.numberrequiredvalidation && !this.numbervalidation) {
        this.loading = true;
        this.isShowOTPBox = false;
        let number = '';
        const mobilectrl = this.UpdateMobileNoForm.value.mobileNo;
        const mobileNo = mobilectrl.dialCode + '' + mobilectrl.number;
        number = mobileNo.replace(/\D/g, '');
        const body = {
          "mobileNo": number,
          "OtpType": "UMN",
          "OTP": ''
        }
        this.b2cUserService.UpdateMobile(body).pipe(catchError(err => throwError(err))).subscribe((reponse: any) => {
          if (reponse.isSuccess) {
            this.b2cUserService.getUserProfile();
            this.toastr.success(reponse.result.message, "Notification", {
              toastClass: "custom-toast-success"
            });
            this.updateMobilePageInstances.close();
          } else {
            this.toastr.error(reponse.result.message, "Notification", {
              toastClass: "custom-toast-error"
            });
          }
          this.loading = false;
        }, err => { this.loading = false; console.log('RegistrationUpdateMobile', err) });
      } else {
        this.loading = false;
        Object.keys(this.UpdateMobileNoForm.controls).forEach(field => {
          const control = this.UpdateMobileNoForm.get(field);
          control.markAsTouched({ onlySelf: true });
        });

      }
    }
  }
  otptimer(minute) {
    if (this.interval) {
      this.displayotptimer = null;
      clearInterval(this.interval);
    }
    // let minute = 1;
    let seconds: number = minute * 60;
    let textSec: any = "0";
    let statSec: number = 60;

    const prefix = minute < 10 ? "0" : "";

    this.interval = setInterval(() => {
      seconds--;
      if (statSec != 0) statSec--;
      else statSec = 59;

      if (statSec < 10) {
        textSec = "0" + statSec;
      } else textSec = statSec;

      this.displayotptimer = `${prefix}${Math.floor(seconds / 60)}:${textSec}`;

      if (seconds == 0) {
        this.isResendOtp = true;
        this.displayotptimer = null;
        clearInterval(this.interval);
      }
    }, 1000);
    if (this.isResendOtp) {
      this.displayotptimer = null;
      clearInterval(this.interval);
    }
  }
  mobilekeyup(event: any) {
    if (event.target.value.length == 10) {
      this.numbervalidation = false;
    } else {
      this.numbervalidation = true;
    }
    if (event.target.value != "" && event.target.value != null) {
      this.numberrequiredvalidation = false;
    } else if (event.target.value == "" || event.target.value == null) {
      this.numberrequiredvalidation = true;
    }
  }
  getcampaign() {
    this.bonusService.getCampaignSubscriptionList().pipe(take(1)).subscribe(response => {
      if (response.isSuccess) {
        let campaign = response.result;
        this.campaignSubscriptionList = campaign.filter((item: any) => item.caeid == CampaignAction.RefferUser);
      }
    });
  }
  isEmpty(obj: any) {
    for (var key in obj) {
      if (obj.hasOwnProperty(key))
        return false;
    }
    return true;
  }
  onOtpChange(otp) {
    this.otp = otp;
  }
  onConfigChange() {
    this.showOtpComponent = false;
    this.otp = null;
    setTimeout(() => {
      this.showOtpComponent = true;
    }, 0);
  }
  transformDecimal(num) {
    return this._decimalPipe.transform(num, '1.2-2');
  }
  ngOnDestroy(): void {

  }
}
