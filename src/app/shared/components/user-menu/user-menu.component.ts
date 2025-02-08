import { AfterViewInit, Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AuthFacadeService, websiteSettings } from '@clientApp-core/services/authentication/authentication-facade.service';
import { CommonService } from '@clientApp-core/services/common/common.service';
import { StoreService } from '@clientApp-core/services/store/store.service';
import { untilDestroyed } from 'ngx-take-until-destroy';
import { of, throwError } from 'rxjs';
import { catchError, switchMap, take } from 'rxjs/operators';
import { BetFacadeService } from '@clientApp-core/services/bet/bet.facade.service';
import { MarketRateFacadeService } from '@clientApp-core/services/market/market-rates/market-rate-facade.service';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@clientApp-shared/shared.module';
import { ToastrService } from 'ngx-toastr';
import { ChangePasswordComponent } from 'app/features/change-password/change-password.component';
import { DepositComponent } from 'app/features/deposit/deposit.component';
import { LiabilityComponent } from '../liability/liability.component';

@Component({
  standalone: true,
  selector: 'app-user-menu',
  templateUrl: './user-menu.component.html',
  styleUrls: ['./user-menu.component.scss'],
  imports: [CommonModule, SharedModule, ChangePasswordComponent, DepositComponent, LiabilityComponent]
})
export class UserMenuComponent implements OnInit, AfterViewInit, OnChanges, OnDestroy {
  @Input() isWeb?: boolean;
  isB2C: boolean;
  user: any;
  account: any;
  @ViewChild('changePassw', { static: true }) changepasswordRef: ChangePasswordComponent;
  @ViewChild('ConfirmModal', { static: true }) ConfirmModal: DepositComponent;
  @ViewChild('liability', { static: true }) liability: LiabilityComponent;

  constructor(private authService: AuthFacadeService, public storeService: StoreService, private marketRateFacadeService: MarketRateFacadeService,
    private router: Router, public commonService: CommonService, public betService: BetFacadeService, private toastr: ToastrService) { }

  ngOnInit(): void {
    this.isB2C = websiteSettings.data.isB2C;
    this.user = JSON.parse(localStorage.getItem('token'));
    this.getConfig();
    this.betService.checkBalanceAndWallet$().pipe(
      switchMap((resp) => {
        return of(resp);
      }
      )
    ).subscribe(value => {
      this.account = value.clientBalance;
    });
    this.marketRateFacadeService.getBalance$().subscribe((data: any) => {
      const balance = data && data.length > 0 ? data[0].appBalance : null;
      if (balance !== null && balance !== undefined && balance >= 0) {
        this.account.balance = balance;;
      }
      const withdrawableAmount = data && data.length > 0 ? data[0].appWithdrawableAmount : null;
      if (withdrawableAmount !== null && withdrawableAmount !== undefined && withdrawableAmount >= 0) {
        this.account.withdrawableAmount = withdrawableAmount;
      }
    });
  }
  ngAfterViewInit(): void {
  }
  ngOnChanges(changes: SimpleChanges): void {
    this.user = JSON.parse(localStorage.getItem('token'));
  }
  getConfig() {
    this.authService.getConfig$()
      .pipe(
        untilDestroyed(this), take(1),
        catchError(err => throwError(err))
      ).subscribe(response => {
        if (response) {
          this.isB2C = websiteSettings.data.isB2C;
          this.user = JSON.parse(localStorage.getItem('token'));
        }
      }, err => console.log('getConfig', err));
  }
  onLogOut() {
    this.authService.LogOut$();
    this.storeService.clearStore();
  }
  redirectTo(path) {
    if (websiteSettings.data.isReportPageOpenInNewTab) {
      let newRelativeUrl = this.router.createUrlTree([path]);
      let baseUrl = window.location.href.replace(this.router.url, '');
      window.open(baseUrl + newRelativeUrl, '_blank');
    } else {
      this.commonService.setCasinoOpenStatus(false);
      this.router.navigateByUrl(path);
    }
  }
  onUserMenuClick() {
    if (this.isB2C) {
      this.router.navigateByUrl('/user-profile');
    }
  }
  changePswdClick() {
    this.changepasswordRef.openPopup();

    // const token = JSON.parse(localStorage.getItem('token'));
    // if (websiteSettings.data.demoLoginUserName != token.clientName) {
    //   this.changepasswordRef.openPopup();
    // } else {
    //   this.toastr.error('You are not allowed to access this page', "Notification", {
    //     toastClass: "custom-toast-error"
    //   });
    // }
  }
  offerClick() {
    this.ConfirmModal.openPop();
  }
  openliability() {
    this.liability.openPopup();
  }
  ngOnDestroy(): void {

  }
}
