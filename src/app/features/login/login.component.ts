import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild, ViewChildren } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, NavigationEnd, Router, RoutesRecognized } from '@angular/router';
import { Authenticate } from '@clientApp-core/models/auth/authentication.models';
import { AuthFacadeService } from '@clientApp-core/services/authentication/authentication-facade.service';
import { B2cUserService } from '@clientApp-core/services/authentication/b2c-user.service';
import { BetFacadeService } from '@clientApp-core/services/bet/bet.facade.service';
import { CommonService } from '@clientApp-core/services/common/common.service';
import { apiEndPointData } from '@clientApp-core/services/config/connfig.service';
import { SessionService } from '@clientApp-core/services/session/session.service';
import { onCasinoGameClickEvent } from '@clientApp-core/services/shared/dashboard-shared.service';
import { setRoutesBasedOnRoles } from '@clientApp-core/services/shared/routing.service';
import { AppMessage } from '@clientApp-core/utilities/app-configuration';
import { RecaptchaComponent } from 'ng-recaptcha';
import { ToastrService } from 'ngx-toastr';
import { Subscription, throwError } from 'rxjs';
import { catchError, filter, pairwise } from 'rxjs/operators';
import * as M from "materialize-css/dist/js/materialize";
import { ChangePasswordComponent } from '../change-password/change-password.component';
import { DeviceDetectorService } from 'ngx-device-detector';
import { DeviceInfoService } from '@clientApp-core/services/device-info/deviceinfo.services';
import { CountryISO, PhoneNumberFormat, SearchCountryField } from 'ngx-intl-tel-input';
import { LoginWith } from '@clientApp-core/enums/loginwith.types';
import { DataLayerService } from '@clientApp-core/services/window/DataLayerService.service';
import { FacebookLoginProvider } from '@abacritt/angularx-social-login';
import { SocialAuthService } from "@abacritt/angularx-social-login";
import { CasinoService } from '@clientApp-core/services/casino/casino.service';
import { HttpClient } from '@angular/common/http';
declare var $:any;
declare global {
  interface Window {
    otpless?: any;
  }
}
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, AfterViewInit, OnDestroy {
  loggedIn!: boolean;
  isShowGoogleCaptcha: any;
  sitekey: any;
  PanelUrl: any;
  agentpanelUrl: any;
  showPasswordVisibility: boolean = false;
  errorMessage = '';
  loginPopupImage: string;
  captchaImg = '';
  RequestId = ' ';
  loading: boolean;
  demoloading: boolean;
  IsShowSocialmediaIcon: any;
  socialmediaData = apiEndPointData.data;
  isCheckedDarkTheme: boolean = apiEndPointData.data.isDarkTheme ? apiEndPointData.data.isDarkTheme : false;
  isWALoginEnable = apiEndPointData.data.isWALoginEnable;
  isForgotPassword: boolean = false;
  isB2C: boolean;
  isSendOTP: boolean;
  click_id: any = '';
  referralcode: any = '';
  iswhatsapp: boolean;
  isfacebook: boolean;
  istelegram: boolean;
  isinstagram: boolean;
  istwitter: boolean;
  isyoutube: boolean;
  isResendOtp: boolean = false;
  resendOTPLimit: number = 0;
  displayotptimer: any
  interval: any
  forgotPasswordPageInstances: any;
  ForgotPasswordOTPForm: UntypedFormGroup;
  passwordPatterncheck = apiEndPointData.data.ap ? apiEndPointData.data.ap.split("::") : '';
  isFPPasswordSame: boolean = true;
  isOtpCheck: boolean = false;
  isResetPassword: boolean = true;
  private otplessInitialized = false;
  loginWith: number=1;
  loginForm = this.fb.group({
    UserName: ['', Validators.required],
    Password: ['', Validators.required],
    Captcha: ['', Validators.required],
    LoginWith: [this.loginWith],
    RememberMe: [false]
  });
  isGoogleCaptchaExpire: boolean;
  agentForm = this.fb.group({
    UserName: [''],
    Password: [''],
  });
  panelForm = this.fb.group({
    UserName: [''],
    Password: [''],
  });
  forgotPasswordForm = this.fb.group({
    UserName: ['', Validators.required]
  });
  DemologinForm = this.fb.group({
    Captcha: ['', Validators.required],
  });
  otpForm: UntypedFormGroup;
  formInput = ['input1', 'input2', 'input3', 'input4', 'input5', 'input6'];
  FPformInput = ['FPinput1', 'FPinput2', 'FPinput3', 'FPinput4', 'FPinput5', 'FPinput6'];

  selectedCountryISO = CountryISO.Pakistan;
  numbervalidation: boolean;
  numberrequiredvalidation: boolean;
  PhoneNumberFormat = PhoneNumberFormat;
  SearchCountryField = SearchCountryField;
  separateDialCode = false;
  Resetmail: boolean = false;
  PhonePacleHolder: string = 'Enter mobile number'; //'789XXXXXXX';
  CountryISO = CountryISO;
  preferredCountries: CountryISO[] = [CountryISO.UnitedStates, this.CountryISO.UnitedKingdom];
  onlyCountries: CountryISO[] = [CountryISO.Pakistan];
  previousUrl: string;
  showOtpComponent = true;
  otp: string;
  otplessModalRef: any;
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
  loginByOTPForm = this.fb.group({
    Mobile: ['', Validators.required],
  });
  otpSent: boolean = false;
  activeTab: string = 'password';
  private subscription: Subscription;
  @ViewChildren('formRow') rows: any;
  @ViewChild('btnexecute', { static: true }) btnexecute: ElementRef<HTMLElement>;
  @ViewChild('submitInput', { static: true }) fileInput: ElementRef<HTMLElement>;
  @ViewChild('resetpassword', { static: true }) resetpasswordRef: ChangePasswordComponent;
  @ViewChild('captchaRef', { static: false }) captchaRef: RecaptchaComponent;
  @ViewChild('submitAgentInput', { static: true }) fileAgentInput: ElementRef<HTMLElement>;
  @ViewChild('forgotPasswordPage', { static: true }) forgotPasswordPage: ElementRef;
  @ViewChildren('FPformRow') fprows: any;
  @ViewChild('otplessModal', { static: true }) otplessModal: ElementRef;
  constructor(public router: Router, private route: ActivatedRoute, private fb: UntypedFormBuilder, private sanitizer: DomSanitizer,
    public commonService: CommonService, private authService: AuthFacadeService,
    private betService: BetFacadeService, private sessionService: SessionService,private casinoService: CasinoService,
    private b2cUserService: B2cUserService, private toastr: ToastrService,private dataLayerService: DataLayerService,private http: HttpClient,private SocialAuthService: SocialAuthService) {  
    this.commonService.getDarkThemeStatus().subscribe(isChecked => {
      this.isCheckedDarkTheme = isChecked;
    });
    this.route.queryParams.subscribe(params => {
      if (params && params['mkt'] && params['mkt'] !== '' && apiEndPointData.data.isB2C) {  
        localStorage.setItem('mktset', JSON.stringify(params['mkt']));
        this.commonService.setCookieValue('mktset', JSON.stringify(params['mkt']), 30);
      } else if (params && params['click_id'] && params['click_id'] !== '' && apiEndPointData.data.isB2C) {
        this.click_id = params['click_id'];
      } else if (params && params['referralcode'] && params['referralcode'] !== '' && apiEndPointData.data.isB2C) {
         this.referralcode = params['referralcode'];
        this.commonService.setCookieValue('referralcodeset', JSON.stringify(params['referralcode']), 30);
      }
    });
    this.ForgotPasswordOTPForm = this.toForgotPaswdFormGroup(this.FPformInput);
    this.commonService.previousUrl$.subscribe((previousUrl: string) => {
      this.previousUrl = previousUrl;
    });
    const script = document.createElement('script');
    script.src = 'https://otpless.com/auth.js';
    script.id = 'otplessScriptId';
    if(apiEndPointData.data.cid){
      script.setAttribute('cid', apiEndPointData.data.cid);
    }
    if(apiEndPointData.data.isWALoginEnable){
      document.body.appendChild(script);
    }
    


    const otpless = (otplessUser: any) => {
      // alert(JSON.stringify(otplessUser))
      // console.log(JSON.stringify(otplessUser))
      // Additional code to handle otplessUser
      const waName = otplessUser.mobile.name;
      const waNumber = otplessUser.mobile.number;
      const body = {
        "waName": waName,
        "waNumber": waNumber,
        "promoCode": ""
      };
      this.SignUpLoginWithWA(body);
    };
    (window as any).otpless = otpless;
    this.otpForm = this.toFormGroup(this.formInput);
  }

  ngOnInit(): void {
    this.SocialAuthService.signOut();
    this.isWALoginEnable = apiEndPointData.data.isWALoginEnable;
    this.loginWith = apiEndPointData.data?.loginWith ? apiEndPointData.data.loginWith : 1;
    const darkThemeCurrentState = this.commonService.getCookieValue('isCheckedDarkTheme');
    this.isCheckedDarkTheme = (darkThemeCurrentState != null && darkThemeCurrentState != undefined && darkThemeCurrentState != '') ? JSON.parse(darkThemeCurrentState).isCheckedDarkTheme : false;
    this.isShowGoogleCaptcha = apiEndPointData.data.isgc;
    this.sitekey = apiEndPointData.data.sk;
    this.PanelUrl = apiEndPointData.data.pu;
    this.agentpanelUrl = apiEndPointData.data.au;
    this.isB2C = apiEndPointData.data.isB2C;
    this.isSendOTP = apiEndPointData.data.isSendOTP;
    this.IsShowSocialmediaIcon = apiEndPointData.data.issi;
    this.socialmediaData = apiEndPointData.data;
    this.iswhatsapp = apiEndPointData.data.wa ? true : false;
    this.isfacebook = apiEndPointData.data.fb ? true : false;
    this.istelegram = apiEndPointData.data.tg ? true : false;
    this.isinstagram = apiEndPointData.data.ig ? true : false;
    this.istwitter = apiEndPointData.data.tt ? true : false;
    this.isyoutube = apiEndPointData.data.yt ? true : false;
    this.isDemoLogin = apiEndPointData.data.isDemoLogin;
    if (!this.isShowGoogleCaptcha) {
      this.loginForm.get('Captcha').setValidators(Validators.required);
    }
    if(this.loginWith == LoginWith.Email){
      this.loginForm.get('UserName').setValidators([Validators.required,Validators.pattern("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,4}$")]);
    } else {
      this.loginForm.get('UserName').setValidators([Validators.required]);
    }
    this.loginPopupImage = this.commonService.imgRelativePath(apiEndPointData.data.loginPopupImage);
    this.openLoginModel();

    //     
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
  socialLoginWithGF(body) {
    this.loading = true;
    this.authService.SocialLogin(body).subscribe(response => {
      if(response.isSuccess){
        const res = response.result;
      if (res && res.loginType && (res.loginType == 1 || res.loginType == 4 || res.loginType == 6)) {
        //  Redirect to panel URL
        this.panelForm.controls['UserName'].setValue(res.clientName);
        this.panelForm.controls['Password'].setValue(res.access_token);
        try {
          let el: HTMLElement = this.fileInput.nativeElement;
          el.click();
        }
        catch (ex) {
          console.log('Error:: Redirect to Panel URL', ex);
        }
      } else if (res && res.loginType && res.loginType == 2) {
        // Redirect to Agent panel URL
        this.agentForm.controls['UserName'].setValue(res.clientName);
        this.agentForm.controls['Password'].setValue(res.access_token);
        try {
          let el: HTMLElement = this.fileAgentInput.nativeElement;
          el.click();
        }
        catch (ex) {
          console.log('Error:: Redirect to Agent URL', ex);
         }
      } else {
        if(apiEndPointData.data.isGoogleTagManagerEnable){
             const _currentSet ={
            'event': 'login',
            'phone': '+' + body.waNumber
          };
          this.dataLayerService.pingHome(_currentSet);
        }
          this.sessionService.stopMarketHubConnection();
          localStorage.setItem('token', JSON.stringify(res));
          this.betService.setBetStatus(false);
          this.betService.setSelectedRunner().next();
          this.resetRouting();
          const Deeplinked = localStorage.getItem('Deeplinked');
          if(Deeplinked != null && Deeplinked != undefined && Deeplinked != ''){
            this.router.navigateByUrl(Deeplinked);
          } else {
            this.router.navigateByUrl('/home');
          }
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
  ngAfterViewInit() {
    this.otplessModalRef =  M.Modal.init(this.otplessModal.nativeElement, {});
    this.getCaptcha();
    M.updateTextFields();
    this.forgotPasswordPageInstances = M.Modal.init(this.forgotPasswordPage.nativeElement, { dismissible: false });
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
      document.body.appendChild(script);  
      // const otplessInit = (window as any).otplessInit;
      // otplessInit?.();
  
      const otpless = (otplessUser: any) => {
        console.log(otplessUser);
        // Additional code to handle otplessUser
           const waName = otplessUser.mobile.name;
        const waNumber = otplessUser.mobile.number;
        const body = {
          "waName": waName,
          "waNumber": waNumber,
          "promoCode": ""
        };
        this.SignUpLoginWithWA(body);
      };
      (window as any).otpless = otpless;
      this.otplessInitialized = true;
  }
   
}
removeOtplessScript() {
  const otplessId = document.getElementById('otplessScriptId')
    if (otplessId) {
      document.body.removeChild(otplessId);
    }

  // const script = document.querySelector('script[src="https://otpless.com/auth.js"]');
  // if (script) {
  //   document.body.removeChild(script);
  // }
}
  openLoginModel() {
    this.isForgotPassword = false;
    this.errorMessage = '';
    this.loginForm.reset();
    this.setCookieValues();
    // this.captchaRef.execute();
  }
  onSubmit() {
    if (this.loginForm.valid) {
      this.errorMessage = '';
      if (this.loginForm.value.RememberMe) {
        let UserName = '';
        if(this.loginWith == LoginWith.Mobile){
          const mobilectrl = this.loginForm.value.UserName;
          const mobileNo = mobilectrl.dialCode + '' + mobilectrl.number;
          UserName = mobilectrl.number;   //mobileNo.replace(/\D/g, '');
          this.commonService.setCookieValue('countryCode', mobilectrl.countryCode);
        } else {
          UserName = this.loginForm.value.UserName;
        }
       
        this.commonService.setCookieValue('UserName', UserName);
        this.commonService.setCookieValue('Password', this.loginForm.value.Password);
        this.commonService.setCookieValue('RememberMe', this.loginForm.value.RememberMe);
        this.commonService.setCookieValue('LoginWith', this.loginWith.toString());
      }
      if (this.isShowGoogleCaptcha) {
        this.loading = true;
        this.postData();
      } else {
        this.postData();
      }
    } else {
      Object.keys(this.loginForm.controls).forEach(field => {
        const control = this.loginForm.get(field);
        control.markAsTouched({ onlySelf: true });
      });
      if (this.loginForm.value.Captcha === null || this.loginForm.value.Captcha === '') {
        this.captchaRef.execute();
      }
      if(this.loginWith == LoginWith.Mobile){
      if ((this.loginForm.value.UserName == "" || this.loginForm.value.UserName == null)) {
        this.numberrequiredvalidation = true;
      } else if (this.loginForm.controls['UserName'].invalid) {
        this.numbervalidation = true;
      }
    }
    }
  }
  postData() {
    this.errorMessage = '';
    this.loading = true;
    this.isGoogleCaptchaExpire = false;
    let UserName = '';
    if(this.loginWith == LoginWith.Mobile){
      const mobilectrl = this.loginForm.value.UserName;
      const mobileNo  = mobilectrl.dialCode + '' + mobilectrl.number;
      UserName = mobileNo.replace(/\D/g, '');
    } else {
      UserName = this.loginForm.value.UserName;
    }
    this.authService.LogIn$(UserName, this.loginForm.value.Password, this.loginForm.value.Captcha, this.RequestId, this.loginWith).subscribe(res => {
      if (res && res.loginType && (res.loginType == 1 || res.loginType == 4 || res.loginType == 6)) {
        //  Redirect to panel URL
        this.panelForm.controls['UserName'].setValue(res.clientName);
        this.panelForm.controls['Password'].setValue(res.access_token);
        try {
          let el: HTMLElement = this.fileInput.nativeElement;
          el.click();
        }
        catch (ex) {
          console.log('Error:: Redirect to Panel URL', ex);
        }

      } else if (res && res.loginType && res.loginType == 2) {
        // Redirect to Agent panel URL
        this.agentForm.controls['UserName'].setValue(res.clientName);
        this.agentForm.controls['Password'].setValue(res.access_token);
        try {
          let el: HTMLElement = this.fileAgentInput.nativeElement;
          el.click();
        }
        catch (ex) {
          console.log('Error:: Redirect to Agent URL', ex);
        }
      } else {
        // nevigate on reset password if there is force reset password else redirect to home page.
        if (res.resetPassword && res.resetPassword !== undefined && res.resetPassword === true) {
          this.resetpasswordRef.openPopup();
          localStorage.setItem('token', JSON.stringify(res));
        } else {
          if(apiEndPointData.data.isGoogleTagManagerEnable){
          const _currentSet ={
            'event': 'login',
            'phone': '+' + UserName,
          };
          this.dataLayerService.pingHome(_currentSet);
        }
          this.sessionService.stopMarketHubConnection();
          localStorage.setItem('token', JSON.stringify(res));
          this.commonService.selectedTab = 'Home';
          this.betService.setBetStatus(false);
          this.betService.setSelectedRunner().next();
          this.resetRouting();
          let currentUrl = this.previousUrl;
          const Deeplinked = localStorage.getItem('Deeplinked');
          const casinoData = JSON.parse(localStorage.getItem('casino'));
          if(Deeplinked != null && Deeplinked != undefined && Deeplinked != ''){
            this.router.navigateByUrl(Deeplinked);
          } else if (casinoData !== undefined && casinoData !== null) {
            this.onCasinoClick(casinoData);
          } else if (currentUrl !== null && currentUrl !== undefined && currentUrl !== '' && currentUrl !== '/home' &&
           currentUrl !== '/register' && currentUrl !== '/signup' && currentUrl !== '/login') {
            this.router.navigateByUrl(currentUrl);
          } else {
          this.router.navigateByUrl('/home');
          }
        }
        this.closeModal();
      }
      this.closeModal();
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
  OnRegisterClick() {
    this.closeModal();
    this.OnSignUpClick();
  }
  onBackToLoginClick() {
    this.loginForm.reset();
    this.forgotPasswordForm.reset();
    this.isForgotPassword = false;
    this.errorMessage = '';
    this.numbervalidation = false;
    this.numberrequiredvalidation = false;
    this.captchaRef.execute();
    this.setCookieValues();
  }
  OnSignUpClick() {
    if (this.click_id && this.referralcode) {
      this.router.navigate(['/signup'], { queryParams: { referralcode: this.referralcode, click_id: this.click_id } });
    } else if (this.click_id) {
      this.router.navigate(['/signup'], { queryParams: { click_id: this.click_id } });
    } else if (this.referralcode) {
      this.router.navigate(['/signup'], { queryParams: { referralcode: this.referralcode } });
    } else {
      this.router.navigate(['/signup']);
    }
  }
  OnForgotPasswordClick() {
    this.loginForm.reset();
    this.forgotPasswordForm.reset();
    this.isForgotPassword = true;
    this.errorMessage = '';
    this.numbervalidation = false;
    this.numberrequiredvalidation = false;
  }
  onSubmitForgotPasswordForm() {
    this.errorMessage = '';
    if (this.forgotPasswordForm.valid) {
      this.loading = true;
      let UserName = '';
      if(this.loginWith == LoginWith.Mobile){
        const mobilectrl = this.forgotPasswordForm.value.UserName;
        const mobileNo  = mobilectrl.dialCode + '' + mobilectrl.number;
        UserName = mobileNo.replace(/\D/g, '');
      } else {
        UserName = this.forgotPasswordForm.value.UserName;
      }
      const body={
        "UserName": UserName
      }
      this.b2cUserService.ForgotPasswordRequest(body).pipe(catchError(err => throwError(err))).subscribe((reponse: any) => {
        this.loading = false;
        if (reponse.isSuccess) {
          this.toastr.success(reponse.result.message,"Notification",{
            toastClass: "custom-toast-success"
          });
          this.forgotPasswordPageInstances.open();
          this.isResendOtp = false;
          this.otptimer(1);
        } else {
          this.toastr.error(reponse.result.message,"Notification",{
            toastClass: "custom-toast-error"
          });
        }
    }, errorObj => {
      this.loading = false;
      if (errorObj.status === 401) {
        this.errorMessage = errorObj.error;
      } else {
        this.errorMessage = AppMessage.serviceUnavailable;
      }
    });
    } else {
      this.loading = false;
      Object.keys(this.forgotPasswordForm.controls).forEach(field => {
        const control = this.forgotPasswordForm.get(field);
        control.markAsTouched({ onlySelf: true });
      });
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
  toFormGroup(elements) {
    const group: any = {};
    elements.forEach(key => {
      group[key] = new UntypedFormControl('', Validators.required)
    });
    return new UntypedFormGroup(group);
  }
  toForgotPaswdFormGroup(elements) {
    const group: any = {};
      group['Password'] = new UntypedFormControl('', [Validators.required, Validators.pattern(this.passwordPatterncheck[0])]),
      group['ConfirmPassword'] = new UntypedFormControl('', [Validators.required, Validators.pattern(this.passwordPatterncheck[0])])
    return new UntypedFormGroup(group);
  }
  compairFPNewConfirm() {
    const password = this.ForgotPasswordOTPForm.get('Password').value;
    const confirmPassword = this.ForgotPasswordOTPForm.get('ConfirmPassword').value;
    if((password != '' && password != null) && (confirmPassword != '' && confirmPassword != null)){
      this.isFPPasswordSame = confirmPassword && password === confirmPassword;
    } else {
      this.isFPPasswordSame = true;
    }
  }
  ForgotResetPassword() {
    if (this.ForgotPasswordOTPForm.valid && this.isFPPasswordSame && this.otp  && this.otp.length === 6) {
      let UserName = '';
      if(this.loginWith == LoginWith.Mobile){
        const mobilectrl = this.forgotPasswordForm.value.UserName;
        const mobileNo  = mobilectrl.dialCode + '' + mobilectrl.number;
        UserName = mobileNo.replace(/\D/g, '');
      } else {
        UserName = this.forgotPasswordForm.value.UserName;
      }
      const body = {
        "OTP": this.otp,
        "UserName": UserName,
        "Password": this.ForgotPasswordOTPForm.value.Password,
        "ConfirmPassword": this.ForgotPasswordOTPForm.value.ConfirmPassword
      };
      this.b2cUserService.ForgotResetPassword(body).pipe(catchError(err => throwError(err))).subscribe((reponse: any) => {
        if (reponse.isSuccess) {
          this.toastr.success(reponse.result.message,"Notification",{
            toastClass: "custom-toast-success"
          });
          this.forgotPasswordPageInstances.close();
          this.ForgotPasswordOTPForm.reset();
        } else {
          this.otptimer(0);
          this.isResendOtp = true;
          this.toastr.error(reponse.result.message,"Notification",{
            toastClass: "custom-toast-error"
          });
        }
        this.loading = false;
      }, err => {this.loading = false;  console.log('ForgotResetPassword', err) });
    } else {
      this.loading = false;
      Object.keys(this.ForgotPasswordOTPForm.controls).forEach(field => {
        const control = this.ForgotPasswordOTPForm.get(field);
        control.markAsTouched({ onlySelf: true });
      });
    }
  }
  FPkeyUpEvent(event, index) {
    let pos = index;
    if (event.keyCode === 8 && event.which === 8) {
      pos = index - 1 ;
      if (pos > -1 && pos < this.FPformInput.length && event.target.value.length == 0) {
        this.fprows._results[pos].nativeElement.focus();
      } else if(event.target.value.length == 1 && event.keyCode === 8 && event.which === 8){
        return event.target.value.slice(0, 1);
      }
    } else {
      if(event.target.value.length > 1){
        this.isOtpCheck = true;
          return event.target.value.slice(0, 1);
        } else if(event.target.value.length == 1)  {
          this.isOtpCheck = false;
          this.fprows._results[pos + 1]?.nativeElement.focus();
     }
    }
  }
  onResendOtpClick() {
    if(this.resendOTPLimit <= apiEndPointData.data.resendOTPLimit){
    this.resendOTPLimit = ++this.resendOTPLimit;
    this.onConfigChange();
    this.isResendOtp = false;
    let number = '',UserName='',OtpType ='';
        if(this.loginWith == LoginWith.Mobile){
          const mobilectrl = this.forgotPasswordForm.value.UserName;
          const mobileNo  = mobilectrl.dialCode + '' + mobilectrl.number;
          UserName = mobileNo.replace(/\D/g, '');
        } else {
          UserName = this.forgotPasswordForm.value.UserName;
        }
        OtpType = 'FP';
    this.b2cUserService.SendWhatappOTP(number,OtpType,UserName).pipe(catchError(err => throwError(err))).subscribe((reponse: any) => {
      if (reponse.status) {
        this.otptimer(1);
        this.toastr.success(reponse.msg),"Notification",{
          toastClass: "custom-toast-success"
        };
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
  socialmedia(value: any) {
    if (value == 'facebook') {
      window.open(apiEndPointData.data.fb, '_blank');
    } else if (value == 'instagram') {
      window.open(apiEndPointData.data.ig, '_blank');
    } else if (value == 'telegram') {
      window.open(apiEndPointData.data.tg, '_blank');
    } else if (value == 'twitter') {
      window.open(apiEndPointData.data.tt, '_blank');
    } else if (value == 'whatsapp') {
      window.open(apiEndPointData.data.wa, '_blank');
    } else if (value == 'youtube') {
      window.open(apiEndPointData.data.yt, '_blank');
    }
  }
  setCookieValues() {
    if (this.commonService.getCookieValue('RememberMe')) {
      const lw = this.commonService.getCookieValue('LoginWith');
      if(this.loginWith !== +lw){
        this.commonService.deleteCookieValue('RememberMe');
        this.commonService.deleteCookieValue('countryCode');
        this.commonService.deleteCookieValue('Password');
        this.commonService.deleteCookieValue('RememberMe');
        this.commonService.deleteCookieValue('LoginWith');
      } else {
        if(this.loginWith == LoginWith.Mobile){
          const countryCode:any = this.commonService.getCookieValue('countryCode');
          this.selectedCountryISO = countryCode;
        }
        this.loginForm.controls['UserName'].setValue(this.commonService.getCookieValue('UserName'));
        this.loginForm.controls['Password'].setValue(this.commonService.getCookieValue('Password'));
        this.loginForm.controls['RememberMe'].setValue(this.commonService.getCookieValue('RememberMe'));
      }
      
    }
  }
  closeModal() {
    localStorage.removeItem('casino');
  }
  getCaptcha() {
    if (this.isShowGoogleCaptcha) {
      this.captchaRef.execute();
    } else {
      this.authService.getCaptchaCode().subscribe((x: any) => { this.captchaImg = x.item1; this.RequestId = x.item2; this.loading = false; });
    }
  }
  getCaptchaCodeImg() {
    return this.sanitizer.bypassSecurityTrustResourceUrl('data:image/png;base64, ' + this.captchaImg);
  }
  resolved(captchaResponse: string) {
    if (this.isShowGoogleCaptcha) {
      this.loginForm.controls['Captcha'].setValue(captchaResponse);
      this.DemologinForm.controls['Captcha'].setValue(captchaResponse);
      if (this.isGoogleCaptchaExpire) {
        this.postData();
      }
    }
  }
  resetRouting() {
    let routerConfig = setRoutesBasedOnRoles();
    this.router.resetConfig(routerConfig);
  }
  SignUpLoginWithWA(body) {
    this.loading = true;
    this.authService.SignUpLoginWithWA(body).subscribe(res => {
      if (res && res.loginType && (res.loginType == 1 || res.loginType == 4 || res.loginType == 6)) {
        //  Redirect to panel URL
        this.panelForm.controls['UserName'].setValue(res.clientName);
        this.panelForm.controls['Password'].setValue(res.access_token);
        try {
          let el: HTMLElement = this.fileInput.nativeElement;
          el.click();
        }
        catch (ex) {
          console.log('Error:: Redirect to Panel URL', ex);
        }
      } else if (res && res.loginType && res.loginType == 2) {
        // Redirect to Agent panel URL
        this.agentForm.controls['UserName'].setValue(res.clientName);
        this.agentForm.controls['Password'].setValue(res.access_token);
        try {
          let el: HTMLElement = this.fileAgentInput.nativeElement;
          el.click();
        }
        catch (ex) {
          console.log('Error:: Redirect to Agent URL', ex);
         }
      } else {
          if(apiEndPointData.data.isGoogleTagManagerEnable){
          const _currentSet ={
            'event': 'login',
            'phone': '+' + body.waNumber
          };
          this.dataLayerService.pingHome(_currentSet);
        }
          // (<any>window).dataLayer.push(_currentSet);
          this.sessionService.stopMarketHubConnection();
          localStorage.setItem('token', JSON.stringify(res));
          this.betService.setBetStatus(false);
          this.betService.setSelectedRunner().next();
          this.resetRouting();
          const Deeplinked = localStorage.getItem('Deeplinked');
          if(Deeplinked != null && Deeplinked != undefined && Deeplinked != ''){
            this.router.navigateByUrl(Deeplinked);
          } else {
            this.router.navigateByUrl('/home');
          }
          
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
  DemoLogin(){
    const body = {
      Captcha: this.DemologinForm.value.Captcha,
      RequestId: this.RequestId
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
  sendOTP() {
    this.otpSent = true;
  }
  onSubmitLoginByOTP(){
    this.errorMessage = '';
    if (this.loginByOTPForm.valid) {
      this.loading = true;
      this.otpForm = this.toFormGroup(this.formInput);
      let number = '',UserName='',OtpType ='';
      OtpType = 'LOG';
      const mobilectrl = this.loginByOTPForm.value.Mobile;
      const mobileNo = mobilectrl.dialCode + '' + mobilectrl.number;
      number = mobileNo.replace(/\D/g, '');
  this.b2cUserService.SendWhatappOTP(number,OtpType,UserName).pipe(catchError(err => throwError(err))).subscribe((reponse: any) => {
    if (reponse.status) {
      this.otpSent = true;
      this.isResendOtp = false;
      this.otptimer(1);
      this.toastr.success(reponse.msg,"Notification",{
        toastClass: "custom-toast-success"
      });
    } else {
      this.otpSent = false;
      this.otptimer(0);
      this.isResendOtp = true;
      this.toastr.error(reponse.msg,"Notification",{
        toastClass: "custom-toast-error"
      });
    }
    this.loading = false;
  }, err => { this.isResendOtp = true; console.log('SendWhatappOTP', err) });
    } else {
      this.loading = false;
      Object.keys(this.loginByOTPForm.controls).forEach(field => {
        const control = this.loginByOTPForm.get(field);
        control.markAsTouched({ onlySelf: true });
      });
      if ((this.loginByOTPForm.value.Mobile == "" || this.loginByOTPForm.value.Mobile == null)) {
        this.numberrequiredvalidation = true;
      } else if (this.loginByOTPForm.controls['Mobile'].invalid) {
        this.numbervalidation = true;
      }
    }
  }
  verifyLoginByOTP() {
    if (this.otpForm.valid && this.loginByOTPForm.valid) {
      this.loading = true;
      const mobilectrl = this.loginByOTPForm.value.Mobile;
      const mobileNo = mobilectrl.dialCode + '' + mobilectrl.number;
      const number = mobileNo.replace(/\D/g, '');
      let otp = this.otpForm.value.input1 + '' + this.otpForm.value.input2 + '' + this.otpForm.value.input3 + '' + this.otpForm.value.input4 + '' + this.otpForm.value.input5 + '' + this.otpForm.value.input6;
      const body = {"Mobile":number,"OTP":otp,"OtpType":"LOG"}
      this.b2cUserService.loginWithOtpRequest(body).pipe(catchError(err => throwError(err))).subscribe((data: any) => {
        if(data.isSuccess){
        const res = data.result;
        if (res && res.loginType && (res.loginType == 1 || res.loginType == 4 || res.loginType == 6)) {
          //  Redirect to panel URL
          this.panelForm.controls['UserName'].setValue(res.clientName);
          this.panelForm.controls['Password'].setValue(res.access_token);
          try {
            let el: HTMLElement = this.fileInput.nativeElement;
            el.click();
          }
          catch (ex) {
            console.log('Error:: Redirect to Panel URL', ex);
          }
  
        } else if (res && res.loginType && res.loginType == 2) {
          // Redirect to Agent panel URL
          this.agentForm.controls['UserName'].setValue(res.clientName);
          this.agentForm.controls['Password'].setValue(res.access_token);
          try {
            let el: HTMLElement = this.fileAgentInput.nativeElement;
            el.click();
          }
          catch (ex) {
            console.log('Error:: Redirect to Agent URL', ex);
           }
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
            let currentUrl = this.previousUrl;
            const Deeplinked = localStorage.getItem('Deeplinked');
            const casinoData = JSON.parse(localStorage.getItem('casino'));
            if(Deeplinked != null && Deeplinked != undefined && Deeplinked != ''){
              this.router.navigateByUrl(Deeplinked);
            } else if (casinoData !== undefined && casinoData !== null) {
              this.onCasinoClick(casinoData);
            } else if (currentUrl !== null && currentUrl !== undefined && currentUrl !== '' && currentUrl !== '/home' &&
             currentUrl !== '/register' && currentUrl !== '/signup' && currentUrl !== '/login') {
              this.router.navigateByUrl(currentUrl);
            } else {
            this.router.navigateByUrl('/home');
            }
        }
      } else {
        this.toastr.error(data.result.message,"Notification",{
          toastClass: "custom-toast-error"
        });
      }
        this.loading = false;
   
      }, err => {this.loading = false;  console.log('verifyLoginByOTP', err) });
    } else {
      this.loading = false;
      Object.keys(this.ForgotPasswordOTPForm.controls).forEach(field => {
        const control = this.ForgotPasswordOTPForm.get(field);
        control.markAsTouched({ onlySelf: true });
      });
    
    }
  }
  keyUpEvent(event, index) {
    let pos = index;
    if (event.keyCode === 8 && event.which === 8) {
      pos = index - 1 ;
      if (pos > -1 && pos < this.formInput.length && event.target.value.length == 0) {
        this.rows._results[pos].nativeElement.focus();
      } else if(event.target.value.length == 1 && event.keyCode === 8 && event.which === 8){
        return event.target.value.slice(0, 1);
      }
    } else {
      if(event.target.value.length > 1){
        this.isOtpCheck = true;
        return event.target.value.slice(0, 1);
      } else if(event.target.value.length == 1) {
        this.isOtpCheck = false;
        this.rows._results[pos + 1]?.nativeElement.focus();
      }
    }

}
  mobileFocusOutFn(event: any) {
    if (event.target.value != "" && event.target.value != null) {
      this.numberrequiredvalidation = false;
      if (event.target.value.length == 10) {
        this.numbervalidation = false;
      } else {
        this.numbervalidation = true;
      }
    } else if (event.target.value == "" || event.target.value == null) {
      this.numberrequiredvalidation = true;
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
  onCasinoClick(param) {
    this.commonService.setLoadingStatus(true);
    this.casinoService.getCasinoToken(param);
    let selectedCasino = [];
    const CasinoObj = new Object({
      id:param.angularCasinoGameId,
      type:'Casino',
      date: new Date()
    });
    if (this.commonService.getCookieValue('selected_match_name')) {
      var getCasinoCookie = JSON.parse(this.commonService.getCookieValue('selected_match_name'));
    }
  
    if (getCasinoCookie != null) {
      selectedCasino = getCasinoCookie;
    }
  
    selectedCasino.push(CasinoObj);
    this.commonService.setCookieValue('selected_match_name', JSON.stringify(selectedCasino));
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    if (apiEndPointData.data.isWALoginEnable) {
      this.removeOtplessScript();
    }
  }
}
