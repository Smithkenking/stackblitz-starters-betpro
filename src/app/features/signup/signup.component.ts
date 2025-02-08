import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { CampaignActionGroup } from '@clientApp-core/enums/CampaignActionGroup.type';
import { Authenticate } from '@clientApp-core/models/auth/authentication.models';
import { apiEndPointData } from '@clientApp-core/services/config/connfig.service';
import { setRoutesBasedOnRoles } from '@clientApp-core/services/shared/routing.service';
import { AppMessage } from '@clientApp-core/utilities/app-configuration';
import { RecaptchaComponent } from 'ng-recaptcha';
import { Subscription, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ChangePasswordComponent } from '../change-password/change-password.component';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthFacadeService } from '@clientApp-core/services/authentication/authentication-facade.service';
import { BetFacadeService } from '@clientApp-core/services/bet/bet.facade.service';
import { CommonService } from '@clientApp-core/services/common/common.service';
import { SessionService } from '@clientApp-core/services/session/session.service';
import { B2cUserService } from '@clientApp-core/services/authentication/b2c-user.service';
import { ToastrService } from 'ngx-toastr';
import { BonusService } from '@clientApp-core/services/authentication/bonus.service';
import { CountryISO, PhoneNumberFormat, SearchCountryField } from 'ngx-intl-tel-input';
import * as M from "materialize-css/dist/js/materialize";
import SwiperCore, { SwiperOptions, Navigation } from 'swiper';
import { LoginWith } from '@clientApp-core/enums/loginwith.types';
import { DataLayerService } from '@clientApp-core/services/window/DataLayerService.service';
import { SocialUser, FacebookLoginProvider } from '@abacritt/angularx-social-login';
import { SocialAuthService } from "@abacritt/angularx-social-login";
SwiperCore.use([Navigation]);
declare var gtag: any;
@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent implements OnInit, AfterViewInit, OnDestroy {
  user!: SocialUser;
  loggedIn!: boolean;
  idToken: string;
  isCheckedDarkTheme: boolean;
  loginPopupImage: string;
  loginPopupDarkImage: string;
  loading: boolean;
  click_id: any = '';
  mkt: any = '';
  isUserNameValidate = false;
  usernameValidationMsg = '';
  isMobileValidate = false;
  numbervalidation: boolean;
  numberrequiredvalidation: boolean;
  mobileValidationMsg = '';
  errorMessage = '';
  isGoogleCaptchaExpire: boolean;
  CampaignActionList: any = [];
  isSuccessRegistration = false;
  RequestId = ' ';
  captchaImg = '';
  sitekey: any;
  isShowGoogleCaptcha: any;
  isSendOTP: boolean;
  otpPageInstances: any;
  selectedCountryISO = CountryISO.Pakistan;
  interval: any;
  displayotptimer: any
  isResendOtp: boolean = false;
  isUpdateMobileNo: boolean = false;
  isOtpCheck: boolean = false;
  resendOTPLimit: number = 0;
  loginWith: number=1;
  private otplessInitialized = false;
  PhoneNumberFormat = PhoneNumberFormat;
  SearchCountryField = SearchCountryField;
  separateDialCode = false;
  Resetmail: boolean = false;
  PhonePacleHolder: string = 'Mobile Number'; //'789XXXXXXX';
  CountryISO = CountryISO;
  showPasswordVisibility: boolean = false;
  onlyCountries: CountryISO[] = [CountryISO.Pakistan];
  passwordPatterncheck = apiEndPointData.data.ap ? apiEndPointData.data.ap.split("::") : '';
  isResetPassword: boolean = true;
  isWALoginEnable = apiEndPointData.data.isWALoginEnable;
  confirmModalRef;
  couponClicked: boolean = false;
  showOtpComponent = true;
  otp: string;
  isDemoLogin: boolean;
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
  registerForm = this.fb.group({
    UserName: ['', [Validators.required, Validators.pattern("^[0-9a-zA-Z@_]*$")]],
    Password: ['', [Validators.required, Validators.pattern(this.passwordPatterncheck[0])]],
    emailID: [''],
    mobileNo: ['', Validators.required],
    referralCode: [''],
    mktcode: [''],
    promoCode: ['']
  });
  loginForm = this.fb.group({
    UserName: ['', Validators.required],
    Password: ['', Validators.required],
    Captcha: ['', Validators.required],
    LoginWith: [this.loginWith,],
    RememberMe: [false]
  });
  UpdateMobileNoForm = this.fb.group({
    mobileNo: ['', Validators.required],
  });
  otpForm: UntypedFormGroup;
  CampaignActionConfig: SwiperOptions = {
    slidesPerView: 'auto',
    watchOverflow: true,
    loop: false,
    navigation: {
      nextEl: ".CampaignActionSlidernextbutton",
      prevEl: ".CampaignActionSliderprevbutton",
    },
    };
    DemologinForm = this.fb.group({
      Captcha: ['', Validators.required],
    });
    demoloading: boolean;
    otplessModalRef: any;
  formInput = ['input1', 'input2', 'input3', 'input4', 'input5', 'input6'];
  registerByOTPForm = this.fb.group({
    Mobile: ['', Validators.required],
    referralCode: [''],
    mktcode: [''],
    promoCode: ['']
  });
  activeTab: string = 'password';
  private subscription: Subscription;
  @ViewChild('verifyOtpPage', { static: true }) verifyOtpPage: ElementRef;
  @ViewChild('captchaRef', { static: false }) captchaRef: RecaptchaComponent;
  @ViewChild('resetpassword', { static: true }) resetpasswordRef: ChangePasswordComponent;
  @ViewChild('ConfirmModal', { static: true }) template: ElementRef;
  @ViewChild('otplessModal', { static: true }) otplessModal: ElementRef;
  constructor(public router: Router, private route: ActivatedRoute, private fb: UntypedFormBuilder,
    public commonService: CommonService, private authService: AuthFacadeService, private betService: BetFacadeService,
    private sessionService: SessionService, private b2cUserService: B2cUserService, private toastr: ToastrService,
    private bonusService: BonusService, private dataLayerService: DataLayerService,private SocialAuthService: SocialAuthService) {
    this.commonService.getDarkThemeStatus().subscribe(isChecked => {
      this.isCheckedDarkTheme = isChecked;
    });
    this.route.queryParams.subscribe(params => {
      if (params && params['referralcode'] && params['referralcode'] !== '' && apiEndPointData.data.isB2C) {
        this.commonService.setCookieValue('referralcodeset', JSON.stringify(params['referralcode']), 30);
        setTimeout(() => {
          let redercode = this.commonService.getCookieValue('referralcodeset');
          redercode = redercode ? JSON.parse(redercode) : "";
          if (redercode != "") {
            this.registerForm.controls['referralCode'].setValue(redercode);
            this.UpdateMobileNoForm.controls['referralCode'].setValue(redercode);         
          }
          let redercode1 = this.commonService.getCookieValue('mktset');
          redercode1 = redercode1 ? JSON.parse(redercode1) : "";
          if (redercode1 != "") {
            this.registerForm.controls['mktcode'].setValue(redercode1);
            this.UpdateMobileNoForm.controls['mktcode'].setValue(redercode1);   
          }
        }, 500);
      } else if (params && params['mkt'] && params['mkt'] !== '' && apiEndPointData.data.isB2C) {
        localStorage.setItem('mktset', JSON.stringify(params['mkt']));
        this.commonService.setCookieValue('mktset', JSON.stringify(params['mkt']), 30);
        this.mkt = params['mkt'];
        this.registerForm.controls['mktcode'].setValue(params['mkt']);
        this.UpdateMobileNoForm.controls['mktcode'].setValue(params['mkt']);  
      } else if (params && params['click_id'] && params['click_id'] !== '' && apiEndPointData.data.isB2C) {
        this.click_id = params['click_id'];
      }
    });
    this.otpForm = this.toFormGroup(this.formInput);
  }

  ngOnInit(): void {
    this.SocialAuthService.signOut();
    this.isWALoginEnable = apiEndPointData.data.isWALoginEnable;
    this.initializeOtpless();
    this.loginWith = apiEndPointData.data?.loginWith ? apiEndPointData.data.loginWith : 1;
    this.sitekey = apiEndPointData.data.sk;
    this.isShowGoogleCaptcha = apiEndPointData.data.isgc;
    this.isSendOTP = apiEndPointData.data.isSendOTP;
    const darkThemeCurrentState = this.commonService.getCookieValue('isCheckedDarkTheme');
    this.isCheckedDarkTheme = (darkThemeCurrentState != null && darkThemeCurrentState != undefined && darkThemeCurrentState != '') ? JSON.parse(darkThemeCurrentState).isCheckedDarkTheme : false;
    this.loginPopupImage = this.commonService.imgRelativePath(apiEndPointData.data.loginPopupImage);
    this.loginPopupDarkImage = this.commonService.imgRelativePath(apiEndPointData.data.loginPopupDarkImage);
    this.isDemoLogin = apiEndPointData.data.isDemoLogin;
    this.GetCampaignActionList(CampaignActionGroup.SignUp);
    if (!this.isShowGoogleCaptcha) {
      this.loginForm.get('Captcha').setValidators(Validators.required);
    }
    let redercode = this.commonService.getCookieValue('referralcodeset');
    redercode = redercode ? JSON.parse(redercode) : "";
    if (redercode != "") {
      this.registerForm.controls['referralCode'].setValue(redercode);
      this.UpdateMobileNoForm.controls['referralCode'].setValue(redercode);  
    }
    this.subscription = this.SocialAuthService.authState.subscribe(user => {
      if(user && user?.provider === 'GOOGLE'){
        // console.log('authState user', user)
      let token = '';
      let providerEnum:number;
      if (user?.provider === 'GOOGLE') {
        token = user.idToken;
        providerEnum=7;
      } else if (user?.provider === 'FACEBOOK') {
        token = user.authToken;
        providerEnum=6;
      }

      const data:any = {
        ApiResponseId: user.id,
        FullName: user.name,
        Email: user.email,
        Mobile: "",
        ProviderEnumId:providerEnum,
        PhotoUrl:user.photoUrl,
        ReferralCode: "",
        Token: token,
        Mktcode: "",
        ClickID: "",
        PromoCode: ""
      };

    if (data.Token) {
      this.socialLoginWithGF(data);
    }else {
      console.error('Token is missing!');
    }
  }
    });
  }
  ngAfterViewInit(): void {
    this.otplessModalRef =  M.Modal.init(this.otplessModal.nativeElement, {});
    this.confirmModalRef =  M.Modal.init(this.template.nativeElement, {});
    this.otpPageInstances = M.Modal.init(this.verifyOtpPage.nativeElement, { dismissible: false });
    this.captchaRef.execute();
  }
  socialLoginWithGF(body) {
    this.loading = true;
    this.authService.SocialLogin(body).subscribe(response => {
      if(response.isSuccess){
        const res = response.result;
      if (res && res.loginType && (res.loginType == 1 || res.loginType == 4 || res.loginType == 6)) {
        //  Redirect to panel URL
        // this.panelForm.controls['UserName'].setValue(res.clientName);
        // this.panelForm.controls['Password'].setValue(res.access_token);
        // try {
        //   let el: HTMLElement = this.fileInput.nativeElement;
        //   el.click();
        // }
        // catch (ex) {
        //   console.log('Error:: Redirect to Panel URL', ex);
        // }
      } else if (res && res.loginType && res.loginType == 2) {
        // Redirect to Agent panel URL
        // this.agentForm.controls['UserName'].setValue(res.clientName);
        // this.agentForm.controls['Password'].setValue(res.access_token);
        // try {
        //   let el: HTMLElement = this.fileAgentInput.nativeElement;
        //   el.click();
        // }
        // catch (ex) {
        //   console.log('Error:: Redirect to Agent URL', ex);
        //  }
      } else {
        this.sessionService.stopMarketHubConnection();
        localStorage.setItem('token', JSON.stringify(res));
        this.betService.setBetStatus(false);
        this.betService.setSelectedRunner().next();
        this.resetRouting();
        this.router.navigateByUrl('/home');
      }
      } else {
        this.SocialAuthService.signOut();
        this.toastr.error(response.result.message,"Notification",{
          toastClass: "custom-toast-error"
        });
      }
      this.loading = false;
    }, errorObj => {
      this.SocialAuthService.signOut();
      this.loading = false;
      this.toastr.error(errorObj.error,"Notification",{
        toastClass: "custom-toast-error"
      });
    });
  }

  signInWithFB(): void {
    this.SocialAuthService.signIn(FacebookLoginProvider.PROVIDER_ID).then(
      user => {
        if (user) {
          // console.log('facebook', JSON.stringify(user));
          const data: any = {
            ApiResponseId: user.id,
            FullName: user.name,
            Email: user.email,
            Mobile: "",
            ProviderEnumId: 6,
            PhotoUrl: user.photoUrl,
            ReferralCode: "",
            Token: user.authToken,
            Mktcode: "",
            ClickID: "",
            PromoCode: ""
          };

          if (data.Token) {
            this.socialLoginWithGF(data);
          } else {
            console.error('Token is missing!');
          }
        }
    })
    .catch(err => {
      console.error('Error during sign in:', err);
    });;
  }
  signOut(): void {
    this.SocialAuthService.signOut();
  }
  openModal (){
    this.otplessModalRef.open();
    (window as any).otplessInit()
  }
  initializeOtpless() {
    const user = JSON.parse(localStorage.getItem('token'));
    if (!this.otplessInitialized && apiEndPointData.data.isWALoginEnable && (user == null || user == undefined || user == '')) {
      // Define the 'otpless' function
      const script = document.createElement('script');
      script.src = 'https://otpless.com/auth.js';
      if(apiEndPointData.data.cid){
        script.setAttribute('cid', apiEndPointData.data.cid);
      }
      document.body.appendChild(script);
  
      // const otplessInit = (window as any).otplessInit;
      // otplessInit?.();
  
      const otpless = (otplessUser: any) => {
        // Additional code to handle otplessUser
           const waName = otplessUser.waName;
        const waNumber = otplessUser.waNumber;
        const body = {
          "waName": waName,
          "waNumber": waNumber,
          "promoCode": this.CampaignActionList && this.CampaignActionList.length > 0 ? this.CampaignActionList[0].pc : ""
        };
        this.SignUpLoginWithWA(body);
      };
      (window as any).otpless = otpless;
      this.otplessInitialized = true;
  }
   
}
removeOtplessScript() {
  const script = document.querySelector('script[src="https://otpless.com/auth.js"]');
  if (script) {
    document.body.removeChild(script);
  }
}
  onSubmitRegisterForm() {
    if (this.registerForm.valid) {
      if (this.isUserNameValidate && this.isMobileValidate && !this.loading) {
        if(this.CampaignActionList && this.CampaignActionList.length > 0){
            this.registerForm.controls['promoCode'].setValue(this.CampaignActionList[0].pc);
            this.UpdateMobileNoForm.controls['promoCode'].setValue(this.CampaignActionList[0].pc);
        }
        const origin = window.location.host;
        const currentUrl = window.location.href;
        let number = '';
        this.loading = true; const mobilectrl = this.registerForm.value.mobileNo;
        const mobileNo = mobilectrl.dialCode + '' + mobilectrl.number;
        number = mobileNo.replace(/\D/g, '');
        const body = {
          "ConfirmPassword": '',
          "EmailID": '',
          "MobileNo": number,
          "Password": this.registerForm.value.Password,
          "ReferralCode": this.registerForm.value.referralCode,
          "Username": this.registerForm.value.UserName,
          "Mktcode": this.registerForm.value.mktcode,
          "clickID": this.click_id,
          "promoCode": this.registerForm.value.promoCode
        }
        this.b2cUserService.RegistrationProcess(body).pipe(catchError(err => throwError(err))).subscribe((reponse: any) => {
          if (reponse.isSuccess) {
            localStorage.setItem('registrationtoken', JSON.stringify(reponse.result.token));
            this.toastr.success(reponse.result.message,"Notification",{
              toastClass: "custom-toast-success"
            });
            if (this.isSendOTP) {
              this.otpPageInstances.open();
              this.selectedCountryISO = mobilectrl.countryCode;
              this.UpdateMobileNoForm.controls["mobileNo"].clearValidators();
              this.UpdateMobileNoForm.controls['mobileNo'].setValue(mobilectrl.number);
              this.UpdateMobileNoForm.controls['mobileNo'].disable();
              this.otptimer(1);
            } else {
              this.isSuccessRegistration = true;
              const token = JSON.parse(localStorage.getItem('registrationtoken')); // Get token from some service
              this.loading = true;
              const body = {
                "Token": token,
                "OTP": ''
              };
              this.b2cUserService.RegistrationComplete(body).pipe(catchError(err => throwError(err))).subscribe((reponse: any) => {
                if (reponse.isSuccess) {
                  this.toastr.success(reponse.result.message,"Notification",{
                    toastClass: "custom-toast-success"
                  });
                  const self = this;
                  this.isSuccessRegistration = true;
                  if(apiEndPointData.data.isGoogleTagManagerEnable){
                  const _currentSet ={
                    'event': 'register',
                    'phone': '+' + number
                  };
                  this.dataLayerService.pingHome(_currentSet);
                }
                  this.captchaRef.execute();
                  let username = '', Password = this.registerForm.value.Password;
                  if(this.loginWith === LoginWith.Mobile){
                    username = number;
                  } else {
                    username = this.registerForm.value.UserName;
                  }
                  setTimeout(() => {
                    self.loginForm.controls['UserName'].setValue(username);
                    self.loginForm.controls['Password'].setValue(Password);
                    self.loginForm.controls['LoginWith'].setValue(this.loginWith);
                    self.postData(this.loginForm.value);
                  }, 5000);
                } else {
                  this.toastr.error(reponse.result.message,"Notification",{
                    toastClass: "custom-toast-error"
                  });
                }
                this.loading = false;
              }, err => { this.loading = false; console.log('RegistrationComplete', err) });
            }
          } else {
            this.isSuccessRegistration = false;
            this.toastr.error(reponse.result.message,"Notification",{
              toastClass: "custom-toast-error"
            });
          }
          this.loading = false;
        }, errorObj => {
          this.isSuccessRegistration = false;
          this.loading = false;
          if (errorObj.status === 401) {
            this.errorMessage = errorObj.error;
          } else {
            this.errorMessage = AppMessage.serviceUnavailable;
          }
        });
      }
    } else {
      this.loading = false;
      Object.keys(this.registerForm.controls).forEach(field => {
        const control = this.registerForm.get(field);
        control.markAsTouched({ onlySelf: true });
      });
      if ((this.registerForm.value.mobileNo == "" || this.registerForm.value.mobileNo == null)) {
        this.numberrequiredvalidation = true;
      } else if (this.registerForm.controls['mobileNo'].invalid) {
        this.numbervalidation = true;
      }

    }
  }
  confirm(): void {
    this.couponClicked = true;
    this.onSubmitRegisterForm();
    this.confirmModalRef.close();
  }
  decline(): void {
    this.confirmModalRef.close();
  }
  postData($event: Authenticate) {
    this.errorMessage = '';
    this.Resetmail = false;
    this.loading = true;
    this.isGoogleCaptchaExpire = false;
    this.authService.LogIn$($event.UserName, $event.Password, $event.Captcha, this.RequestId, this.loginWith).subscribe(res => {
      // nevigate on reset password if there is force reset password else redirect to home page.
      if (res.resetPassword && res.resetPassword !== undefined && res.resetPassword === true) {
        this.resetpasswordRef.openPopup();
        localStorage.setItem('token', JSON.stringify(res));
      } else {
        this.sessionService.stopMarketHubConnection();
        localStorage.setItem('token', JSON.stringify(res));
        this.commonService.selectedTab = 'Home';
        this.betService.setBetStatus(false);
        this.betService.setSelectedRunner().next();
        this.resetRouting();
        this.router.navigateByUrl('/deposit');
      }
      this.loading = false;
    }, errorObj => {
      this.loading = false;
      if (errorObj.status === 401) {
        if (errorObj.error === "your google captcha token has expired so please try again!") {
          this.errorMessage = '';
          this.isGoogleCaptchaExpire = true;
          this.captchaRef.execute();
          this.loading = true;
        } else {
          this.errorMessage = errorObj.error;
        }
      } else {
        this.errorMessage = AppMessage.serviceUnavailable;
      }
      this.getCaptcha();
    });
  }
  OnSignInClick() {
    this.router.navigate(['/login']);
  }
  userFocusOutFn(event: any) {
    if (event.target.value != "" && event.target.value != null) {
      this.b2cUserService.VerifyDetails(event.target.value, 1).pipe(catchError(err => throwError(err))).subscribe((reponse: any) => {
        this.isUserNameValidate = reponse.isSuccess;
        if (reponse.isSuccess) {
          this.usernameValidationMsg = '';
        } else {
          this.usernameValidationMsg = reponse.result.message;
        }
      }, err => { this.isUserNameValidate = false; console.log('VerifyDetails', err) });
    }
    this.RegisterTracing();
  }
  mobileFocusOutFn(event: any) {
    if (event.target.value != "" && event.target.value != null) {
      this.numberrequiredvalidation = false;
      if (event.target.value.length == 10) {
        this.numbervalidation = false;
        const mobileNo = this.registerForm.value.mobileNo.dialCode + '' + this.registerForm.value.mobileNo.number;
        var number = mobileNo.replace(/\D/g, '');
        this.b2cUserService.VerifyDetails(number, 3).pipe(catchError(err => throwError(err))).subscribe((reponse: any) => {
          this.isMobileValidate = reponse.isSuccess;
          if (reponse.isSuccess) {
            this.mobileValidationMsg = '';
          } else {
            this.mobileValidationMsg = reponse.result.message;
          }
        }, err => { this.isMobileValidate = false; console.log('VerifyDetails', err) });
      } else {
        this.numbervalidation = true;
      }
    } else if (event.target.value == "" || event.target.value == null) {
      this.numberrequiredvalidation = true;
    }
    this.RegisterTracing();
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
  GetCampaignActionList(GroupCode) {
    this.bonusService.GetCampaignActionList(GroupCode).pipe(catchError(err => throwError(err))).subscribe((reponse: any) => {
      if (reponse.isSuccess) {
        const CampaignActionList = reponse.result;
        this.CampaignActionList = CampaignActionList.map((x) => {
          return Object.assign({ isChecked: false }, x);
        });
        if(this.CampaignActionList && this.CampaignActionList.length > 0){
          this.registerForm.controls['promoCode'].setValue(this.CampaignActionList[0].pc);
          this.registerByOTPForm.controls['promoCode'].setValue(this.CampaignActionList[0].pc);
      }
      }
    }, err => { console.log('GetCampaignActionList', err) });
  }
  RegisterTracing() {
    let redercode = this.commonService.getCookieValue('referralcodeset');
    redercode = redercode ? JSON.parse(redercode) : "";
    if (redercode != "") {
      this.registerForm.controls['referralCode'].setValue(redercode);
      this.registerByOTPForm.controls['referralCode'].setValue(redercode);
    }
    const mktset = JSON.parse(localStorage.getItem('mktset'));
    let redercode1 = this.commonService.getCookieValue('mktset');
    redercode1 = redercode1 ? JSON.parse(redercode1) : "";
    if(this.mkt != null && this.mkt  != undefined && this.mkt  != ''){
      this.registerForm.controls['mktcode'].setValue(this.mkt);
      this.registerByOTPForm.controls['mktcode'].setValue(this.mkt);
    }else if (mktset != null && mktset != undefined && mktset != '') {
      this.registerForm.controls['mktcode'].setValue(mktset);
      this.registerByOTPForm.controls['mktcode'].setValue(mktset);
    } else if(redercode1 != ""){
      this.registerForm.controls['mktcode'].setValue(redercode1);
      this.registerByOTPForm.controls['mktcode'].setValue(redercode1);
    }
  }
  getCaptcha() {
    if (this.isShowGoogleCaptcha) {
    } else {
      this.authService.getCaptchaCode().subscribe((x: any) => { this.captchaImg = x.item1; this.RequestId = x.item2; this.loading = false; });
    }
  }
  resolved(captchaResponse: string) {
    if (this.isShowGoogleCaptcha) {
      this.loginForm.controls['Captcha'].setValue(captchaResponse);
      this.DemologinForm.controls['Captcha'].setValue(captchaResponse);
      if (this.isGoogleCaptchaExpire) {
        this.postData(this.loginForm.value);
      }
    }
  }
  RegistrationUpdateMobile() {
    if (!this.loading && this.UpdateMobileNoForm.valid && !this.numberrequiredvalidation && !this.numbervalidation) {
      this.loading = true;
      const token = JSON.parse(localStorage.getItem('registrationtoken'));
      let number = '';
      const mobilectrl = this.UpdateMobileNoForm.value.mobileNo;
      const mobileNo = mobilectrl.dialCode + '' + mobilectrl.number;
      number = mobileNo.replace(/\D/g, '');
      const body = {
        "Token": token,
        "MobileNo": number
      };
      this.b2cUserService.RegistrationUpdateMobile(body).pipe(catchError(err => throwError(err))).subscribe((reponse: any) => {
        if (reponse.isSuccess) {
          this.toastr.success(reponse.result.message,"Notification",{
            toastClass: "custom-toast-success"
          });
          this.isResendOtp = false;
          this.isUpdateMobileNo = false;
          this.otptimer(1);
          this.selectedCountryISO = mobilectrl.countryCode;
          this.UpdateMobileNoForm.controls["mobileNo"].clearValidators();
          this.UpdateMobileNoForm.controls['mobileNo'].setValue(mobilectrl.number);
          this.UpdateMobileNoForm.controls['mobileNo'].disable();
        } else {
          this.isResendOtp = true;
          this.otptimer(0);
          this.toastr.error(reponse.result.message,"Notification",{
            toastClass: "custom-toast-error"
          });
        }
        this.loading = false;
      }, err => { this.loading = false; console.log('RegistrationUpdateMobile', err) });
    }
  }
  onCancelUpdateMobileClick() {
    this.isUpdateMobileNo = false;
    let number = '';
    const mobilectrl = this.registerForm.value.mobileNo;
    const mobileNo = mobilectrl.dialCode + '' + mobilectrl.number;
    number = mobileNo.replace(/\D/g, '');
    this.selectedCountryISO = mobilectrl.countryCode;
    this.UpdateMobileNoForm.controls["mobileNo"].clearValidators();
    this.UpdateMobileNoForm.controls['mobileNo'].setValue(mobilectrl.number);
    this.UpdateMobileNoForm.controls['mobileNo'].disable();
    this.numberrequiredvalidation = false;
    this.numbervalidation = false;
  }
  onEditUpdateMobileClick() {
    this.isUpdateMobileNo = true;
    this.UpdateMobileNoForm.controls['mobileNo'].enable();
    this.UpdateMobileNoForm.get('mobileNo').setValidators(Validators.required);
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
  toFormGroup(elements) {
    const group: any = {};
    elements.forEach(key => {
      group[key] = new UntypedFormControl('', Validators.required)
    });
    return new UntypedFormGroup(group);
  }
  onResendOtpClick() {
    if (this.resendOTPLimit <= apiEndPointData.data.resendOTPLimit) {
      this.resendOTPLimit = ++this.resendOTPLimit;
      this.onConfigChange();
      this.isResendOtp = false;
      let number = '', UserName = '', OtpType = '';
      OtpType = 'REG';
      const mobilectrl = this.registerByOTPForm.value.Mobile ? this.registerByOTPForm.value.Mobile : this.registerForm.value.mobileNo;
      const mobileNo = mobilectrl?.dialCode + '' + mobilectrl?.number;
      const currnumber = mobileNo.replace(/\D/g, '');

      const updatedmobilectrl = this.UpdateMobileNoForm.value.mobileNo;
      const updatedmobileNo = updatedmobilectrl.dialCode + '' + updatedmobilectrl.number;
      const updatednumber = updatedmobileNo.replace(/\D/g, '');
      if (currnumber !== updatednumber) {
        number = updatednumber;
      } else {
        number = currnumber;
      }
      this.b2cUserService.SendWhatappOTP(number, OtpType, UserName).pipe(catchError(err => throwError(err))).subscribe((reponse: any) => {
        if (reponse.status) {
          this.otptimer(1);
          this.toastr.success(reponse.msg,"Notification",{
            toastClass: "custom-toast-success"
          });
        } else {
          this.otptimer(0);
          this.isResendOtp = true;
          this.toastr.error(reponse.msg,"Notification",{
            toastClass: "custom-toast-error"
          });
        }
      }, err => { this.isResendOtp = true; console.log('SendWhatappOTP', err) });
    }
  }
  RegistrationComplete() {
    if (this.otp  && this.otp.length === 6) {
      const token = JSON.parse(localStorage.getItem('registrationtoken')); // Get token from some service
      this.loading = true;
      const body = {
        "Token": token,
        "OTP": this.otp
      };
      this.b2cUserService.RegistrationComplete(body).pipe(catchError(err => throwError(err))).subscribe((reponse: any) => {
        if (reponse.isSuccess) {
          this.toastr.success(reponse.result.message,"Notification",{
            toastClass: "custom-toast-success"
          });
          const self = this;
          this.otpPageInstances.close();
          if(this.activeTab !== 'otp'){
          this.isSuccessRegistration = true;
          this.captchaRef.execute();
          let username = '', Password = this.registerForm.value.Password;
          let number = '';
          const mobilectrl = this.UpdateMobileNoForm.value.mobileNo;
          const mobileNo = mobilectrl.dialCode + '' + mobilectrl.number;
          number = mobileNo.replace(/\D/g, '');
          if(this.loginWith === LoginWith.Mobile){
            username = number;
          } else {
            username = this.registerForm.value.UserName;
          }
          if(apiEndPointData.data.isGoogleTagManagerEnable){
          gtag('event', 'Registration_Successful');
          const _currentSet ={
            'event': 'register',
            'phone': '+' + number
          };
          this.dataLayerService.pingHome(_currentSet);
        }
          setTimeout(() => {
            self.loginForm.controls['UserName'].setValue(username);
            self.loginForm.controls['Password'].setValue(Password);
            self.loginForm.controls['LoginWith'].setValue(this.loginWith);
            self.postData(this.loginForm.value);
          }, 5000);
        }
        } else {
          this.isResendOtp = true;
          this.onConfigChange();
          this.otptimer(0);
          this.toastr.error(reponse.result.message,"Notification",{
            toastClass: "custom-toast-error"
          });
        }
        this.loading = false;
      }, err => { this.loading = false; console.log('RegistrationComplete', err) });
    }
  }
  SignUpLoginWithWA(body) {
    this.loading = true;
    this.authService.SignUpLoginWithWA(body).subscribe(res => {
      if (res && res.loginType && (res.loginType == 1 || res.loginType == 4 || res.loginType == 6)) {
        //  Redirect to panel URL
        // this.panelForm.controls['UserName'].setValue(res.clientName);
        // this.panelForm.controls['Password'].setValue(res.access_token);
        // try {
        //   let el: HTMLElement = this.fileInput.nativeElement;
        //   el.click();
        // }
        // catch (ex) {
        //   console.log('Error:: Redirect to Panel URL', ex);
        // }
      } else if (res && res.loginType && res.loginType == 2) {
        // Redirect to Agent panel URL
        // this.agentForm.controls['UserName'].setValue(res.clientName);
        // this.agentForm.controls['Password'].setValue(res.access_token);
        // try {
        //   let el: HTMLElement = this.fileAgentInput.nativeElement;
        //   el.click();
        // }
        // catch (ex) {
        //   console.log('Error:: Redirect to Agent URL', ex);
        //  }
      } else {
        // nevigate on reset password if there is force reset password else redirect to home page.
        // if (res.resetPassword && res.resetPassword !== undefined && res.resetPassword === true) {
        //   this.UpdateUsernamePasswordIns.open();
        //   localStorage.setItem('token', JSON.stringify(res)); 
        // } else {
          this.sessionService.stopMarketHubConnection();
          localStorage.setItem('token', JSON.stringify(res));
          this.betService.setBetStatus(false);
          this.betService.setSelectedRunner().next();
          this.resetRouting();
          this.router.navigateByUrl('/home');
          this.removeOtplessScript();
        // }
      }
      this.loading = false;
    }, errorObj => {
      this.loading = false;
      this.toastr.error(errorObj.error,"Notification",{
        toastClass: "custom-toast-error"
      });
    });
  }
  resetRouting() {
    let routerConfig = setRoutesBasedOnRoles();
    this.router.resetConfig(routerConfig);
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
  onWhatsappClick() {
    if(apiEndPointData.data.isGoogleTagManagerEnable){
    const _currentSet ={
      'event': 'whatsapp_click'
      };
  this.dataLayerService.pingHome(_currentSet);
    }
    window.open(apiEndPointData.data.WhatsappURL, '_blank');
  }
  DemoLogin(){
    const body = {
      Captcha: this.DemologinForm.value.Captcha,
      RequestId: ""
    }
    this.demoloading = true;
    this.authService.DemoLogIn(body).subscribe(res => {
      if(res){
        if(apiEndPointData.data.isGoogleTagManagerEnable){
        const _currentSet ={
          'event': 'login',
          'phone': 'demologin'
        };
        this.dataLayerService.pingHome(_currentSet);
      }
        // (<any>window).dataLayer.push(_currentSet);
          this.sessionService.stopMarketHubConnection();
          localStorage.setItem('token', JSON.stringify(res));
          this.betService.setBetStatus(false);
          this.betService.setSelectedRunner().next();
          this.resetRouting();
          this.router.navigateByUrl('/home');
          this.demoloading = false;
        } else{
          this.captchaRef.execute();
        }
    }, errorObj => {
      this.demoloading = false;
      this.toastr.error(errorObj.error,"Notification",{
        toastClass: "custom-toast-error"
      });
    });
  }
  switchTab(tab: string) {
    this.activeTab = tab;
  }
  onSubmitRegisterByOTP(){
    if (this.registerByOTPForm.valid) {
      this.loading = true;
      const mobilectrl = this.registerByOTPForm.value.Mobile;
      const mobileNo = mobilectrl.dialCode + '' + mobilectrl.number;
      const number = mobileNo.replace(/\D/g, '');
      const body =    {
        "MobileNo": number,
        "ReferralCode": this.registerByOTPForm.value.referralCode,
        "Mktcode":  this.registerByOTPForm.value.mktcode,
        "clickID": this.click_id,
        "promoCode": this.registerByOTPForm.value.promoCode
    }
    this.b2cUserService.RegistrationWithOtp(body).pipe(catchError(err => throwError(err))).subscribe((response: any) => {
      if(response.isSuccess){
        localStorage.setItem('registrationtoken', JSON.stringify(response.result.token));
        this.toastr.success(response.result.message,"Notification",{
          toastClass: "custom-toast-success"
        });
        this.otpPageInstances.open();
        this.selectedCountryISO = mobilectrl.countryCode;
        this.UpdateMobileNoForm.controls["mobileNo"].clearValidators();
        this.UpdateMobileNoForm.controls['mobileNo'].setValue(mobilectrl.number);
        this.UpdateMobileNoForm.controls['mobileNo'].disable();
        this.otptimer(1);
    } else {
      this.toastr.error(response.result.message,"Notification",{
        toastClass: "custom-toast-error"
      });
    }
      this.loading = false;
 
    }, err => {this.loading = false;  console.log('verifyLoginByOTP', err) });
    } else {
      this.loading = false;
      Object.keys(this.registerByOTPForm.controls).forEach(field => {
        const control = this.registerByOTPForm.get(field);
        control.markAsTouched({ onlySelf: true });
      });
      if ((this.registerForm.value.Mobile == "" || this.registerForm.value.Mobile == null)) {
        this.numberrequiredvalidation = true;
      } else if (this.registerForm.controls['Mobile'].invalid) {
        this.numbervalidation = true;
      }
    }
 
  }
  mobileFocusOutFn1(event: any) {
    if (event.target.value != "" && event.target.value != null) {
      this.numberrequiredvalidation = false;
      if (event.target.value.length == 10) {
        this.numbervalidation = false;
        const mobileNo = this.registerByOTPForm.value.Mobile.dialCode + '' + this.registerByOTPForm.value.Mobile.number;
        var number = mobileNo.replace(/\D/g, '');
        this.b2cUserService.VerifyDetails(number, 3).pipe(catchError(err => throwError(err))).subscribe((reponse: any) => {
          this.isMobileValidate = reponse.isSuccess;
          if (reponse.isSuccess) {
            this.mobileValidationMsg = '';
          } else {
            this.mobileValidationMsg = reponse.result.message;
          }
        }, err => { this.isMobileValidate = false; console.log('VerifyDetails', err) });
      } else {
        this.numbervalidation = true;
      }
    } else if (event.target.value == "" || event.target.value == null) {
      this.numberrequiredvalidation = true;
    }
    this.RegisterTracing();
  }
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    if (apiEndPointData.data.isWALoginEnable) {
      this.removeOtplessScript();
    }
  }
}
