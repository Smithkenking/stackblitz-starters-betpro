import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { B2cUserService, userProfileInfo } from '@clientApp-core/services/authentication/b2c-user.service';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import * as M from "materialize-css/dist/js/materialize";
import { UntypedFormBuilder, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { CommonService } from '@clientApp-core/services/common/common.service';
import { AuthFacadeService, websiteSettings } from '@clientApp-core/services/authentication/authentication-facade.service';
import { BetFacadeService } from '@clientApp-core/services/bet/bet.facade.service';
import { MarketRateFacadeService } from '@clientApp-core/services/market/market-rates/market-rate-facade.service';
import { DeviceInfoService } from '@clientApp-core/services/device-info/deviceinfo.services';
import { ActivatedRoute } from '@angular/router';
import { BonusService } from '@clientApp-core/services/authentication/bonus.service';
import { WalletType } from '@clientApp-core/enums/WalletType';
import { DataLayerService } from '@clientApp-core/services/window/DataLayerService.service';
declare var $: any;
@Component({
  selector: 'app-withdraw',
  templateUrl: './withdraw.component.html',
  styleUrls: ['./withdraw.component.scss']
})
export class WithdrawComponent implements OnInit,AfterViewInit, OnDestroy {
  KYCStatus: string;
  DeclineKYCStatus: string;
  getdocumentImg: any;
  documentno: string;
  documentname: string;
  bankDetails: any = [];
  bankList = [];
  documentTypes = [];
  isUpdateKYC: boolean = false;
  documentType = 1;
  documentName = '';
  isdocumentcheck: boolean = false;
  isRequiredDocumentCtrl: boolean = false;
  loading = false;
  iswithdrawminmax: boolean = false;
  holdername: string;
  bankname: string;
  accountno: string;
  ifsccode: string;
  isAddBankDetail: boolean = false;
  isBankDetail: boolean = true;
  bankDetailId = 0;
  Amountminmax: any = {};
  hidewithdrawrequest: boolean = false;
  imageError: any;
  userProfile: any;
  emailVerificationModalInstances: any;
  selectedBank: any;
  removeBankModalInstances: any;
  deativeBankDetailId: any = null;
  document1Img: any;
  document2Img: any;
  imageError2: any;
  isShowCampaignMsg: boolean = false;
  isWithdraweligibleAmount:any;
  withdrawModel = { option: 'Bank' };
  isKYCRequired: boolean;
  KYCForm = this.fb.group({
    documentType: ['', Validators.required],
    documentNo: ['', Validators.required],
    document: ['', Validators.required],
    document1: [''],
  });
  withdrawForm = this.fb.group({
    amount: ['', Validators.required],
    bankDetailId: ['', Validators.required],
  });
  addBankDetailForm = this.fb.group({
    bankName: ['', Validators.required],
    accountNo: ['', Validators.required],
    ifsc: ['', Validators.required],
    accountHolderName: ['', Validators.required],
    appIsUpi: [false],
    appIsCrypto:[false]
  });
  @ViewChild('emailVerification', { static: true }) emailVerification: ElementRef;
  @ViewChild('removeBank', { static: true }) removeBank: ElementRef;
  constructor(private toastr: ToastrService, public commonService: CommonService,  private b2cUserService: B2cUserService, private fb: UntypedFormBuilder,
    public authFacadeService: AuthFacadeService,  public betService: BetFacadeService,private route: ActivatedRoute,
    private marketRateFacadeService: MarketRateFacadeService,private deviceInfoService : DeviceInfoService, private dataLayerService: DataLayerService) {
    }

  ngOnInit(): void {
    if (websiteSettings && websiteSettings.data) {
      this.isKYCRequired = websiteSettings.data.isKYCRequired;
      if (this.isKYCRequired) {
        this.GetKycStatus();
      } else {
        this.KYCStatus = 'Approved';
        this.isUpdateKYC = false;
        this.GetDWLimitResults();
        this.GetBankDetail();
        this.GetbankList();
      }
    }
    this.marketRateFacadeService.getBalance$().subscribe((data: any) => {
      const balance = data && data.length > 0 ? data[0].appBalance : null;
      const withdrawableAmount = data && data.length > 0 ? data[0].appWithdrawableAmount : null;
      if (withdrawableAmount !== null && withdrawableAmount !== undefined && withdrawableAmount >= 0) {
          this.Amountminmax.wa = withdrawableAmount;
      }
  });
  }
  ngAfterViewInit(): void {
    this.emailVerificationModalInstances = M.Modal.init(this.emailVerification.nativeElement, { dismissible: false });
    this.removeBankModalInstances = M.Modal.init(this.removeBank.nativeElement, { dismissible: false });
    let elems = document.querySelectorAll('.dropdown-trigger');
    let instances = M.Dropdown.init(elems, {});
  }
  GetKycStatus() {
    this.b2cUserService.GetKycStatus().pipe(catchError(err => throwError(err))).subscribe((reponse: any) => {
      if (reponse.message) {
        this.KYCStatus = reponse.message.sts;
        this.DeclineKYCStatus = reponse.message.rm;
        if(reponse.message.sts === 'Declined'){
          this.getdocumentImg = reponse.message.dp;
          this.documentno = reponse.message.dn;
         this.documentname = reponse.message.ed;
        }
        if (this.KYCStatus !== 'Approved' ? (this.KYCStatus !== 'Pending' ? true : false) : false) {
          this.updateKyc();
        }
        if (reponse.message.sts === 'Approved') {
         this.GetDWLimitResults();
         this.GetBankDetail();
         this.GetbankList();
         this.isWithdraweligible();
        }
      }
    }, err => console.log('GetKycStatus', err));
  }
  updateKyc() {
    this.b2cUserService.GetKycDocument().pipe(catchError(err => throwError(err))).subscribe((reponse: any) => {
    if (reponse.message) {
      this.documentTypes = reponse.message;
      this.KYCForm.reset();
      this.isUpdateKYC = true;
      this.document1Img = '';
      this.document2Img = '';
      this.getDocumentName();
      this.initSelect();
      setTimeout(() => {
        this.initSelect();
      }, 500);
    }
  }, err => console.log('GetKycDocument', err));
  }
  getDocumentName() {
    const doc = this.documentTypes.find(x => x.kmi == this.documentType);
    this.documentName = doc ? doc.nm :'';
  }
  GetBankDetail() {
    this.b2cUserService.GetBankDetail().pipe(catchError(err => throwError(err))).subscribe((reponse: any) => {
      if (reponse.message) {
        this.bankDetails = reponse.message;
      }
      this.initSelect();
      setTimeout(() => {
        this.initSelect();
      }, 500);
    }, err => console.log('GetBankDetail', err));
  }
  initSelect() {
    let elems0 = document.querySelectorAll('.dropdown-trigger');
    let instances0 = M.Dropdown.init(elems0, {});
    var elems = document.getElementById('b2cSelect');
    var instances = M.FormSelect.init(elems, {});
    var elems1 = document.getElementById('b2cSelectDocumentTypes');
    var instances1 = M.FormSelect.init(elems1, {});
    var elems2 = document.getElementById('b2cSelectBankDetails');
    var instances = M.FormSelect.init(elems2, {});
    $('li[id^="select-options"]').on('touchend', function (e) {
      e.stopPropagation();
  });
  }
  GetbankList(){
    this.b2cUserService.GetBankListDetail().pipe(catchError(err => throwError(err))).subscribe((reponse: any) => {
      if (reponse.message) {
        this.bankList = reponse.message;
      }
      this.initSelection();
      setTimeout(() => {
        this.initSelection();
      }, 500);
    }, err => console.log('GetBankListDetail', err));
  }
  initSelection(){
    document.querySelectorAll('select[searchable]').forEach(elem => {
      const select = M.FormSelect.init(elem, {});
      select.input.placeholder = 'Select Bank';
      const options = select.dropdownOptions.querySelectorAll('li:not(.optgroup)');
      options.forEach(option => {
        option.style.minHeight = '25px';
       option.getElementsByTagName('span')[0].style.color = '#000000';
       option.getElementsByTagName('span')[0].style.padding = '5px 16px'; 
       option.getElementsByTagName('span')[0].style.fontSize = '12px'; 
       option.getElementsByTagName('span')[0].style.fontWeight = '500'; 
       option.getElementsByTagName('span')[0].style.lineHeight = '16px'; 

    });
      // Add search box to dropdown
      const placeholderText = select.el.getAttribute('searchable');
      const searchBox = document.createElement('div');
      searchBox.style.padding = '6px 16px 0 16px';
      searchBox.setAttribute ('class', 'mysearchableClass');
      searchBox.innerHTML = `
          <input type="text" placeholder="${placeholderText}">
          </input>`
      select.dropdownOptions.prepend(searchBox);
      // Function to filter dropdown options
      function filterOptions(event) {
          const searchText = event.target.value.toLowerCase();
          
          options.forEach(option => {
              const value = option.textContent.toLowerCase();
              const display = value.indexOf(searchText) === -1 ? 'none' : 'block';
              option.style.display = display;
          });
    
          select.dropdown.recalculateDimensions();
      }
    
      // Function to give keyboard focus to the search input field
      function focusSearchBox() {
    searchBox.querySelector('input').focus();
      }
    
      select.dropdown.options.autoFocus = false;
    
      if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
          select.input.addEventListener('click', focusSearchBox);
          options.forEach(option => {
              option.addEventListener('click', focusSearchBox);
          });
      }
      searchBox.addEventListener('keyup', filterOptions);
    });
  }
  ondocumentTypeChange(val: any) {
    this.getDocumentName();
  }
  validationdocument(event: any){
    event.target.value  = event.target.value.replace(/\s/g, '');
    for (let index = 0; index < this.documentTypes.length; index++) {
      const element = this.documentTypes[index];
       if(element.nm == this.documentName){
         if(event.target.value.length >= element.min && event.target.value.length <= element.max){
          this.isdocumentcheck = false;
         } else {
         this.isdocumentcheck = true;
         }
       }
    }
  }
  onSelectFile(event): void {
    this.readDocument1(event.target);
  }
  onSelectFile2(event): void {
    this.readDocument2(event.target);
  }
  readDocument1(inputValue: any): void {
    this.imageError = '';
    if (inputValue.files && inputValue.files[0]) {
      const fsize = inputValue.files[0].size;
      const files = Math.round((fsize / 1024));
      if (files > 2048) {
        this.imageError =
          'Maximum size allowed is 2 Mb';
        this.document1Img = '';
        this.KYCForm.controls['document'].setValue('');
        this.isRequiredDocumentCtrl = false;

      } else {  
      var file: File = inputValue.files[0];
      var myReader: FileReader = new FileReader();

      myReader.onloadend = (e) => {
        this.document1Img = myReader.result;
        this.KYCForm.controls['document'].setValue(myReader.result);
      }
      myReader.readAsDataURL(file);
      this.isRequiredDocumentCtrl = false;
      }
    } else {
      this.document1Img = '';
      this.isRequiredDocumentCtrl = true;
      this.KYCForm.controls['document'].setValue('');
    }
    
  }
  readDocument2(inputValue: any): void {
    this.imageError2 = '';
    if (inputValue.files && inputValue.files[0]) {
      const fsize = inputValue.files[0].size;
      const files = Math.round((fsize / 1024));
      if (files > 2048) {
        this.imageError2 =
          'Maximum size allowed is 2 Mb';
        this.document2Img = '';
        this.KYCForm.controls['document1'].setValue('');

      } else {  
      var file: File = inputValue.files[0];
      var myReader: FileReader = new FileReader();

      myReader.onloadend = (e) => {
        this.document2Img = myReader.result;
        this.KYCForm.controls['document1'].setValue(myReader.result);
      }
      myReader.readAsDataURL(file);
      }
    } else {
      this.document2Img = '';
      this.KYCForm.controls['document1'].setValue('');
    }
    
  }
  KYCRequest() {
    if(!this.isdocumentcheck && !this.loading){
    if (this.KYCForm.valid) {
      const token = JSON.parse(localStorage.getItem('token'));
    if(websiteSettings.data.demoLoginUserName != token.clientName){
     this.KYCForm.value.documentNo = this.KYCForm.value.documentNo.replace(/\s/g, '');
     if(this.KYCForm.value.documentNo.length > 0){
      this.userProfile = userProfileInfo.data;
      if (websiteSettings.data.iese) {
        if (this.userProfile.appIsEmailVerified) {
           // KYC request
           this.UpdateKycDocument();
        } else {
          // email verification
          this.emailVerificationModalInstances.open();
          this.reSendEmailClick();
          this.loading = false;
         }
      } else {
        // KYC request
        this.UpdateKycDocument();
      }
    }
  } else {
    this.toastr.error('You are not allowed to access this page',"Notification",{
      toastClass: "custom-toast-error"
    });
  }
    } else {
      this.loading = false;
      this.isRequiredDocumentCtrl =  !this.KYCForm.controls["document"].valid;
      Object.keys(this.KYCForm.controls).forEach(field => {
        const control = this.KYCForm.get(field);
        control.markAsTouched({ onlySelf: true });
      });
    }
   }
  }
  UpdateKycDocument() {
    this.isRequiredDocumentCtrl = false;
    this.loading = true;
    this.b2cUserService.UpdateKycDocument(this.KYCForm.value).pipe(catchError(err => throwError(err))).subscribe((reponse: any) => {
      this.loading = false;
      if (reponse.isSuccess) {
        this.toastr.success(reponse.result.message,"Notification",{
          toastClass: "custom-toast-success"
        });
        this.ResetKYCDetail();
      } else {
        this.toastr.error('KYC Failed',"Notification",{
          toastClass: "custom-toast-error"
        });
      }
    }, err => { this.loading = false;console.log('KYCRequest', err) });
  }
  ResetKYCDetail() {
    this.KYCStatus = '';
    this.document1Img = '';
    this.document2Img = '';
    this.isUpdateKYC = false;
    this.documentType = 1;
    this.getDocumentName();
    this.withdrawForm.reset();
    this.KYCForm.reset();
    this.GetKycStatus();
  }
  withdrawRequest() {
    if(!this.iswithdrawminmax){
    if (this.withdrawForm.valid ) {
    if (this.withdrawForm.value.bankDetailId != 0) {
      this.userProfile = userProfileInfo.data;
      if (websiteSettings.data.iese) {
        if (this.userProfile.appIsEmailVerified) {
           // withdraw request
            if (!this.loading) {
              this.withdrawRequestAPICall();
            }
        } else {
          // email verification
          this.emailVerificationModalInstances.open();
          this.loading = false;
          this.reSendEmailClick();
          
         }
      } else {
        // withdraw request
        if (!this.loading) {
          this.withdrawRequestAPICall();
        }
        
      }
    }
    } else {
      this.loading = false;
      Object.keys(this.withdrawForm.controls).forEach(field => {
        const control = this.withdrawForm.get(field);
        control.markAsTouched({ onlySelf: true });
      });
    }
  }
  }
  withdrawRequestAPICall() {
    const token = JSON.parse(localStorage.getItem('token'));
    if(websiteSettings.data.demoLoginUserName != token.clientName){
    this.loading = true;
    const user = JSON.parse(localStorage.getItem('token'));
      this.b2cUserService.WithdrawRequest(this.withdrawForm.value).pipe(catchError(err => throwError(err))).subscribe((reponse: any) => {
        this.loading = false;
        
        if (reponse.isSuccess) {
          this.toastr.success(reponse.result.message,"Notification",{
            toastClass: "custom-toast-success"
          });
          const _currentSet ={
            'event': 'withdraw',
            'phone': '+' + userProfileInfo.data.appMobileNo,
             'Value': this.withdrawForm.value.amount,
            };
            this.dataLayerService.pingHome(_currentSet);
        } else {
          this.toastr.error(reponse.result.message,"Notification",{
            toastClass: "custom-toast-error"
          });
        }
        this.withdrawForm.reset();
        this.selectedBank = null;
      }, err => { this.loading = false; console.log('withdrawRequest', err) });
    } else {
      this.toastr.error('You are not allowed to access this page',"Notification",{
        toastClass: "custom-toast-error"
      });
    }
  }
  reSendEmailClick() {
    const email = userProfileInfo.data.appEmailID;
    this.b2cUserService.ReSendMail(email).pipe(catchError(err => throwError(err))).subscribe((reponse: any) => {
      if(reponse.isSuccess){
        this.toastr.success(reponse.result.message,"Notification",{
          toastClass: "custom-toast-success"
        });
      } else {
        this.toastr.error(reponse.result.message,"Notification",{
          toastClass: "custom-toast-error"
        });
      }
    }, err => console.log('GetPaymentModeList', err));
  }
  addBankDetailRequest() {
    if (this.addBankDetailForm.valid && !this.loading) {
      const token = JSON.parse(localStorage.getItem('token'));
      if(websiteSettings.data.demoLoginUserName != token.clientName){
      if (this.withdrawModel.option == 'Bank') {
        this.holdername = this.addBankDetailForm.value.accountHolderName.replace(/\s/g, '');
        this.bankname = this.addBankDetailForm.value.bankName.replace(/\s/g, '');
        this.accountno = this.addBankDetailForm.value.accountNo.replace(/\s/g, '');
        this.ifsccode = this.addBankDetailForm.value.ifsc.replace(/\s/g, '');
        this.addBankDetailForm.get('appIsCrypto').setValue(false);
        this.addBankDetailForm.get('appIsUpi').setValue(false);
      } else {
        this.holdername = "";
        this.bankname = "";
        this.accountno = "";
        this.ifsccode = "";
        this.addBankDetailForm.get('bankName').setValue(" ");
        this.addBankDetailForm.get('ifsc').setValue(" ");
        this.addBankDetailForm.get('accountHolderName').setValue(" ");
        this.addBankDetailForm.get('appIsCrypto').setValue(false);
        this.addBankDetailForm.get('appIsUpi').setValue(true);
      }
     if((this.holdername.length > 0 && this.bankname.length > 0 && this.accountno.length > 0 && this.ifsccode.length > 0 ) || this.withdrawModel.option == 'Upi'){
      this.loading = true;
      this.b2cUserService.AddBankDetail(this.addBankDetailForm.value).pipe(catchError(err => throwError(err))).subscribe((reponse: any) => {
        this.loading = false;
        if (reponse.isSuccess) {
          this.toastr.success(reponse.result.message,"Notification",{
            toastClass: "custom-toast-success"
          });
          this.isBankDetail = true;
          this.isUpdateKYC = false;
          this.isAddBankDetail = !this.isAddBankDetail;
          this.addBankDetailForm.reset();
          this.withdrawForm.reset();
          this.GetBankDetail();
          this.bankDetailId = 0;
          this.selectedBank = null;
        } else {
          this.toastr.error(reponse.result.message,"Notification",{
            toastClass: "custom-toast-error"
          });
        }
      }, err => { this.loading = false;console.log('addBankDetailRequest', err) });
    }} else {
      this.toastr.error('You are not allowed to access this page',"Notification",{
        toastClass: "custom-toast-error"
      });
    }
    } else {
      this.loading = false;
      Object.keys(this.addBankDetailForm.controls).forEach(field => {
        const control = this.addBankDetailForm.get(field);
        control.markAsTouched({ onlySelf: true });
      });
    }
  }
  onAddBankDeatailBtnClick(value) {
    this.selectedBank = null;
    this.bankDetailId = 0;
    this.isBankDetail = value;
    this.isAddBankDetail = !this.isAddBankDetail;
    this.isUpdateKYC = !value;
    this.addBankDetailForm.reset();
    this.withdrawForm.reset();
    this.iswithdrawminmax = false;
    this.initSelection();
      setTimeout(() => {
        this.initSelection();
      }, 1000);

      this.initSelect();
      setTimeout(() => {
        this.initSelect();
      }, 500);
  }
  numberOnly(event): boolean {
    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;
  }
  WithdrawAmountCheck(event: any) {
    let MaxAmount: number;
    if (this.Amountminmax.wa > this.Amountminmax.wmax) {
      MaxAmount = this.Amountminmax.wmax;
    } else {
      MaxAmount = this.Amountminmax.wa;
    }
    if(event.target.value >= this.Amountminmax.wmin && event.target.value <= MaxAmount){
      this.iswithdrawminmax = false;
      this.hidewithdrawrequest = false;
     } else {
      this.hidewithdrawrequest = true;
      this.iswithdrawminmax = true;
    }
  }
  DeativeBankDetail() {
    if (this.deativeBankDetailId !== null && !this.loading) { 
    this.loading = true;
    this.b2cUserService.DeativeBankDetail(this.deativeBankDetailId).pipe(catchError(err => throwError(err))).subscribe((reponse: any) => {
      this.loading = false;
      if (reponse.isSuccess) {
        this.toastr.success(reponse.result.message,"Notification",{
          toastClass: "custom-toast-success"
        });
        const bankDetails = Object.assign([],this.bankDetails);
        this.bankDetails = bankDetails.filter(x => x.appBankDetailId !== this.deativeBankDetailId);
        this.selectedBank = null;
        setTimeout(() => {
          this.initSelect();
        }, 500);
      } else {
        this.toastr.error(reponse.result.message,"Notification",{
          toastClass: "custom-toast-error"
        });
      }
      this.declineRemoveBank();
    }, err => { this.loading = false; console.log('DeativeBankDetail', err) });
  }
  }
  removeBankFromList(BankDetailId) {
    this.deativeBankDetailId = BankDetailId;
    this.removeBankModalInstances.open();
  }
  declineRemoveBank() {
    if (this.loading == false) {
      this.deativeBankDetailId = null;
      this.removeBankModalInstances.close();     
    }
  }
  onChangeSelectedBank(item) {
    this.selectedBank = item;
    this.withdrawForm.controls['bankDetailId'].setValue(item.appBankDetailId);
  }
  checkvalue(event: any) {
    event.target.value  = event.target.value.replace(/\s/g, '');
  }
  checkvalueifsc(event: any) {
    event.target.value  = event.target.value.replace(/\s/g, '').toUpperCase();
  }
  GetDWLimitResults() {
    this.b2cUserService.GetDWLimitResult().pipe(catchError(err => throwError(err))).subscribe((reponse: any) => {
      if(reponse.message){
      this.Amountminmax = reponse.message;
      }
    }, err => console.log('GetDWLimitResults', err));
  }
  onWithdrawMethodChange(value) {
    this.withdrawModel.option = value;
    if (value == 'Upi') {
      this.addBankDetailForm.get('appIsUpi').setValue(true);
      this.addBankDetailForm.controls["bankName"].clearValidators();
      this.addBankDetailForm.controls["ifsc"].clearValidators();
      this.addBankDetailForm.controls["accountHolderName"].clearValidators();
    } else {
      this.addBankDetailForm.get('appIsUpi').setValue(false);
      this.addBankDetailForm.get('bankName').setValidators(Validators.required);
      this.addBankDetailForm.get('ifsc').setValidators(Validators.required);
      this.addBankDetailForm.get('accountHolderName').setValidators(Validators.required);
      this.initSelection();
      setTimeout(() => {
        this.initSelection();
      }, 1000);

      this.initSelect();
      setTimeout(() => {
        this.initSelect();
      }, 500);
    }
    this.selectedBank = null;
    this.bankDetailId = 0;
    this.addBankDetailForm.get('bankName').setValue(" ");
    this.addBankDetailForm.get('ifsc').setValue(" ");
    this.addBankDetailForm.get('accountHolderName').setValue(" ");
  }
  isWithdraweligible() {
    this.b2cUserService.isWithdraweligible().pipe(catchError(err => throwError(err))).subscribe((reponse: any) => {
      if (reponse.isSuccess && reponse.result && reponse.result.message) {
        const isDeposit = reponse.result.message.isDeposit;
        if(!isDeposit){
          this.isShowCampaignMsg = true;
          const bonus = reponse.result.message.bonus
          this.isWithdraweligibleAmount = bonus && bonus.length > 0 ? bonus[0].amount : null;
        } else {
          this.isShowCampaignMsg = false;
          this.isWithdraweligibleAmount = null;
        }
      } else {
        this.isShowCampaignMsg = false;
        this.isWithdraweligibleAmount = null;
      }
    }, err => console.log('isWithdraweligible', err));
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
