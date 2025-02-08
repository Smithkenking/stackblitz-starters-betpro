import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { B2cUserService } from '@clientApp-core/services/authentication/b2c-user.service';
import { apiEndPointData } from '@clientApp-core/services/config/connfig.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-email-verification',
  templateUrl: './email-verification.component.html',
  styleUrls: ['./email-verification.component.scss']
})
export class EmailVerificationComponent implements OnInit {
  token: any;
  isEmailverification: boolean = true;
  verificationMsg: string = '';
  isSuccess: boolean;
  lightLogoUrl = apiEndPointData.data.lightLogoUrl;
  constructor(private toastr: ToastrService,private b2cUserService: B2cUserService,
    private router: Router, private route: ActivatedRoute) {
    this.route.queryParams.subscribe(params => {
      if (params && params['token'] && params['token'] !== '') {
        this.token = params['token'];
        this.emailVerification();
      } else {
        this.router.navigateByUrl('/home');
      }
    });
  }

  ngOnInit(): void {
    this.lightLogoUrl = apiEndPointData.data.lightLogoUrl;
  }
  emailVerification() {
    this.b2cUserService.EmailVerification(this.token).subscribe(response => {
      this.isEmailverification = false;
      this.isSuccess = response.isSuccess;
        this.verificationMsg = response.result.message;
    });
  }
  reVerifyEmailVerification() {
    this.b2cUserService.ReEmailVerification(this.token).subscribe(response => {
      if (response.isSuccess) {
        this.toastr.success(response.result.message,"Notification",{
          toastClass: "custom-toast-success"
        });
      } else {
        this.toastr.error(response.result.message,"Notification",{
          toastClass: "custom-toast-error"
        });
      }
    });
  }
  onSignInClick() {
    this.router.navigate(['/home']);
  }
}
