import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthFacadeService } from '@clientApp-core/services/authentication/authentication-facade.service';
import { apiEndPointData } from '@clientApp-core/services/config/connfig.service';
import { setRoutesBasedOnRoles } from '@clientApp-core/services/shared/routing.service';
import { RecaptchaComponent } from 'ng-recaptcha';

@Component({
  selector: 'app-authentication',
  templateUrl: './authentication.component.html',
  styleUrls: ['./authentication.component.scss']
})
export class AuthenticationComponent implements OnInit,AfterViewInit, OnDestroy {
  loading: boolean = true;
  sitekey = apiEndPointData.data.sk;
  isGoogleCaptchaExpire: any;
  Captcha:any
  loginWith = 1;
  UserName:any
  Password:any
  @ViewChild('captchaRef', { static: false }) captchaRef: RecaptchaComponent;
  constructor(private router: Router,private activatedRoute: ActivatedRoute,private authService: AuthFacadeService,) {
   }

  ngOnInit(): void {
    this.sitekey = apiEndPointData.data.sk;
    this.loginWith = apiEndPointData.data?.loginWith ? apiEndPointData.data.loginWith : 1;
    this.activatedRoute.queryParams.subscribe(params => {
      this.UserName = params['username'];
      this.Password = params['password'];
      if (this.UserName && this.Password) {
        this.postData(this.UserName,this.Password)
    } else {
      this.router.navigate(['/home']);
    }
    });
  }
  ngAfterViewInit(): void {
    this.captchaRef.execute();
  }
  resolved(captchaResponse: string) {
      this.Captcha = captchaResponse;
      if (this.isGoogleCaptchaExpire) {
        this.postData(this.UserName,this.Password);
      }
  }
  postData(UserName,Password){
    if(this.Captcha && this.Captcha.length > 0){
      this.authService.LogIn$(UserName, Password, this.Captcha, '', this.loginWith).subscribe(res => {
        if (res && res.loginType && (res.loginType == 1 || res.loginType == 4 || res.loginType == 6)) {
          //  Redirect to panel URL
        } else {
            localStorage.setItem('token', JSON.stringify(res));
            let routerConfig = setRoutesBasedOnRoles();
            this.router.resetConfig(routerConfig);
            this.router.navigateByUrl('/home');
          }
        this.loading = false;
      }, errorObj => {
        this.loading = false;
        if (errorObj.status === 401) {
          if (errorObj.error === "your google captcha token has expired so please try again!") {
            this.isGoogleCaptchaExpire = true;
            this.captchaRef.execute();
            this.loading = true;
          } else {
          }
        } else {
        }
    
      });
    } else {
      this.isGoogleCaptchaExpire = true;
    }
    
  }
  ngOnDestroy() {
  }

}
