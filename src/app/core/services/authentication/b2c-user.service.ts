import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { guid } from '@clientApp-core/utilities/app-util';
import { Observable, Subject, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { apiEndPointData } from '../config/connfig.service';


@Injectable({
  providedIn: 'root'
})
export class B2cUserService {
  private _userProfilestSubject = new Subject<any>();
  constructor(private httpClient: HttpClient) { }
  getUserInfo$(): Observable<any> {
    return this._userProfilestSubject.asObservable();
  }
  AddNewClient(payload: any): Observable<any> {
    return this.httpClient.post(apiEndPointData.data.cau + 'api/B2CUser/AddNewClient', payload)
    .pipe(map((data: any) => { return data }), catchError(err => { return throwError(err) }));
  }
  VerifyDetails(text: string, type: number): Observable<any> {
    const payload = Object.assign({text, type});
    return this.httpClient.post(apiEndPointData.data.cau + 'api/B2CUser/ValidateInfo', payload)
    .pipe(map((data: any) => { return data }), catchError(err => { return throwError(err) }));
  }
  RegisterInfo(payload): Observable<any> {
    return this.httpClient.post(apiEndPointData.data.cau + 'api/B2CUser/Registration', payload)
    .pipe(map((data: any) => { return data }), catchError(err => { return throwError(err) }));
  }
  RegistrationProcess(payload): Observable<any> {
    return this.httpClient.post(apiEndPointData.data.cau + 'api/B2CUser/RegistrationProcess', payload)
    .pipe(map((data: any) => { return data }), catchError(err => { return throwError(err) }));
  }
  RegistrationComplete(payload): Observable<any> {
    return this.httpClient.post(apiEndPointData.data.cau + 'api/B2CUser/RegistrationComplete', payload)
    .pipe(map((data: any) => { return data }), catchError(err => { return throwError(err) }));
  }
  GetKycStatus() {
    return this.httpClient.post(apiEndPointData.data.cau + 'api/B2CUser/GetKycStatus', {})
    .pipe(map((data: any) => { return data.result }), catchError(err => { return throwError(err) }));
  }
  EmailVerification(qtoken) {
    return this.httpClient.post(apiEndPointData.data.cau + 'api/B2CUser/EmailVerification',{"token": qtoken}).pipe(map((data: any) => { return data }), catchError(err => { return throwError(err) }));
  }
  ReEmailVerification(qtoken) {
    return this.httpClient.post(apiEndPointData.data.cau + 'api/B2CUser/ReVerifyEmail',{"token": qtoken}).pipe(map((data: any) => { return data }), catchError(err => { return throwError(err) }));
  }
  GetKycDocument() {
    return this.httpClient.post(apiEndPointData.data.cau + 'api/B2CUser/GetKycDocument', {})
    .pipe(map((data: any) => { return data.result }), catchError(err => { return throwError(err) }));
  }
  GetDWLimitResult() {
    return this.httpClient.post(apiEndPointData.data.cau + 'api/B2CUser/GetDWLimit', {})
    .pipe(map((data: any) => { return data.result }), catchError(err => { return throwError(err) }));
  }
  UpdateKycDocument(payload) {
    return this.httpClient.post(apiEndPointData.data.cau + 'api/B2CUser/UpdateKyc', payload)
    .pipe(map((data: any) => { return data }), catchError(err => { return throwError(err) }));
  }
  depositAmount(payload) {
    const body = Object.assign(payload, { transactionId: guid() })
    return this.httpClient.post(apiEndPointData.data.cau + 'api/B2CUser/Deposit', body)
    .pipe(map((data: any) => { return data }), catchError(err => { return throwError(err) }));
  }
  WithdrawRequest(payload) {
    const body = Object.assign(payload, { transactionId: guid() })
    return this.httpClient.post(apiEndPointData.data.cau + 'api/B2CUser/Withdraw', body)
    .pipe(map((data: any) => { return data }), catchError(err => { return throwError(err) }));
  }
  GetPaymentStatusDropDown() {
    return this.httpClient.post(apiEndPointData.data.cau + 'api/B2CUser/GetPaymentStatusDropDown', {})
    .pipe(map((data: any) => { return data }), catchError(err => { return throwError(err) }));
  }
  GetDepositeWithdrawReport(payload) {
    return this.httpClient.post(apiEndPointData.data.cau + 'api/B2CUser/GetDepositeWithdrawReport', payload)
    .pipe(map((data: any) => { return data }), catchError(err => { return throwError(err) }));
  }
  verifyOTPRequest(payload) {
    return this.httpClient.post(apiEndPointData.data.cau + 'api/B2CUser/VerifyOTP', payload)
    .pipe(map((data: any) => { return data }), catchError(err => { return throwError(err) }));
  }
  resendOTPRequest(number: any) {
    const payload = Object.assign({number});
    return this.httpClient.post(apiEndPointData.data.cau + 'api/B2CUser/ResendOTPSignUp', payload)
    .pipe(map((data: any) => { return data }), catchError(err => { return throwError(err) }));
  }
  fpresendOTPRequest(number: any) {
    const payload = Object.assign({number});
    return this.httpClient.post(apiEndPointData.data.cau + 'api/B2CUser/ResendOTPResetPassword', payload)
    .pipe(map((data: any) => { return data }), catchError(err => { return throwError(err) }));
  }
  GetBankDetail() {
    return this.httpClient.post(apiEndPointData.data.cau + 'api/B2CUser/GetBankDetail', {})
    .pipe(map((data: any) => { return data.result }), catchError(err => { return throwError(err) }));
  }
  GetBankListDetail() {
    return this.httpClient.post(apiEndPointData.data.cau + 'api/B2CUser/GetBankList', {})
    .pipe(map((data: any) => { return data.result }), catchError(err => { return throwError(err) }));
  }
  AddBankDetail(payload) {
    return this.httpClient.post(apiEndPointData.data.cau + 'api/B2CUser/AddBankDetail', payload)
    .pipe(map((data: any) => { return data }), catchError(err => { return throwError(err) }));
  }
  DeativeBankDetail(BankDetailId) {
    return this.httpClient.post(apiEndPointData.data.cau + 'api/B2CUser/DeativeBankDetail', {"BankDetailId": BankDetailId})
    .pipe(map((data: any) => { return data }), catchError(err => { return throwError(err) }));
  }
  getTransactionHistory$(transactionId: any): Observable<any> {
    const payload = Object.assign({ transactionID: transactionId });
    return this.httpClient
        .post(apiEndPointData.data.cau + 'api/B2CUser/GetWithdrawLogData', payload)
        .pipe(map((data: any) => { return data }), catchError(err => { return throwError(err) }));
  }
  registerAgent(payload: any): Observable<any> {
    return this.httpClient.post(apiEndPointData.data.cau + 'api/B2CUser/RegisterAgent', payload)
    .pipe(map((data: any) => { return data }), catchError(err => { return throwError(err) }));
  }
  getUserProfile() {
    return this.httpClient.post(apiEndPointData.data.cau + 'api/B2CUser/GetUserProfile', {})
      .pipe(map((response: any) => {
        if (response.isSuccess) {
          userProfileInfo.data = response.result.message;
        }
      return response;
    }), catchError(err => { return throwError(err) }))
    .subscribe((data) => this._userProfilestSubject.next(data), err => console.log('MarketBetInfo', err));
  }
  manualDeposit(payload) {
    const body = Object.assign(payload, { transactionId: guid() })
    return this.httpClient.post(apiEndPointData.data.cau + 'api/B2CUser/ManualDeposit', body)
    .pipe(map((data: any) => { return data }), catchError(err => { return throwError(err) }));
  }
  registerClient(payload: any): Observable<any> {
    return this.httpClient.post(apiEndPointData.data.cau + 'api/B2CUser/RegisterClient', payload)
    .pipe(map((data: any) => { return data }), catchError(err => { return throwError(err) }));
  } 
  updateMobileEmail(payload: any): Observable<any> {
    return this.httpClient.post(apiEndPointData.data.cau + 'api/B2CUser/UpdateMobileEmail', payload)
    .pipe(map((data: any) => { return data }), catchError(err => { return throwError(err) }));
  }
  getMarketing(code){
    return this.httpClient.post(apiEndPointData.data.cau + 'api/B2CUser/Marketing',{"code":code}).pipe(map((data: any) => {
      sessionStorage.setItem('isCallMktApi', '1');
      return data
    }), catchError(err => { return throwError(err) }));
  }
  updateClickId(code){
    return this.httpClient.post(apiEndPointData.data.cau + 'api/B2CUser/UpdateClickId',{"clickId":code}).pipe(map((data: any) => {
      sessionStorage.setItem('isCallClickIdApi', '1');
      return data
    }), catchError(err => { return throwError(err) }));
  }
  GetPaymentModeList() {
    return this.httpClient.post(apiEndPointData.data.cau + 'api/B2CUser/GetManualPaymentAccountList', {})
    .pipe(map((data: any) => { return data.result }), catchError(err => { return throwError(err) }));
  }
  ReSendMail(email) {
    const body = {
      "emailID": email
    }
    return this.httpClient.post(apiEndPointData.data.cau + 'api/B2CUser/ReSendMail', body)
    .pipe(map((data: any) => { return data }), catchError(err => { return throwError(err) }));
  }
  SendWhatappOTP(MobileNo,OtpType,UserName?:any) {
    const body = {
      "MobileNo": MobileNo,
      "UserName":UserName ? UserName : '',
      "OtpType":OtpType
  }
    return this.httpClient.post(apiEndPointData.data.cau + 'api/B2CUser/SendWhatappOTP', body)
    .pipe(map((data: any) => { return data }), catchError(err => { return throwError(err) }));
  }
  VerifyWhatappOTP(MobileNo,OTP,OtpType) {
    const body = {
      "MobileNo": MobileNo,
      "OTP":OTP,
      "OtpType":OtpType
  }
    return this.httpClient.post(apiEndPointData.data.cau + 'api/B2CUser/SendWhatappOTP', body)
    .pipe(map((data: any) => { return data }), catchError(err => { return throwError(err) }));
  }
  RegistrationUpdateMobile(payload): Observable<any> {
    return this.httpClient.post(apiEndPointData.data.cau + 'api/B2CUser/RegistrationUpdateMobile', payload)
    .pipe(map((data: any) => { return data }), catchError(err => { return throwError(err) }));
  }
  ForgotPasswordRequest(payload): Observable<any> {
    return this.httpClient.post(apiEndPointData.data.cau + 'api/B2CUser/ForgotPasswordRequest', payload)
    .pipe(map((data: any) => { return data }), catchError(err => { return throwError(err) }));
  }
  ForgotResetPassword(payload): Observable<any> {
    return this.httpClient.post(apiEndPointData.data.cau + 'api/B2CUser/ForgotResetPassword', payload)
    .pipe(map((data: any) => { return data }), catchError(err => { return throwError(err) }));
  }
  UpdateMobile(payload): Observable<any> {
    return this.httpClient.post(apiEndPointData.data.cau + 'api/B2CUser/UpdateMobile', payload)
    .pipe(map((data: any) => { return data }), catchError(err => { return throwError(err) }));
  }
  GetClientDipositWithdraw(): Observable<any> {
    return this.httpClient.post(apiEndPointData.data.cau + 'api/B2CUser/GetClientDipositWithdraw', {})
    .pipe(map((data: any) => { return data }), catchError(err => { return throwError(err) }));
  }
  isWithdraweligible(): Observable<any> {
    return this.httpClient.post(apiEndPointData.data.cau + 'api/B2CUser/IsWithdraweligible',{})
    .pipe(map((data: any) => { return data }), catchError(err => { return throwError(err) }));
  }
  loginWithOtpRequest(body: any) {
    return this.httpClient.post(apiEndPointData.data.cau + 'api/B2CUser/LoginWithOtp', body)
    .pipe(map((data: any) => { return data }), catchError(err => { return throwError(err) }));
  }
  RegistrationWithOtp(body: any) {
    return this.httpClient.post(apiEndPointData.data.cau + 'api/B2CUser/RegistrationWithOtp', body)
    .pipe(map((data: any) => { return data }), catchError(err => { return throwError(err) }));
  }
  AddClientActivityLog(body: any) {
    return this.httpClient.post(apiEndPointData.data.cau + 'api/B2CUser/AddClientActivityLog', body)
    .pipe(map((data: any) => { return data }), catchError(err => { return throwError(err) }));
  }
  PaymentGatewayList() {
    return this.httpClient.post(apiEndPointData.data.cau + 'api/B2CUser/PaymentGatewayList', {})
    .pipe(map((data: any) => { return data.result }), catchError(err => { return throwError(err) }));
  }
  ManualWithdrawGateway(body) {
    return this.httpClient.post(apiEndPointData.data.cau + 'api/B2CUser/ManualWithdrawGateway', body)
    .pipe(map((data: any) => { return data }), catchError(err => { return throwError(err) }));
  }
}
export const userProfileInfo: any = {
  data: ''
};
