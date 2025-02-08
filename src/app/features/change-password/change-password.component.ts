import { AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { ChangePaswordFacadeService } from '@clientApp-core/services/change-password/change-password-facade.service';
import { ToastrService } from 'ngx-toastr';
import { apiEndPointData } from '@clientApp-core/services/config/connfig.service';
import { take } from 'rxjs/operators';
import * as M from "materialize-css/dist/js/materialize";
import { CommonService } from '@clientApp-core/services/common/common.service';
import { SharedModule } from '@clientApp-shared/shared.module';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss']
})
export class ChangePasswordComponent implements OnInit, AfterViewInit {
  @Input() isResetPassword: boolean;
  @ViewChild('changePassw', { static: true }) template: ElementRef;
  changePassModalInstances: any;
  changePassword: UntypedFormGroup;
  isPasswordSame: boolean = true;
  isPasswordSameToOld: boolean = false;
  loading: boolean = false;
  showOPEye: boolean = false;
  showNPEye: boolean = false;
  showCPEye: boolean = false;
  passwordPattern: any;
  constructor(private formBuilder: UntypedFormBuilder,
    private changePasswordService: ChangePaswordFacadeService,
    private toastr: ToastrService, public commonService: CommonService) { }

  ngOnInit(): void {
    this.init();
  }
  ngAfterViewInit() {
    this.changePassModalInstances = M.Modal.init(this.template.nativeElement, {});
  }
  openPopup() {
    this.changePassModalInstances.open();
  }
  onSubmit() {
    this.loading = true;
    if (this.changePassword.valid && this.isPasswordSame && this.isPasswordSameToOld === false) {
      this.changePasswordService.savePassword$(this.changePassword.value).pipe(take(1)).subscribe((response: any) => {
        if (response.statusCode === 200) {
          response.isSuccess ? this.toastr.success(response.result, "Notification", {
            toastClass: "custom-toast-success"
          }) : this.toastr.error(response.result, "Notification", {
            toastClass: "custom-toast-error"
          });
          this.init();
          this.deleteCookie();
          this.reset('close');
        }
        this.loading = false;
      });
    } else {
      Object.keys(this.changePassword.controls).forEach(field => {
        const control = this.changePassword.get(field);
        control.markAsTouched({ onlySelf: true });
      });
      this.loading = false;
    }
  }
  compairNewConfirm() {
    const password = this.changePassword.get('password').value;
    const confirmPassword = this.changePassword.get('confirmPassword').value;
    const oldPassword = this.changePassword.get('oldPassword').value;
    this.isPasswordSame = confirmPassword && password === confirmPassword;
    this.isPasswordSameToOld = oldPassword && password === oldPassword;
  }
  compairOldNew() {
    const oldPassword = this.changePassword.get('oldPassword').value;
    const password = this.changePassword.get('password').value;
    this.isPasswordSameToOld = oldPassword && password === oldPassword;
  }
  reset(val) {
    this.init();
    if (val === 'close') {
      this.changePassModalInstances.close();
    }
  }
  private init() {
    const passwordPatterns = apiEndPointData.data.passwordPattern ? apiEndPointData.data.passwordPattern : [];
    this.passwordPattern = apiEndPointData.data.ap ? apiEndPointData.data.ap.split("::") : '';
    this.changePassword = this.formBuilder.group({
      oldPassword: ['', { validators: [Validators.required, Validators.minLength(6)] }],
      password: ['', { validators: [Validators.required, Validators.minLength(6)] }],
      confirmPassword: ['', { validators: [Validators.required, Validators.minLength(6)] }]
    });
  }
  deleteCookie() {
    this.commonService.deleteCookieValue('UserName');
    this.commonService.deleteCookieValue('Password');
    this.commonService.deleteCookieValue('RememberMe');
  }
}
