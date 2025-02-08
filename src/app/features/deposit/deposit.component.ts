import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, Output, ViewChild, EventEmitter } from '@angular/core';
import { FormBuilder, FormControl, UntypedFormBuilder, UntypedFormControl, Validators } from '@angular/forms';
import { AuthFacadeService, websiteSettings } from '@clientApp-core/services/authentication/authentication-facade.service';
import { B2cUserService, userProfileInfo } from '@clientApp-core/services/authentication/b2c-user.service';
import { BonusService } from '@clientApp-core/services/authentication/bonus.service';
import { CommonService } from '@clientApp-core/services/common/common.service';
import { ToastrService } from 'ngx-toastr';
import * as M from "materialize-css/dist/js/materialize";
import { CountryISO, PhoneNumberFormat, SearchCountryField } from 'ngx-intl-tel-input';
import { catchError, take } from 'rxjs/operators';
import { CampaignAction } from '@clientApp-core/enums/campaignaction.types';
import { throwError } from 'rxjs';
import { ShowDepositButtionOption } from '@clientApp-core/enums/showDepositButtionOption.types';
import { CampaignActionGroup } from '@clientApp-core/enums/CampaignActionGroup.type';
import { untilDestroyed } from 'ngx-take-until-destroy';
import { DeviceInfoService } from '@clientApp-core/services/device-info/deviceinfo.services';
import { ActivatedRoute, Router } from '@angular/router';
import { mapGroupByKey, arrayUniqueByKey } from '@clientApp-core/services/shared/JSfunction.service';
import { apiEndPointData } from '@clientApp-core/services/config/connfig.service';
import { PaymentModeType } from '@clientApp-core/enums/payment-status';
import { DataLayerService } from '@clientApp-core/services/window/DataLayerService.service';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@clientApp-shared/shared.module';
import { CountdownPipe } from '@clientApp-shared/pipes/countdown.pipe';
import { DomSanitizer } from '@angular/platform-browser';
import { alphanumeric_unique } from '@clientApp-core/utilities/app-util';
import { FooterComponent } from "../../shared/components/footer/footer.component";
declare var gtag: any;
declare var $: any;

@Component({
  selector: 'app-deposit',
  standalone: true,
  imports: [CommonModule, SharedModule, CountdownPipe, FooterComponent],
  templateUrl: './deposit.component.html',
  styleUrls: ['./deposit.component.scss']
})
export class DepositComponent implements OnInit, AfterViewInit, OnDestroy {
  @Output() depositStatus = new EventEmitter();
  @ViewChild('OtpVerify', { static: true }) OtpVerify: ElementRef;
  @ViewChild('depositSucess', { static: true })  dstemplate: ElementRef;
  loading = false;
  userInfo: any;
  gotrackierPath: any;
  isB2C: boolean;
  isManualDeposit: boolean;
  isRechargeDeposit: boolean;
  isWhatsappDeposit: boolean = false;
  preferredCountries: CountryISO[] = [CountryISO.UnitedStates, CountryISO.UnitedKingdom];
  onlyCountries: CountryISO[] = [CountryISO.Pakistan];
  CountryISO = CountryISO;
  PhonePacleHolder: string = '789XXXXXXX';
	SearchCountryField = SearchCountryField;
  separateDialCode = false;
  PhoneNumberFormat = PhoneNumberFormat;
  selectedCountryISO = CountryISO.Pakistan;
  numberrequiredvalidation: boolean = false;
  numbervalidation: boolean = false;
  otpVerifyModalInstances: any;
  campaignSubscriptionList: any = [];
  Amountminmax: any = {};
  depositModel = { option: null };
  isRequiredDepositDocumentCtrl: boolean = false;
  documentImg: any;
  isRequiredDocumentCtrl: boolean = false;
  depositdocumentImg: any;
  modalInstances: any;
  RedeemCode: string = '';
  redeemindex: any;
  isdepositminmax: boolean = false;
  firstamount: any;
  dsmodalInstances: any;
  isCheckedDarkTheme: boolean = false;
  imageError: any;
  PaymentModeList = [];
  PaymentAccountDetail = [];
  selectedPaymentAccountDetail = [];
  manualPaymentDetails = [];
  paymentDetailsOption = [];
  isShowPaymentModel: boolean = false;
  selectedPaymentMethod: number = -1;
  selectedPaymentOption: number = 0;
  placeholderText = 'Choose Amount/Enter manually';
  isEmailSendEnable: boolean;
  emailVerificationModalInstances: any;
  isSuccessDeposit: boolean = false;
  CampaignActionList: any = [];
  confirmModalRef;
  couponClicked: boolean = false;
  isShowPaymentPage: boolean = false;
  apiEndPointData = apiEndPointData.data;
  DepositWithWhatsapp : any = null;
  DepositWithTelegram : any = null;
  isDemoLogin : boolean;
  UPIId:string;
  isShowUPIMsg: boolean;
  UpdateMobileEmailForm = this.fb.group({
    emailID: ['',[Validators.required,Validators.pattern("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,4}$")]],
    mobileNo: ['',Validators.required],
  });
  depositForm:any = this.fb.group({
    amount: ['', Validators.required]
  });
  rechargeDepositForm = this.fb.group({
    amount: ['', Validators.required],
    PaymentAPIId: ['', Validators.required]
  });
  manualDepositForm:any = this.fb.group({
    Amount: ['', Validators.required],
    UTRTransactionNo: ['', [Validators.required, Validators.pattern("^[0-9a-zA-Z]+$")]],  // , Validators.required
    Document: ['', Validators.required],
    promoCode:[''],
    paymentId:[''],
  });
  manualQRDepositForm = this.fb.group({
    Amount: [''],
    UTRTransactionNo: [''],  // , Validators.required
    Document: [''],
    promoCode:[''],
    paymentId:[''],
  });
  public myAngularxQrCode: any = null;
  public googlepayurl: any = null;
  public phonepayurl: any = null;
  public paytmurl: any = null;
  public otherurl: any = null;
  isUPIRequestQRCode:boolean;
  uniqueId: string;
  excludeSportsMarket = [];
  isNewsExits: boolean;
  paymentGatewayList: any[]= [];
  bidAmount: any[]= apiEndPointData.data.bidAmount;
  @ViewChild('ConfirmModal', { static: true }) template: ElementRef;
  @ViewChild('emailVerification', { static: true }) emailVerification: ElementRef;
  routeSubscription: any;
  constructor(private toastr: ToastrService, public commonService: CommonService,  private b2cUserService: B2cUserService,private route: ActivatedRoute,public router: Router,private sanitizer: DomSanitizer,
    private fb: FormBuilder, private bonusService: BonusService, private authService:AuthFacadeService,private deviceInfoService : DeviceInfoService) {
      this.commonService.getDarkThemeStatus().subscribe(isChecked => {
        this.checkIsDarkThemeExists(isChecked);
      });
     }

  ngOnInit(): void {
    this.bidAmount = apiEndPointData.data.bidAmount;
    this.apiEndPointData = apiEndPointData.data;
    this.otpVerifyModalInstances = M.Modal.init(this.OtpVerify.nativeElement, { dismissible: false, opacity: 2.7 });
    this.getConfig();
    this.openPopup();
    this.b2cUserService.getUserInfo$().pipe(
      untilDestroyed(this),
      catchError(err => throwError(err))
    ).subscribe(response => {
      if (response.isSuccess) {
        this.openPopup();
      } 
    }, err => console.log('getUserProfile', err));
    const uniqueId = localStorage.getItem('uniqueId');
    if(uniqueId != null){
      this.uniqueId = uniqueId;
    } else {
      this.uniqueId = alphanumeric_unique();
      localStorage.setItem('uniqueId', this.uniqueId);
    }
    
    this.manualQRDepositForm.controls['UTRTransactionNo'].setValue(this.uniqueId);
    this.isNewsExits = this.commonService.isNewsExits;
    this.getNews();
  }
  ngAfterViewInit(): void {
    this.confirmModalRef =  M.Modal.init(this.template.nativeElement, {});
    this.otpVerifyModalInstances = M.Modal.init(this.OtpVerify.nativeElement, { dismissible: false, opacity: 2.7 });
    this.dsmodalInstances = M.Modal.init(this.dstemplate.nativeElement, { dismissible: false });
    this.emailVerificationModalInstances = M.Modal.init(this.emailVerification.nativeElement, { dismissible: false });
    this.scrollEvent();
  }
  scrollEvent() {
    const scroll: any  = document.querySelector(".promo-details");
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
  getConfig() {
    this.authService.getConfig$()
        .pipe(
            untilDestroyed(this),
            take(1),
            catchError(err => throwError(err))
        ).subscribe(response => {
            if (response) {
                this.openPopup();
            }
        }, err => console.log('getConfig', err));
}
getNews() {
  this.authService.getNews$()
      .pipe(
          untilDestroyed(this),
          take(1),
          catchError(err => throwError(err))
      ).subscribe(response => {
          if (response &&  response.length > 0) {
              this.isNewsExits = true;
              this.commonService.isNewsExits = true;
          }
      }, err => console.log('getNews', err));
}
depositSetValue(amount:any){
  this.depositForm.controls['amount'].setValue(+amount);
}
makePaymentRequest() {
    if (this.depositForm.valid) {
      const userInfo = userProfileInfo.data;
      if ((userInfo.appMobileNo !== null && userInfo.appMobileNo !== '') && (userInfo.appEmailID !== null && userInfo.appEmailID !== '')) {
      this.isShowPaymentPage = true;
      if (!this.isRechargeDeposit && this.isManualDeposit) {
        // this.depositModel = { option: 'Manual'};
        this.manualDepositForm.controls['Amount'].setValue(this.depositForm.value.amount);
        if(this.depositForm.value.amount >= this.selectedPaymentAccountDetail[0].appMinAmount && this.depositForm.value.amount <= this.selectedPaymentAccountDetail[0].appMaxAmount){
          this.isdepositminmax = false;
         } else {
          this.isdepositminmax = true;
        }
      } else {
        this.rechargeDepositForm.controls['amount'].setValue(this.depositForm.value.amount);
        if(this.depositForm.value.amount >= this.Amountminmax.dmin && this.depositForm.value.amount <= this.Amountminmax.dmax){
          this.isdepositminmax = false;
         } else {
          this.isdepositminmax = true;
        }
      }
      this.selectedPaymentMethod = 0;
      // this.onPaymentMethodClick(0,this.manualPaymentDetails[0].appPaymentMode);
    } else {
      this.depositModel = { option: null };
      this.loading = false;
      this.UpdateMobileEmailForm.reset();
      if (userInfo.appMobileNo !== null && userInfo.appMobileNo !== undefined && userInfo.appMobileNo !== '') {
        this.UpdateMobileEmailForm.controls["mobileNo"].clearValidators();
        this.UpdateMobileEmailForm.controls['mobileNo'].setValue(userInfo.appMobileNo);
        this.UpdateMobileEmailForm.controls['mobileNo'].disable();
        this.UpdateMobileEmailForm.controls['emailID'].enable();
        this.UpdateMobileEmailForm.get('emailID').setValidators([Validators.required,Validators.pattern("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,4}$")]);
      }
      if (userInfo.emailID !== null && userInfo.emailID !== undefined && userInfo.emailID !== '') {
        this.UpdateMobileEmailForm.controls["emailID"].clearValidators();
        this.UpdateMobileEmailForm.controls['emailID'].setValue(userInfo.appEmailID);
        this.UpdateMobileEmailForm.controls['emailID'].disable();
        this.UpdateMobileEmailForm.controls['mobileNo'].enable();
        this.UpdateMobileEmailForm.get('mobileNo').setValidators(Validators.required);
      }
        this.otpVerifyModalInstances.open();
    }
    } else {
      this.isShowPaymentPage = false;
      Object.keys(this.depositForm.controls).forEach(field => {
        const control = this.depositForm.get(field);
        control.markAsTouched({ onlySelf: true });
      });
    }
}
openPop(){ this.confirmModalRef.open();}
  openPopup() {
    if(websiteSettings.data != undefined && websiteSettings.data != '' && userProfileInfo.data != undefined && userProfileInfo.data != ''){
    this.depositStatus.emit('true');
    this.isManualDeposit = websiteSettings.data.sdbo == ShowDepositButtionOption.Both || websiteSettings.data.sdbo == ShowDepositButtionOption.Manual;
    // this.isRechargeDeposit = websiteSettings.data.sdbo == ShowDepositButtionOption.Both || websiteSettings.data.sdbo == ShowDepositButtionOption.Recharge;
    this.isEmailSendEnable = websiteSettings.data.iese;
    this.userInfo = userProfileInfo.data;
    const userInfo = userProfileInfo.data;
    if ((userInfo.appMobileNo !== null && userInfo.appMobileNo !== '') && (userInfo.appEmailID !== null && userInfo.appEmailID !== '')) {
      const token = JSON.parse(localStorage.getItem('token'))
        if(websiteSettings.data?.demoLoginUserName != token?.clientName){
          this.PaymentGatewayList();
          this.GetDWLimitResults();
          this.RedeemCode = '';
          this.redeemindex = null;
        this.GetCampaignActionList(CampaignActionGroup.Deposit);
        if (this.isManualDeposit) {
          this.GetPaymentModeList();
        }
        } else {
          this.isDemoLogin = true;
          this.isManualDeposit  =true;
          this.isRechargeDeposit = false;
        }
      
      // if (!this.isRechargeDeposit && this.isManualDeposit) {
      //   this.depositModel = { option: 'Manual'};
      // } else {
      //   this.depositModel = { option: 'Recharge' };
      // }
      
      this.documentImg = '';
      this.depositdocumentImg = '';
      this.isRequiredDepositDocumentCtrl = false;
      this.isdepositminmax = false;
      this.isShowPaymentModel = false;
      // this.selectedPaymentMethod = 0;
      // this.modalInstances.open();
    } else {
      this.depositModel = { option: null };
      this.loading = false;
      this.UpdateMobileEmailForm.reset();
      if (userInfo.appMobileNo !== null && userInfo.appMobileNo !== undefined && userInfo.appMobileNo !== '') {
        this.UpdateMobileEmailForm.controls["mobileNo"].clearValidators();
        this.UpdateMobileEmailForm.controls['mobileNo'].setValue(userInfo.appMobileNo);
        this.UpdateMobileEmailForm.controls['mobileNo'].disable();
        this.UpdateMobileEmailForm.controls['emailID'].enable();
        this.UpdateMobileEmailForm.get('emailID').setValidators([Validators.required,Validators.pattern("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,4}$")]);
      }
      if (userInfo.emailID !== null && userInfo.emailID !== undefined && userInfo.emailID !== '') {
        this.UpdateMobileEmailForm.controls["emailID"].clearValidators();
        this.UpdateMobileEmailForm.controls['emailID'].setValue(userInfo.appEmailID);
        this.UpdateMobileEmailForm.controls['emailID'].disable();
        this.UpdateMobileEmailForm.controls['mobileNo'].enable();
        this.UpdateMobileEmailForm.get('mobileNo').setValidators(Validators.required);
      }
      setTimeout(() => {
        this.otpVerifyModalInstances.open();
      }, 500);
      
    }
  }
  }
  close() {
    this.isShowPaymentPage = false;
    if (!this.isRechargeDeposit && this.isManualDeposit) {
      this.depositModel = { option: 'Manual'};
    } else {
      this.depositModel = { option: 'Recharge' };
    }
    this.RedeemCode = '';
    this.redeemindex = null;
    if(this.CampaignActionList && this.CampaignActionList.length >0){
      this.RedeemCode = this.CampaignActionList[0].pc;
      this.redeemindex = 0;
      this.couponClicked = true;
    } else {
      this.couponClicked = false;
    }
    this.documentImg = '';
    this.rechargeDepositForm.reset();
    this.depositForm.reset();
    this.manualDepositForm.reset();
    // this.modalInstances.close();
    this.depositdocumentImg = '';
    this.isRequiredDepositDocumentCtrl = false;
    this.isdepositminmax = false;
    if(this.paymentGatewayList && this.paymentGatewayList.length > 0){
      this.rechargeDepositForm.controls['PaymentAPIId'].setValue(this.paymentGatewayList[0].paymentAPIID);
    } else {
      this.isRechargeDeposit = false;
    }
    // if ((this.apiEndPointData.depositWithWhatsapp && this.apiEndPointData.depositWithWhatsapp.length > 0) ||
    //       (this.apiEndPointData.depositWithTele && this.apiEndPointData.depositWithTele.length > 0)) {
    //       this.isWhatsappDeposit = true;
    //       this.selectedPaymentMethod = -1;
    //     } else {
    //       this.isWhatsappDeposit = false;
    //       this.selectedPaymentMethod = 0;
    //     }
    if (!this.loading) {
      this.depositStatus.emit('false');
    }
  }
  dpotpclose() {
    this.isShowPaymentPage = false;
    this.UpdateMobileEmailForm.reset();
    this.otpVerifyModalInstances.close();
    if (!this.loading) {
      this.depositStatus.emit('false');
    } 
  }
  
  mobilekeyup(event: any){
    if(event.target.value.length == 10){
        this.numbervalidation = false;
          } else {
        this.numbervalidation = true;
      }
      if(event.target.value != "" && event.target.value != null){
        this.numberrequiredvalidation = false; 
      } else if(event.target.value == "" || event.target.value == null){
        this.numberrequiredvalidation = true; 
      }
  }
  onUpdateMobileEmailClick(){
    this.depositStatus.emit('true');
    if (this.UpdateMobileEmailForm.valid && !this.numberrequiredvalidation && !this.numbervalidation && !this.loading) {
      let number = '', email='';
      this.loading = true;
      if (!(this.userInfo.appMobileNo !== null && this.userInfo.appMobileNo !== '')) {
        const mobilectrl:any = this.UpdateMobileEmailForm.value.mobileNo;
        const mobileNo = mobilectrl.dialCode + '' + mobilectrl.number;
        number = mobileNo.replace(/\D/g, '');
      } else {
        email = this.UpdateMobileEmailForm.value.emailID;
      }
      const body = {
        "emailID": email,
        "mobileNo": number,

      }
      this.b2cUserService.updateMobileEmail(body).pipe(catchError(err => throwError(err))).subscribe((reponse) => {
        this.loading = false;
        if (reponse.isSuccess) {
          this.toastr.success(reponse.result.message);
          this.b2cUserService.getUserProfile();
          this.otpVerifyModalInstances.close();
          if (this.isEmailSendEnable) {
            this.emailVerificationModalInstances.open();
          }
        } else {
          this.toastr.error(reponse.result.message);
        }
        this.depositStatus.emit('false');
        this.otpVerifyModalInstances.close();
      }, err => { this.loading = false; this.depositStatus.emit('false'); console.log('updateMobileEmail', err) });
    } else {
      this.loading = false;
      Object.keys(this.UpdateMobileEmailForm.controls).forEach(field => {
        const control = this.UpdateMobileEmailForm.get(field);
        control.markAsTouched({ onlySelf: true });
      });
      if(!(this.userInfo.appMobileNo !== null && this.userInfo.appMobileNo !== '') && (this.UpdateMobileEmailForm.value.mobileNo == "" || this.UpdateMobileEmailForm.value.mobileNo == null)){
        this.numberrequiredvalidation = true; 
        }
    }

  }
  depositecampaign(){
    this.bonusService.getCampaignSubscriptionList().pipe(take(1)).subscribe(response => {
      if (response.isSuccess) {
        let campaign = response.result;
        this.campaignSubscriptionList = campaign.filter((item: any) => item.caeid == CampaignAction.FirstDeposite || item.caeid == CampaignAction.SecondDeposite || item.caeid == CampaignAction.ThirdDeposite);
        this.campaignSubscriptionList = this.campaignSubscriptionList.map((data: any) => {
          return Object.assign({ IsAdded: false }, data);
        });
        this.campaignSubscriptionList[0]['IsAdded'] = true;
        this.RedeemCode = this.campaignSubscriptionList[0]['pc'];
      }
    });
  }
  GetDWLimitResults() {
    this.b2cUserService.GetDWLimitResult().pipe(catchError(err => throwError(err))).subscribe((reponse: any) => {
      if(reponse.message){
      this.Amountminmax = reponse.message;
      }
    }, err => console.log('GetDWLimitResults', err));
  }
  Redeem(item: any, i){
    this.RedeemCode = item.pc;
    this.redeemindex = i;
    this.couponClicked = true;
  }
  handleChange(val: any, index: number) {
    this.campaignSubscriptionList =  this.campaignSubscriptionList.map(obj => {
        return {...obj, IsAdded: false};
    });
    if (!val.IsAdded) {
      this.RedeemCode = val.pc;
      this.campaignSubscriptionList[index]['IsAdded'] = true;
    } else {
      this.RedeemCode = '';
      this.campaignSubscriptionList[index]['IsAdded'] = false;
    }
    this.redeemindex = index;
  }
  onSelectDepositeDocumentFile(event): void {
    this.DepositeDocument(event.target);
  }
  DepositeDocument(inputValue: any): void {
    this.imageError = '';
    if (inputValue.files && inputValue.files[0]) {
      const fsize = inputValue.files[0].size;
      const files = Math.round((fsize / 1024));
      if (fsize > 500000) {
        this.imageError =
          'Maximum size allowed is 500 Kb';
        this.depositdocumentImg = '';
        this.manualDepositForm.controls['Document'].setValue('');
        this.isRequiredDocumentCtrl = false;

      } else {
      
        var file: File = inputValue.files[0];
        var myReader: FileReader = new FileReader();

        myReader.onloadend = (e) => {
          this.depositdocumentImg = myReader.result;
          this.manualDepositForm.controls['Document'].setValue(myReader.result);
        }
        myReader.readAsDataURL(file);
        this.isRequiredDepositDocumentCtrl = false;
      }
    } else {
      this.depositdocumentImg = '';
      this.isRequiredDepositDocumentCtrl = true;
      this.manualDepositForm.controls['Document'].setValue('');
    }
    
  }
  numberOnly(event): boolean {
    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;
  }
  allowAlphaNumericSpace(e) {
    // var code = ('charCode' in e) ? e.charCode : e.keyCode;
    // if (!(code == 32) && // space
    //   !(code > 47 && code < 58) && // numeric (0-9)
    //   !(code > 64 && code < 91) && // upper alpha (A-Z)
    //   !(code > 96 && code < 123)) { // lower alpha (a-z)
    //   e.preventDefault();
    // }
    // e = e || window.event;
    // var charCode = (typeof e.which == "undefined") ? e.keyCode : e.which;
    // var charStr = String.fromCharCode(charCode);
    // if (!charStr.match(/^[A-Z|a-z|0-9]+$/)) {
    //   e.preventDefault();
    // } 
    var regex = new RegExp("^[a-zA-Z0-9 ]+$");
    var str = String.fromCharCode(!e.charCode ? e.which : e.charCode);
    if (regex.test(str)) {
        return true;
    }

    e.preventDefault();
    return false;
  
  }
  omit_special_char(event)
{   
   var k;  
   k = event.charCode;  //         k = event.keyCode;  (Both can be used)
   return((k > 64 && k < 91) || (k > 96 && k < 123) || k == 8 || k == 32 || (k >= 48 && k <= 57)); 
}
  AmountCheck(event: any){
    if (this.depositModel.option === 'Manual') {
    if(event.target.value >= this.selectedPaymentAccountDetail[0].appMinAmount && event.target.value <= this.selectedPaymentAccountDetail[0].appMaxAmount){
      this.isdepositminmax = false;
     } else {
      this.isdepositminmax = true;
    }
  } else {
    if(event.target.value >= this.Amountminmax.dmin && event.target.value <= this.Amountminmax.dmax){
      this.isdepositminmax = false;
     } else {
      this.isdepositminmax = true;
    }
  }
}
  depositRequest() {
    const token = JSON.parse(localStorage.getItem('token'))
    if(!this.loading){
      if(websiteSettings.data.demoLoginUserName != token.clientName){
         this.depositStatus.emit('true');
      if (this.depositModel.option === 'Manual') {
        this.manualDepositRequest();
      } else {
        this.rechargeRequest();
    }
  } else {
    this.toastr.error('You are not allowed to access this page');
  }
    }
  }
  openConfirmModal() {
    if (this.CampaignActionList && this.CampaignActionList.length > 0 && !this.couponClicked) {
      this.confirmModalRef.open(); 
    } else {
      this.depositRequest();
    }
  }
  confirm(): void {
    this.couponClicked = true;
    this.depositRequest();
    this.confirmModalRef.close();
  }
  decline(): void {
    this.confirmModalRef.close();
  }
  rechargeRequest() {
    this.gotrackierPath = null;
    this.isSuccessDeposit = false;
    const user = JSON.parse(localStorage.getItem('token'));
    if(!this.isdepositminmax){
      if (this.rechargeDepositForm.valid && !this.loading) {
        if (this.CampaignActionList && this.CampaignActionList.length > 0 && !this.couponClicked) {
          this.confirmModalRef.open(); 
        } else {
        this.loading = true;
        this.firstamount = this.rechargeDepositForm.value.amount;
        const deposite = {
        "amount": this.rechargeDepositForm.value.amount,
        "promoCode": this.RedeemCode,
        "PaymentAPIId": this.rechargeDepositForm.value.PaymentAPIId
        }
        this.b2cUserService.depositAmount(deposite).pipe(catchError(err => throwError(err))).subscribe((reponse: any) => {
          this.loading = false;
          if (reponse.isSuccess) {
            localStorage.setItem('Amount', this.rechargeDepositForm.value.amount);
            localStorage.setItem('transactionId', reponse.result.transactionId);
            this.isSuccessDeposit = true;
            var open = window.open(reponse.result.message, '_blank');
            if (open == null || typeof (open) == 'undefined') {
                alert("Turn off your pop-up blocker!");
            }
            //  this.router.navigate(['/countdown']); 
            this.close();
            this.dsmodalInstances.open();

          } else {
            this.isSuccessDeposit = false;
            this.toastr.error(reponse.result.message);
          }
          this.depositStatus.emit('false');
        }, err => { this.loading = false; this.isSuccessDeposit = false; this.depositStatus.emit('false');console.log('depositRequest', err)});
      }
      } else {
        this.loading = false;
        this.gotrackierPath = null;
        Object.keys(this.rechargeDepositForm.controls).forEach(field => {
          const control = this.rechargeDepositForm.get(field);
          control.markAsTouched({ onlySelf: true });
        });
      }
      }
  }
  manualDepositRequest() {
    const user = JSON.parse(localStorage.getItem('token'));
    this.manualDepositForm.controls['paymentId'].setValue(this.selectedPaymentAccountDetail[0].appManualPaymentAccountID);
    if (!this.isdepositminmax && !this.loading) {
      if (this.manualDepositForm.valid && !this.loading) {
        if (this.CampaignActionList && this.CampaignActionList.length > 0 && !this.couponClicked) {
          this.confirmModalRef.open(); 
        } else {
        this.loading = true;
        this.isRequiredDepositDocumentCtrl = false;
        this.isSuccessDeposit = false;
        this.manualDepositForm.controls['promoCode'].setValue(this.RedeemCode);
        this.b2cUserService.manualDeposit(this.manualDepositForm.value).pipe(catchError(err => throwError(err))).subscribe((reponse: any) => {
          this.loading = false;
          this.depositStatus.emit('false');
          if (reponse.isSuccess) {
            localStorage.setItem('Amount', this.depositForm.value.amount);
            localStorage.setItem('transactionId', reponse.result.transactionId);
            this.isSuccessDeposit = true;
            this.toastr.success(reponse.result.message);
            //  this.router.navigate(['/countdown']);
            this.close();

          } else {
            this.isSuccessDeposit = false;
            this.toastr.error(reponse.result.message);
             this.manualDepositForm.reset();
            //  this.RedeemCode = '';
            //  this.redeemindex = null;
            //  this.couponClicked = false;
             this.documentImg = '';
             this.depositdocumentImg = '';
             this.isRequiredDepositDocumentCtrl = false;
             this.isdepositminmax = false;
          }
        }, err => { this.loading = false;this.isSuccessDeposit = false; this.depositStatus.emit('false'); console.log('depositRequest', err) });
      }
      } else {
        this.loading = false;
        this.isRequiredDepositDocumentCtrl = !this.manualDepositForm.controls["Document"].valid;
        Object.keys(this.manualDepositForm.controls).forEach(field => {
          const control = this.manualDepositForm.get(field);
          control.markAsTouched({ onlySelf: true });
        });
      }
    }
  }
  depositQRRequest(){
    // if(this.UPIId && this.UPIId.length > 0){
      this.manualQRDepositForm.controls['paymentId'].setValue(this.selectedPaymentAccountDetail[0].appManualPaymentAccountID);
    if(this.depositForm.value.amount >= this.selectedPaymentAccountDetail[0].appMinAmount && this.depositForm.value.amount <= this.selectedPaymentAccountDetail[0].appMaxAmount){
      if(!this.loading){
      this.loading = true;
      this.isSuccessDeposit = false;
      this.manualQRDepositForm.controls['Amount'].setValue(this.depositForm.value.amount);
      // const UTRTransactionNo = this.manualQRDepositForm.value.UTRTransactionNo+"["+this.UPIId+"]";
      const UTRTransactionNo = this.manualQRDepositForm.value.UTRTransactionNo;
      this.manualQRDepositForm.controls['UTRTransactionNo'].setValue(UTRTransactionNo);
      this.manualQRDepositForm.controls['Document'].setValue('');
      this.manualQRDepositForm.controls['promoCode'].setValue(this.RedeemCode);
      this.b2cUserService.manualDeposit(this.manualQRDepositForm.value).pipe(catchError(err => throwError(err))).subscribe((reponse: any) => {
        
        this.depositStatus.emit('false');
        if (reponse.isSuccess) {
          localStorage.setItem('Amount', this.depositForm.value.amount);
          localStorage.setItem('transactionId', reponse.result.transactionId);
          this.isSuccessDeposit = true;
          this.toastr.success(reponse.result.message);
          //  this.router.navigate(['/countdown']);
          this.manualQRDepositForm.reset();
          this.UPIId = '';
          this.close();

        } else {
          this.isSuccessDeposit = false;
          this.toastr.error(reponse.result.message);
           this.manualQRDepositForm.reset();

        }
      let appValue =  this.selectedPaymentAccountDetail[0].appValue;
      this.uniqueId = alphanumeric_unique();
      localStorage.setItem('uniqueId', this.uniqueId);
      this.manualQRDepositForm.controls['UTRTransactionNo'].setValue(this.uniqueId);
      appValue = appValue.replace("<<txno>>",this.uniqueId);
      appValue = appValue.replace("<<txno>>",this.uniqueId);
      appValue = appValue.replace("<<amount>>", this.depositForm.value.amount)
      this.myAngularxQrCode = appValue;
      this.googlepayurl = this.sanitizer.bypassSecurityTrustUrl(this.myAngularxQrCode.replace("upi://","gpay://upi/"));
      this.phonepayurl = this.sanitizer.bypassSecurityTrustUrl(this.myAngularxQrCode.replace("upi://","phonepe://"));
      this.paytmurl = this.sanitizer.bypassSecurityTrustUrl(this.myAngularxQrCode.replace("upi://","paytmmp://"));
      this.otherurl = this.sanitizer.bypassSecurityTrustUrl(this.myAngularxQrCode);
    this.manualDepositForm.controls['Amount'].setValue(this.depositForm.value.amount);
    this.manualDepositForm.controls['paymentId'].setValue(this.selectedPaymentAccountDetail[0].appManualPaymentAccountID);
    this.manualQRDepositForm.controls['paymentId'].setValue(this.selectedPaymentAccountDetail[0].appManualPaymentAccountID);
    this.loading = false;
      }, err => { this.loading = false;this.isSuccessDeposit = false; this.depositStatus.emit('false'); console.log('depositRequest', err) });
     }} else {
      this.toastr.error('Deposit amount must be between ' + this.selectedPaymentAccountDetail[0].appMinAmount +' and '  +
        this.selectedPaymentAccountDetail[0].appMaxAmount);;
    }
  // } else {
  //   if(this.UPIId == undefined || this.UPIId == null || this.UPIId.length == 0){
  //     this.isShowUPIMsg = true;
  //   } else {
  //     this.isShowUPIMsg = false;
  //   }
  // }
  }
  rejectBtnClick(){
    this.toastr.error('Please try again or contact our customer care if you are facing any problem in making payment');
  }
  checkIsDarkThemeExists(isCheckedDarkTheme: boolean) {
    this.isCheckedDarkTheme = isCheckedDarkTheme;
  }
  public noWhitespaceValidator(control: FormControl) {
    const isWhitespace = (control.value || '').trim().length === 0;
    const isValid = !isWhitespace;
    return isValid ? null : { 'whitespace': true };
  }
  trim(value) {
    let val = value.trim();
    this.UpdateMobileEmailForm.controls['emailID'].setValue(val)
  }
  onPaymentMethodChange(value) {
    this.depositModel.option = value;
    this.documentImg = '';
    this.depositdocumentImg = '';
    this.isRequiredDepositDocumentCtrl = false;
    this.isdepositminmax = false;
    this.isShowPaymentModel = false;
    // if(this.isWhatsappDeposit){
    //   this.selectedPaymentMethod = -1;
    // } else {
    //   this.selectedPaymentMethod = 0;
    // }
    this.selectedPaymentMethod = 0;
    this.rechargeDepositForm.reset();
    this.manualDepositForm.reset();
    this.RedeemCode = '';
    this.redeemindex = null;
    if(this.CampaignActionList && this.CampaignActionList.length >0){
      this.RedeemCode = this.CampaignActionList[0].pc;
      this.redeemindex = 0;
      this.couponClicked = true;
    } else {
      this.couponClicked = false;
    }
    if (this.depositModel.option === 'Manual') {
      // if ((this.apiEndPointData.depositWithWhatsapp && this.apiEndPointData.depositWithWhatsapp.length > 0) ||
      //     (this.apiEndPointData.depositWithTele && this.apiEndPointData.depositWithTele.length > 0)) {
      //   this.isWhatsappDeposit = true;
      // } else {
      //   this.isWhatsappDeposit = false;
      // }
      this.manualDepositForm.controls['Amount'].setValue(this.depositForm.value.amount);
      if(this.manualPaymentDetails && this.manualPaymentDetails.length > 0){
        this.onPaymentMethodClick(0,this.manualPaymentDetails[0].appPaymentMode);
      }
      // if(!this.isWhatsappDeposit){
      if(this.depositForm.value.amount >= this.selectedPaymentAccountDetail[0].appMinAmount && this.depositForm.value.amount <= this.selectedPaymentAccountDetail[0].appMaxAmount){
        this.isdepositminmax = false;
       } else {
        this.isdepositminmax = true;
      // }
    }
    } else {
      // this.isWhatsappDeposit = false;
      this.rechargeDepositForm.controls['amount'].setValue(this.depositForm.value.amount);
      if(this.depositForm.value.amount >= this.Amountminmax.dmin && this.depositForm.value.amount <= this.Amountminmax.dmax){
        this.isdepositminmax = false;
       } else {
        this.isdepositminmax = true;
      }
    }
    if(this.paymentGatewayList && this.paymentGatewayList.length > 0){
      this.rechargeDepositForm.controls['PaymentAPIId'].setValue(this.paymentGatewayList[0].paymentAPIID);
    } else {
      this.isRechargeDeposit = false;
    }
  }
  paymentGatewayListClick(item){
    this.rechargeDepositForm.controls['PaymentAPIId'].setValue(item.paymentAPIID);
  }
  PaymentGatewayList() {
    this.b2cUserService.PaymentGatewayList().pipe(catchError(err => throwError(err))).subscribe((reponse: any) => {
      if (reponse.message) {
        this.paymentGatewayList = reponse.message;
        if (this.paymentGatewayList && this.paymentGatewayList.length > 0) {
          this.isRechargeDeposit = true;
          this.rechargeDepositForm.controls['PaymentAPIId'].setValue(this.paymentGatewayList[0].paymentAPIID);
        } else {
          this.isRechargeDeposit = false;
        }
      } else {
        this.isRechargeDeposit = false;
      }
      if (!this.isRechargeDeposit && this.isManualDeposit) {
        this.depositModel = { option: 'Manual' };
        this.isWhatsappDeposit = true;
      } else {
        this.depositModel = { option: 'Recharge' };
        this.isWhatsappDeposit = false;
      }
    }, err => console.log('PaymentGatewayList', err));
  }
  GetPaymentModeList() {
    this.b2cUserService.GetPaymentModeList().pipe(catchError(err => throwError(err))).subscribe((reponse: any) => {
      if(reponse.message){
        this.PaymentModeList = reponse.message.getManualPaymentAccountList;
        this.isWhatsappDeposit = this.PaymentModeList.some(function(el) {
          return el.appPaymentModeTypeEnum == PaymentModeType.Whatsapp || el.appPaymentModeTypeEnum == PaymentModeType.Telegram;
        });
        this.DepositWithWhatsapp = this.PaymentModeList.find(function(el) {
          return el.appPaymentModeTypeEnum == PaymentModeType.Whatsapp;
        });
        this.DepositWithTelegram = this.PaymentModeList.find(function(el) {
          return el.appPaymentModeTypeEnum == PaymentModeType.Telegram;
        });
        this.manualPaymentDetails = arrayUniqueByKey(this.PaymentModeList.filter(function(el) {
          return el.appPaymentModeTypeEnum == PaymentModeType.BankOrUPI;
        }), 'appPaymentMode');
        const PaymentAccountDetail = reponse.message.strPaymentAccountDetail;
        this.PaymentAccountDetail = PaymentAccountDetail ? JSON.parse(PaymentAccountDetail) : [];

         
       
          if (!this.isRechargeDeposit && this.isManualDeposit) {
            this.depositModel = { option: 'Manual' };
            // this.isWhatsappDeposit = true;
            this.onPaymentMethodClick(0,this.manualPaymentDetails[0].appPaymentMode);
          } else {
            this.depositModel = { option: 'Recharge' };
            // this.isWhatsappDeposit = false;
          }
      }
    }, err => console.log('GetPaymentModeList', err));
  }
  onPaymentMethodClick(index: any, PaymentMode: any) {
    // this.isWhatsappDeposit = false;
    this.isRequiredDepositDocumentCtrl = false;
    this.depositdocumentImg = '';
    this.isdepositminmax = false;
    this.manualDepositForm.reset();
    this.selectedPaymentMethod = index;
    this.paymentDetailsOption = this.PaymentModeList.filter(x => x.appPaymentMode == PaymentMode);
    this.onPaymentOPtionClick(0,this.paymentDetailsOption[0].appManualPaymentAccountID, this.paymentDetailsOption[0].appIsUPIRequestQRCode)
  }
  onPaymentOPtionClick(index:any, appManualPaymentAccountID:any, appIsUPIRequestQRCode: any){
    // this.isWhatsappDeposit = false;
    this.isRequiredDepositDocumentCtrl = false;
    this.depositdocumentImg = '';
    this.isdepositminmax = false;
    this.manualDepositForm.reset();
    this.selectedPaymentOption = index;
    this.isUPIRequestQRCode = appIsUPIRequestQRCode;
    this.selectedPaymentAccountDetail = this.PaymentAccountDetail.filter(x => x.appManualPaymentAccountID == appManualPaymentAccountID);
    let appValue =  this.selectedPaymentAccountDetail[0].appValue;
      appValue = appValue.replace("<<txno>>",this.manualQRDepositForm.value.UTRTransactionNo);
      appValue = appValue.replace("<<txno>>",this.manualQRDepositForm.value.UTRTransactionNo);
      appValue = appValue.replace("<<amount>>", this.depositForm.value.amount)
      this.myAngularxQrCode = appValue;
      this.googlepayurl = this.sanitizer.bypassSecurityTrustUrl(this.myAngularxQrCode.replace("upi://","gpay://upi/"));
      this.phonepayurl = this.sanitizer.bypassSecurityTrustUrl(this.myAngularxQrCode.replace("upi://","phonepe://"));
      this.paytmurl = this.sanitizer.bypassSecurityTrustUrl(this.myAngularxQrCode.replace("upi://","paytmmp://"));
      this.otherurl = this.sanitizer.bypassSecurityTrustUrl(this.myAngularxQrCode);
    if (this.depositModel.option === 'Manual') {
      this.manualDepositForm.controls['Amount'].setValue(this.depositForm.value.amount);
    } else {
      this.rechargeDepositForm.controls['amount'].setValue(this.depositForm.value.amount);
    }
    this.manualDepositForm.controls['Amount'].setValue(this.depositForm.value.amount);
    this.manualDepositForm.controls['paymentId'].setValue(appManualPaymentAccountID);
    this.manualQRDepositForm.controls['paymentId'].setValue(appManualPaymentAccountID);
      if(index != -1){
      if(this.depositForm.value.amount >= this.selectedPaymentAccountDetail[0].appMinAmount && this.depositForm.value.amount <= this.selectedPaymentAccountDetail[0].appMaxAmount){
        this.isdepositminmax = false;
       } else {
        this.isdepositminmax = true;
      } 
    } else {
      this.isdepositminmax = true;
    }
  }
  onCopyToClipboardClick(p: any) {
    var Row = document.getElementById("payment" + p);
    // var Cells = Row.getElementsByTagName("td");
    // let value = Cells[1].innerText;
    let value = Row.innerText;
    let copyText = document.createElement('input');
    copyText.setAttribute('type', 'text');
    copyText.value = value;
    document.body.appendChild(copyText);
    copyText.select();
    copyText.setSelectionRange(0, 99999); /* For mobile devices */

    /* Copy the text inside the text field */
    navigator.clipboard.writeText(copyText.value);
    document.body.removeChild(copyText);
    let notice = document.createElement("span");
        notice.className = "notice visible";
        notice.innerHTML = "Text copied to the clipboard!";
        document.body.appendChild(notice);
        setTimeout(() => {
          document.body.removeChild(notice);
        }, 3000);
    
  }
  reSendEmailClick() {
    const email = userProfileInfo.data.appEmailID;
    this.b2cUserService.ReSendMail(email).pipe(catchError(err => throwError(err))).subscribe((reponse: any) => {
      if(reponse.isSuccess){
        this.toastr.success(reponse.result.message);
      } else {
        this.toastr.error(reponse.result.message);
      }
    }, err => console.log('reSendEmailClick', err));
  }
  GetCampaignActionList(GroupCode) {
    this.bonusService.GetCampaignActionList(GroupCode).pipe(catchError(err => throwError(err))).subscribe((reponse: any) => {
      if (reponse.isSuccess) {
        this.CampaignActionList = reponse.result;
        if(this.CampaignActionList && this.CampaignActionList.length >0){
          this.RedeemCode = this.CampaignActionList[0].pc;
          this.redeemindex = 0;
          this.couponClicked = true;
        }
      } 
    }, err => { console.log('GetCampaignActionList', err) });
  }
  depositwithTele(){
    // window.open(apiEndPointData.data.depositWithTele, '_blank');
    const obj: any = this.PaymentAccountDetail.find(x => x.appManualPaymentAccountID == this.DepositWithTelegram.appManualPaymentAccountID); 
    if(obj && obj.appValue){
      window.open(obj.appValue, '_blank');
    }
  }
  depositwithWhatsapp(){
    // window.open(apiEndPointData.data.depositWithWhatsapp, '_blank');
    const obj: any = this.PaymentAccountDetail.find(x => x.appManualPaymentAccountID == this.DepositWithWhatsapp.appManualPaymentAccountID); 
    if(obj && obj.appValue){
      window.open(obj.appValue, '_blank');
    }
  }
  demosubmit(){
    this.toastr.error('You are not allowed to access this page',"Notification",{
      toastClass: "custom-toast-error"
    });    
  }
  trackByFun(index, item) {
    return index;
  }
  isEmpty(obj:any) {
    for (var key in obj) {
      if (obj.hasOwnProperty(key))
        return false;
    }
    return true;
  }
  ngOnDestroy(): void {
     
  }
}
