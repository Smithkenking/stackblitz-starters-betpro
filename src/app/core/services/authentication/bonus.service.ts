import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BaseRequest } from '@clientApp-core/models/base/base-request.model';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { apiEndPointData } from '../config/connfig.service';

export class BonusRequest implements BaseRequest<any> {
  constructor(public body: any, public queryParameter: any, public endPoint: string, public baseUrl: string = null) { }
}
export function getCampaignListRequest(): BaseRequest<any> {
    const request = new BonusRequest({}, {}, 'api/Campaign/GetCampaignList');
    return request;
}

export function getWalletListRequest(): BaseRequest<any> {
    const request = new BonusRequest({}, {}, 'api/Campaign/GetWalletList');
    return request;
}

export function updateWalletRequest(WalletId: any): BaseRequest<any> {
    const payload = Object.assign({WalletId});
    const request = new BonusRequest(payload, {}, 'api/Campaign/UpdateWallet');
    return request;
}
export function getWalletTransactionListRequest(): BaseRequest<any> {
  const request = new BonusRequest({}, {}, 'api/Campaign/WalletTransactionList');
  return request;
}
export function getCampaignSubscriptionListRequest(): BaseRequest<any> {
  const request = new BonusRequest({}, {}, 'api/Campaign/CampaignSubscriptionList');
  return request;
}
export function getGetWagerListRequest(): BaseRequest<any> {
  const request = new BonusRequest({}, {}, 'api/Campaign/GetWagerList');
  return request;
} 
export function getredeemWagerRequest(WalletId: any): BaseRequest<any> {
  const body = { "WalletId": WalletId };
  const request = new BonusRequest(body, {}, 'api/Campaign/redeemWager');
  return request;
} 
export function getWagerBetListDetailsRequest(WalletId: any,iswager:boolean): BaseRequest<any> {
  const body = { "WalletId": WalletId, "iswager":iswager };
  const request = new BonusRequest(body, {}, 'api/Campaign/GetWagerBetListDetails');
  return request;
}
export function getWalletTransactionDetailsListRequest(BetId: any): BaseRequest<any> {
  const body = { "BetId": BetId };
  const request = new BonusRequest(body, {}, 'api/Campaign/WalletTransactionDetailsList');
  return request;
}
export function getWagerBetLiabilityDetailsRequest(WalletId: any): BaseRequest<any> {
  const body = { "WalletId": WalletId };
  const request = new BonusRequest(body, {}, 'api/Campaign/GetWagerBetLiabilityDetails');
  return request;
}
export function getCampaignActionListRequest(GroupCode: any): BaseRequest<any> {
  const body = { "GroupCode": GroupCode };
  const request = new BonusRequest(body, {}, 'api/Campaign/GetCampaignActionList');
  return request;
}
export function getAllBetListWalletWiseRequest(WalletId: any,isWager:boolean): BaseRequest<any> {
  const body = { "WalletId": WalletId, "isWager":isWager };
  const request = new BonusRequest(body, {}, 'api/Campaign/GetAllBetListWalletWise');
  return request;
}
export function getAllClientVipCategoryRequest(): BaseRequest<any> {
  const request = new BonusRequest({}, {}, 'api/Campaign/GetAllClientVipCategory');
  return request;
}
@Injectable({
  providedIn: 'root'
})
export class BonusService {

  constructor(private httpClient: HttpClient) { }

  getCampaignList() {
    const getCampaignRequest = getCampaignListRequest();
    return this.httpClient.post(this.getBaseUrl(getCampaignRequest), getCampaignRequest.body, { params: getCampaignRequest.queryParameter })
    .pipe(map((data: any) => { return data }), catchError(err => { return throwError(err) }));
  }
  getWalletList() {
    const getWalletRequest = getWalletListRequest();
    return this.httpClient.post(this.getBaseUrl(getWalletRequest), getWalletRequest.body, { params: getWalletRequest.queryParameter })
    .pipe(map((data: any) => { return data }), catchError(err => { return throwError(err) }));
  }
  updateWalletRequest(WalletId: any): Observable<any> {
    const getupdateWalletRequest = updateWalletRequest(WalletId);
    return this.httpClient.post(this.getBaseUrl(getupdateWalletRequest), getupdateWalletRequest.body, { params: getupdateWalletRequest.queryParameter })
    .pipe(map((data: any) => { return data }), catchError(err => { return throwError(err) }));
  }
  getWalletTransactionList() {
    const getWallettransactionRequest = getWalletTransactionListRequest();
    return this.httpClient.post(this.getBaseUrl(getWallettransactionRequest), getWallettransactionRequest.body, { params: getWallettransactionRequest.queryParameter })
    .pipe(map((data: any) => { return data }), catchError(err => { return throwError(err) }));
  }
  getCampaignSubscriptionList() {
    const getcampaignListRequest = getCampaignListRequest();
    return this.httpClient.post(this.getBaseUrl(getcampaignListRequest), getcampaignListRequest.body, { params: getcampaignListRequest.queryParameter })
    .pipe(map((data: any) => { return data }), catchError(err => { return throwError(err) }));
  }
  getWagerList() {
    const getWagerRequest = getGetWagerListRequest();
    return this.httpClient.post(this.getBaseUrl(getWagerRequest), getWagerRequest.body, { params: getWagerRequest.queryParameter })
    .pipe(map((data: any) => { return data }), catchError(err => { return throwError(err) }));
  }
  redeemWager(WalletId: any) {
    const redeemWagerRequest = getredeemWagerRequest(WalletId);
    return this.httpClient.post(this.getBaseUrl(redeemWagerRequest), redeemWagerRequest.body, { params: redeemWagerRequest.queryParameter })
    .pipe(map((data: any) => { return data }), catchError(err => { return throwError(err) }));
  }
  GetWagerBetListDetails(WalletId: any,iswager:boolean) {
    const wagerBetListDetailsRequest = getWagerBetListDetailsRequest(WalletId,iswager);
    return this.httpClient.post(this.getBaseUrl(wagerBetListDetailsRequest), wagerBetListDetailsRequest.body, { params: wagerBetListDetailsRequest.queryParameter })
    .pipe(map((data: any) => { return data }), catchError(err => { return throwError(err) }));
  }
  GetWalletTransactionDetailsList(BetId: any) {
    const walletTransactionDetailsListRequest = getWalletTransactionDetailsListRequest(BetId);
    return this.httpClient.post(this.getBaseUrl(walletTransactionDetailsListRequest), walletTransactionDetailsListRequest.body, { params: walletTransactionDetailsListRequest.queryParameter })
    .pipe(map((data: any) => { return data }), catchError(err => { return throwError(err) }));
  }
  GetWagerBetLiabilityDetails(WalletId: any) {
    const wagerLiabilityBetListDetailsRequest = getWagerBetLiabilityDetailsRequest(WalletId);
    return this.httpClient.post(this.getBaseUrl(wagerLiabilityBetListDetailsRequest), wagerLiabilityBetListDetailsRequest.body, { params: wagerLiabilityBetListDetailsRequest.queryParameter })
    .pipe(map((data: any) => { return data }), catchError(err => { return throwError(err) }));
  }
  GetCampaignActionList(GroupCode: any) {
    const campaignActionListRequest = getCampaignActionListRequest(GroupCode);
    return this.httpClient.post(this.getBaseUrl(campaignActionListRequest), campaignActionListRequest.body, { params: campaignActionListRequest.queryParameter })
    .pipe(map((data: any) => { return data }), catchError(err => { return throwError(err) }));
  }
  GetAllBetListWalletWise(WalletId,isWager) {
    const getAllBetListWalletWise = getAllBetListWalletWiseRequest(WalletId,isWager);
    return this.httpClient.post(this.getBaseUrl(getAllBetListWalletWise), getAllBetListWalletWise.body, { params: getAllBetListWalletWise.queryParameter })
    .pipe(map((data: any) => { return data }), catchError(err => { return throwError(err) }));
  }
  GetAllClientVipCategory() {
    const clientVipCategoryRequest = getAllClientVipCategoryRequest();
    return this.httpClient.post(this.getBaseUrl(clientVipCategoryRequest), clientVipCategoryRequest.body, { params: clientVipCategoryRequest.queryParameter })
    .pipe(map((data: any) => { return data}), catchError(err => { return throwError(err) }));
  }
  getBaseUrl(item: any): string {
    let baseUrl: string;
    if (item.baseUrl) {
      baseUrl = `${item.baseUrl}${item.endPoint}`;
    } else {
      baseUrl = `${apiEndPointData.data.cau}${item.endPoint}`;
    }
    return baseUrl;
  }
}
