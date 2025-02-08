import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { BonusService } from '@clientApp-core/services/authentication/bonus.service';
import { CommonService } from '@clientApp-core/services/common/common.service';
import { ToastrService } from 'ngx-toastr';
import { of, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import * as M from "materialize-css/dist/js/materialize";
import { WalletType } from '@clientApp-core/enums/WalletType';
import { BetFacadeService, clientBalance } from '@clientApp-core/services/bet/bet.facade.service';
import { ActivatedRoute } from '@angular/router';
@Component({
  selector: 'app-wager-list',
  templateUrl: './wager-list.component.html',
  styleUrls: ['./wager-list.component.scss']
})
export class WagerListComponent implements OnInit, AfterViewInit {
  @ViewChild('wagerTable', { static: true }) wagerTable;
  @ViewChild('wbl', { static: true }) wblModal: ElementRef;
  @ViewChild('allBetListWalletWise', { static: true }) allBLWWModal: ElementRef;
  bonusList: any[] = [];
  activeWagerList: any[] = [];
  inActiveWagerList: any[] = [];
  activeTab: string = 'active';
  demoBonusList: any = [];
  WagerBetListDetails = [];
  wblModalInstances: any;
  isLiabilityBetDetails: boolean = false;
  iswager: boolean = true;
  allBetListWalletWiseData: any[] = [];
  allBetListWalletWiseInstances: any;
  clientBalance: any;
  constructor(private bonusService: BonusService, private toastr: ToastrService, private route: ActivatedRoute,
    public commonService: CommonService, public betService: BetFacadeService) {
  }

  ngOnInit(): void {
    this.getWagerList();
    this.clientBalance = clientBalance;
    this.betService.checkBalanceAndWallet$().pipe(
      switchMap((resp) => {
        return of(resp);
      }
      )
    ).subscribe(value => {
      this.clientBalance = value.clientBalance;
    });
  }
  getWagerList() {
    this.bonusService.getWagerList().pipe(catchError(err => throwError(err))).subscribe((reponse: any) => {
      if (reponse.isSuccess && reponse.result) {
        const wagerList = (reponse.result).map(v => ({ ...v, isSlideToggle: false }));
        this.bonusList = wagerList.filter(x => x.wteid == WalletType.Normal);
        this.demoBonusList = wagerList.filter(x => x.wteid == WalletType.DemoBonus);
        this.activeWagerList = wagerList.filter(x => !x.isexp && !x.rdm && x.wteid == WalletType.Wager);
        this.inActiveWagerList = wagerList.filter(x => (x.isexp || x.rdm) && x.wteid == WalletType.Wager);
      }
    }, err => console.log('getWagerList', err));
  }
  ngAfterViewInit(): void {
    this.wblModalInstances = M.Modal.init(this.wblModal.nativeElement, {});
    this.allBetListWalletWiseInstances = M.Modal.init(this.allBLWWModal.nativeElement, {});
  }
  RedeemRequest(wid) {
    this.bonusService.redeemWager(wid).pipe(catchError(err => throwError(err))).subscribe((reponse: any) => {
      if (reponse.isSuccess) {
        this.toastr.success(reponse.result, "Notification", {
          toastClass: "custom-toast-success"
        });
        this.getWagerList();
      } else {
        this.toastr.error(reponse.result, "Notification", {
          toastClass: "custom-toast-error"
        });
      }
    }, err => { console.log('redeemWager', err) });
  }
  GetWagerBetListDetails(item) {
    if (item.wam > 0) {
      this.commonService.setLoadingStatus(true);
      this.bonusService.GetWagerBetListDetails(item.wid, item.iswager).pipe(catchError(err => throwError(err))).subscribe((reponse: any) => {
        if (reponse.isSuccess) {
          this.iswager = item.iswager;
          this.WagerBetListDetails = reponse.result;
          this.isLiabilityBetDetails = false;
          this.wblModalInstances.open();
        } else {
          this.toastr.error(reponse.result, "Notification", {
            toastClass: "custom-toast-error"
          });
        }
        this.commonService.setLoadingStatus(false);
      }, err => { this.commonService.setLoadingStatus(false); console.log('GetWagerBetListDetails', err) });
    }
  }
  GetWagerBetLiabilityDetails(item) {
    if (item.lb != 0) {
      this.commonService.setLoadingStatus(true);
      this.bonusService.GetWagerBetLiabilityDetails(item.wid).pipe(catchError(err => throwError(err))).subscribe((reponse: any) => {
        if (reponse.isSuccess) {
          this.WagerBetListDetails = reponse.result;
          this.isLiabilityBetDetails = true;
          this.wblModalInstances.open();
        } else {
          this.toastr.error(reponse.result, "Notification", {
            toastClass: "custom-toast-error"
          });
        }
        this.commonService.setLoadingStatus(false);
      }, err => { this.commonService.setLoadingStatus(false); console.log('GetWagerBetLiabilityDetails', err) });
    }
  }
  GetAllBetListWalletWise(item) {
    this.commonService.setLoadingStatus(true);
    this.bonusService.GetAllBetListWalletWise(item.wid, item.iswager).pipe(catchError(err => throwError(err))).subscribe((reponse: any) => {
      if (reponse.isSuccess) {
        this.allBetListWalletWiseData = reponse.result;
        this.allBetListWalletWiseInstances.open();
      }
      this.commonService.setLoadingStatus(false);
    }, err => { this.commonService.setLoadingStatus(false); console.log('GetAllBetListWalletWise', err) });
  }
  transformtValue(value) {
    return Math.abs(value)
  }
  public get WalletType() {
    return WalletType;
  }
  isEmpty(obj: any) {
    for (var key in obj) {
      if (obj.hasOwnProperty(key))
        return false;
    }
    return true;
  }
  SlideToggle(item) {
    item.isSlideToggle = !item.isSlideToggle;
  }

  switchTab(tab: string) {
    this.activeTab = tab;
  }
  ngOnDestroy() {

  }

}
