import { Injectable } from '@angular/core';
import { Observable, throwError, Subject } from 'rxjs';
import { catchError, map, take } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { apiEndPointData } from '../config/connfig.service';


@Injectable({
  providedIn: 'root'
})
export class AuthFacadeService {
  baseUrl = apiEndPointData.data.cau;
  private _configurationSubject = new Subject<any>();
  private _casinoConfigurationSubject = new Subject<any>();
  private _GuestCasinoConfigurationSubject = new Subject<any>();
  private _ResetPasswordSubject = new Subject<boolean>();
  private _dcoBannerSubject = new Subject<any>();
  private _guestMarketConfigurationSubject = new Subject<any>();
  private _footerInfoSubject = new Subject<any>();
  private _trendingGamesSubject = new Subject<any>();
  private _mostlyPlayedSubject = new Subject<any>();
  private _newsSubject = new Subject<any>();
  private _notificationSubject = new Subject<any>();
  private _getBlockedMarketDataSubject = new Subject<any>();
  constructor(private httpClient: HttpClient) { }
  getFooterInfo$(): Observable<any> {
    return this._footerInfoSubject.asObservable();
  }
  getDcoBanner$(): Observable<any> {
    return this._dcoBannerSubject.asObservable();
  }
  getTrendingGames$(): Observable<any> {
    return this._trendingGamesSubject.asObservable();
  }
  getMostlyPlayedGames$(): Observable<any> {
    return this._mostlyPlayedSubject.asObservable();
  }
  getNews$(): Observable<any> {
    return this._newsSubject.asObservable();
  }
  getBlockedMarketDataInfo$(): Observable<any> {
    return this._getBlockedMarketDataSubject.asObservable();
  }
  getBannerData() {
    const bannerUrl = apiEndPointData.data.cu + "ContentList";
    const body = ({
      secretKey: apiEndPointData.data.dcsc
    })
    return this.httpClient.post(bannerUrl, body)
      .pipe(map((response: any) => {
        if (response.success) {
          DCOBanner.data = response.result;
        }
        return response;
      }), catchError(err => { return throwError(err) }))
      .subscribe((data) => this._dcoBannerSubject.next(data), err => console.log('getBannerData', err));
  }
  DemoLogIn(body: any) {
    return this.httpClient.post(apiEndPointData.data.cau + 'api/Account/DemoLogin', body)
      .pipe(map((data: any) => { return data.result }), catchError(err => { return throwError(err) }));
  }
  LogIn$(name: string, password: string, Captcha: string, RequestId: string, LoginWith: number): Observable<any> {
    const auth = {
      "UserName": name,
      "Password": password,
      "Captcha": Captcha,
      "RequestId": RequestId,
      "LoginWith": LoginWith
    }
    return this.httpClient.post(apiEndPointData.data.cau + 'api/Account/Login', auth)
      .pipe(map((data: any) => { return data.result }), catchError(err => { return throwError(err) }));
  }
  LogOut$() {
    this.httpClient.post(apiEndPointData.data.cau + 'api/Account/Logout', {}).pipe(catchError(err => throwError(err)))
      .subscribe((response) => { }, err => console.log('LogOut', err));
  }
  IsAuthorized$() {
    return this.httpClient.post(apiEndPointData.data.cau + 'api/Account/IsAuthorized', {})
      .pipe(catchError(err => throwError(err)));
  }
  IsBlackListIpAddress$() {
    return this.httpClient.post(apiEndPointData.data.cau + 'api/Account/isBlackListIpAddress', {})
      .pipe(catchError(err => throwError(err)));
  }
  SocialLogin(body :any) { 
    return this.httpClient.post(apiEndPointData.data.cau + 'api/Account/SocialMediaAppLogin', body)
      .pipe(map((data: any) => { return data }), catchError(err => { return throwError(err) }));
  }
  getTrendingGames() {
    return this.httpClient.post(apiEndPointData.data.cau + 'api/Account/getTrendingGamesList', {})
      .pipe(map((response: any) => {
        if (response.isSuccess) {
          // TrendingGames.data = response.result.data;
          TrendingGames.data = response.result.gameData;
        } else {
          TrendingGames.data = [];
        }
        return response;
      }), catchError(err => { return throwError(err) }))
      .subscribe((data) => this._trendingGamesSubject.next(data), err => console.log('getTrendingGames', err));
  }
  getMostlyPlayedGames() {
    return this.httpClient.post(apiEndPointData.data.cau + 'api/Account/getMostlyPlayedGamesList', {})
      .pipe(map((response: any) => {
        if (response.isSuccess) {
          MostlyPlayed.data = response.result.data;
        } else {
          MostlyPlayed.data = [];
        }
        return response;
      }), catchError(err => { return throwError(err) }))
      .subscribe((data) => this._mostlyPlayedSubject.next(data), err => console.log('getMostlyPlayedGames', err));
  }
  getBlogCategoryData() {
    return this.httpClient.post(apiEndPointData.data.cau + 'api/Account/getBlogCategoryData', {}).pipe(catchError(err => throwError(err)));
  }
  getBlogData() {
    return this.httpClient.post(apiEndPointData.data.cau + 'api/Account/getBlogData', {}).pipe(catchError(err => throwError(err)));
  }
  getRecommendGames() {
    return this.httpClient.post(apiEndPointData.data.cau + 'api/Account/getUserRecommendationGamesList', {})
      .pipe(map((response: any) => {
        if (response.isSuccess) {
          RecommendGames.data = response.result.data;
        } else {
          RecommendGames.data = [];
        }
        return response;
      }), catchError(err => { return throwError(err) }))
      .subscribe((data) => this._trendingGamesSubject.next(data), err => console.log('getRecommendGames', err));
  }
  getPopularGames() {
    return this.httpClient.post(apiEndPointData.data.cau + 'api/Account/getPopularGamesList', {})
      .pipe(map((response: any) => {
        if (response.isSuccess) {
          PopularGames.data = response.result.data;
        } else {
          PopularGames.data = [];
        }
        return response;
      }), catchError(err => { return throwError(err) }))
      .subscribe((data) => this._mostlyPlayedSubject.next(data), err => console.log('getPopularGames', err));
  }
  SetRealBalanceUse$() {
    return this.httpClient.post(apiEndPointData.data.cau + 'api/Account/SetRealBalanceUse', {})
      .pipe(catchError(err => throwError(err)));
  }
  getDashboardMultiMarket(ids) {
    return this.httpClient.post(apiEndPointData.data.cau + 'api/Account/GetGuestMatchWiseMarketMultiple', { "matchIds": ids })
      .pipe(catchError(err => throwError(err)));
  }
  getConfig$(): Observable<any> {
    return this._configurationSubject.asObservable();
  }
  getCasinoConfig$(): Observable<any> {
    return this._casinoConfigurationSubject.asObservable();
  }
  getGuestCasinoConfig$(): Observable<any> {
    return this._GuestCasinoConfigurationSubject.asObservable();
  }
  setGuestCasinoConfig(response) {
    this._GuestCasinoConfigurationSubject.next(response);
  }
  getMarketConfig$(): Observable<any> {
    return this._guestMarketConfigurationSubject.asObservable();
  }
  getConfig() {
    return this.httpClient.post(apiEndPointData.data.cau + 'api/Account/GetConfig', {})
      .pipe(map((data: any) => {
        const configData = this.serializeResponse(data.result);
        websiteSettings.data = configData;
        return configData;
      }), catchError(err => { return throwError(err) }))
      .subscribe((response) => this._configurationSubject.next(response), err => console.log('getConfig', err));
  }
  getConfiguration() {
    return this.httpClient.post(apiEndPointData.data.cau + 'api/Account/GetConfig', {})
      .pipe(map((data: any) => {
        const configData = this.serializeResponse(data.result);
        websiteSettings.data = configData;
        return configData;
      }), catchError(err => { return throwError(err) }))
  }

  getCasinoConfig() {
    return this.httpClient.post(apiEndPointData.data.cau + 'api/Account/getCasinoConfig', {})
      .pipe(map((data: any) => {
        casinoGameMenuSettings.data = data.result;
        return data.result;
      }), catchError(err => { return throwError(err) }))
      .subscribe((response) => this._casinoConfigurationSubject.next(response), err => console.log('getCasinoConfig', err));
  }
  getCaptchaCode() {
    return this.httpClient.post(apiEndPointData.data.cau + 'api/Account/GetCaptcha', {}).pipe(catchError(err => throwError(err)));
  }

  getDashboardMarket(id) {
    return this.httpClient.post(apiEndPointData.data.cau + 'api/Account/GetGuestMatchWiseMarket', { "matchId": id }).pipe(catchError(err => throwError(err)));
  }
  GetGuestMLConfig() {
    return this.httpClient.post(apiEndPointData.data.cau + 'api/Account/GetGuestMLConfig', {})
      .pipe(map((data: any) => {
        GuestMLConfig.data = data.result;
        return data.result;
      }), catchError(err => { return throwError(err) }))
      .subscribe((response) => this._guestMarketConfigurationSubject.next(response), err => console.log('getCasinoConfig', err));
  }
  GetGuestCasinoConfig() {
    return this.httpClient.post(apiEndPointData.data.cau + 'api/Account/GetGuestCasinoConfig', {})
      .pipe(map((data: any) => {
        const sdata = this.serializeCasino(data.result);
        GuestCasinoConfig.data = sdata;
        return sdata;
      }), catchError(err => throwError(err)))
      .subscribe((response) => this._GuestCasinoConfigurationSubject.next(response), err => console.log('getCasinoConfig', err));
  }
  getFavoriteGames() {
    return this.httpClient.post(apiEndPointData.data.cau + 'api/Account/getFavoritesGameList', {})
      .pipe(map((data: any) => {
        return data
      }), catchError(err => throwError(err)));
  }
  getAddfavoriteGame(addgame: any) {
    const payload = Object.assign(addgame);
    return this.httpClient.post(apiEndPointData.data.cau + 'api/Account/AddFavoritesGame', payload)
      .pipe(map((data: any) => { return data }), catchError(err => { return throwError(err) }));
  }
  getRemoveFavoriteGame(removegame: any) {
    const payload = Object.assign(removegame);
    return this.httpClient.post(apiEndPointData.data.cau + 'api/Account/RemoveFavoritesGame', payload)
      .pipe(map((data: any) => { return data }), catchError(err => { return throwError(err) }));
  }
  getPushNotification(wpnConfig: any) {
    const payload = Object.assign(wpnConfig);
    return this.httpClient.post(apiEndPointData.data.cau + 'api/Account/CreateDevice', payload)
      .pipe(map((data: any) => { return data }), catchError(err => { return throwError(err) }));
  }
  getBlockData() {
    return this.httpClient.post(apiEndPointData.data.cau + 'api/Account/getBlockData', {})
      .pipe(map((response: any) => {
        if (response.isSuccess) {
          footerInfo.data = response.result;
        }
        return response;
      }), catchError(err => { return throwError(err) }))
      .subscribe((data) => this._footerInfoSubject.next(data), err => console.log('getBlockData', err));
  }
  getPageContent(appAlias: any) {
    return this.httpClient.post(apiEndPointData.data.cau + 'api/Account/getPageContent', { 'appAlias': appAlias })
      .pipe(catchError(err => throwError(err)));
  }
  SignUpLoginWithWA(body: any) {
    return this.httpClient.post(apiEndPointData.data.cau + 'api/B2CUser/SignUpLoginWithWA', body)
      .pipe(map((data: any) => { return data.result }), catchError(err => { return throwError(err) }));
  }
  UpdateUsernamePassword(body: any) {
    return this.httpClient.post(apiEndPointData.data.cau + 'api/B2CUser/UpdateUsernamePassword', body)
      .pipe(map((data: any) => { return data }), catchError(err => { return throwError(err) }));
  }
  getNotification$(): Observable<any> {
    return this._notificationSubject.asObservable();
  }
  notificationList() {
    this.httpClient.post(apiEndPointData.data.cau + 'api/notificationList', {})
      .pipe(map((data: any) => { return data }), catchError(err => { return throwError(err) }))
      .subscribe((response) => this._notificationSubject.next(response), err => console.log('notificationList', err));
  }
  updateNotification(id) {
    return this.httpClient.post(apiEndPointData.data.cau + 'api/UpdateNotification', { "notificationID": id })
      .pipe(map((data: any) => { return data }), catchError(err => { return throwError(err) }));
  }
  getResetPasswordStatus$(): Observable<boolean> {
    return this._ResetPasswordSubject.asObservable();
  }
  getBlockedMarketData() {
    return this.httpClient.post(apiEndPointData.data.cau + 'api/Account/getBlockedMarketData', {})
    .pipe(map((response: any) => {
      if (response.isSuccess) {
        getBlockedMarketData.data = response.result;
      }
    return response;
  }), catchError(err => { return throwError(err) }))
  .subscribe((data) => this._getBlockedMarketDataSubject.next(data), err => console.log('getBlockedMarketData', err));
  }
  setResetPasswordStatus(): Subject<boolean> {
    return this._ResetPasswordSubject;
  }

  serializeResponse(response: any) {
    const object = {};
    for (let key in response.general) {
      if (response.general.hasOwnProperty(key)) {
        object[key] = response.general[key];
      }
    }
    for (let key in response.appWebConfig) {
      if (response.appWebConfig.hasOwnProperty(key)) {
        object[key] = response.appWebConfig[key];
      }
    }
    for (let key in response.permissions) {
      if (response.permissions.hasOwnProperty(key)) {
        object[key] = response.permissions[key];
      }
    }
    for (let key in response.b2cUserInfo) {
      if (response.b2cUserInfo.hasOwnProperty(key)) {
        object[key] = response.b2cUserInfo[key];
      }
    }
    if (response && response.tpGamePermission && response.tpGamePermission !== null && response.tpGamePermission !== undefined) {
      object['tpGamePermission'] = response.tpGamePermission;
    }
    if (response && response.casinoMenu && response.casinoMenu !== null && response.casinoMenu !== undefined) {
      object['casinoMenu'] = response.casinoMenu;
    }
    if (response && response.casinoGameCategory && response.casinoGameCategory !== null && response.casinoGameCategory !== undefined) {
      object['casinoGameCategory'] = response.casinoGameCategory;
    }
    if (response && response.sportList && response.sportList !== null && response.sportList !== undefined) {
      object['sportList'] = response.sportList;
    }
    if (response && response.sportTournamentList && response.sportTournamentList !== null && response.sportTournamentList !== undefined) {
      object['sportTournamentList'] = response.sportTournamentList;
    }
    if (response && response.marketType && response.marketType !== null) {
      try {
        object['marketType'] = JSON.parse(response.marketType);
      } catch (e) {
        console.log('marketType parse error ', e);
        object['marketType'] = [];
      }
    }
    object['isShowBetSlipBelowRunner'] = false;

    return object;
  }
  serializeCasino(res: any) {
    const object = {};
    if (res && res.casinoMenu && res.casinoMenu !== null && res.casinoMenu !== undefined) {
      object['casinoMenu'] = res.casinoMenu;
    }
    if (res && res.casinoGameCategory && res.casinoGameCategory !== null && res.casinoGameCategory !== undefined) {
      object['casinoGameCategory'] = res.casinoGameCategory;
    }
    if (res && res.casinoGameList && res.casinoGameList !== null && res.casinoGameList !== undefined) {
      object['casinoGameList'] = res.casinoGameList.map(item => {
        let casinoGameList: any = {};
        casinoGameList.appCasinoGameID = item.cgi;
        casinoGameList.appGameName = item.gn;
        casinoGameList.appDisplayName = item.dn;
        casinoGameList.appIsActive = item.ia;
        casinoGameList.appIcon = item.ic;
        casinoGameList.appDisplayOrder = item.dor;

        return casinoGameList;
      });
    }
    if (res && res.providerList && res.providerList !== null && res.providerList !== undefined) {
      object['providerList'] = res.providerList.map(item => {
        let providerList: any = {};
        providerList.appProviderID = item.pi;
        providerList.appProviderName = item.pn;
        providerList.appDisplayName = item.dn;
        providerList.appProviderLogo = item.pl;
        providerList.appIsNew = item.isn;
        providerList.appIsActive = item.ia;
        providerList.appIcon = item.ic;
        providerList.appDisplayOrder = item.dor;
        providerList.appDarkLogo = item.dl;

        return providerList;
      });
    }
    return object;
  }
  getNews() {
    return this.httpClient
      .post(apiEndPointData.data.cau + 'api/Account/News', {})
      .pipe(map((data: any) => { return data.result }), take(1), catchError(err => { return throwError(err) }))
      .subscribe((news) => {
        this._newsSubject.next(news);
      }, err => console.log('newsRequest', err));
  }
  isAuthorized() {
    const user = JSON.parse(localStorage.getItem('token'));
    if (user != null) {
      return this.IsAuthorized$().
        pipe(
          map((data: any) => {
            if (data.isAuthorized) {
              if (data.isNewToken) {
                const user = JSON.parse(localStorage.getItem('token'));
                if (user != null) {
                  user.access_token = data.token;
                  user.expireOn = data.expireOn;
                  localStorage.setItem('token', JSON.stringify(user));
                }
              }
              return true;
            } else { return false; }
          }),
          catchError(err => {
            console.log('isAuthorized : ', err);
            return throwError(err);
          })
        );
    } else {
      return false
    }
  }
}
export const websiteSettings: any = {
  data: ''
};
export const casinoGameMenuSettings: any = {
  data: ''
};
export const GuestMLConfig: any = {
  data: ''
};
export const GuestCasinoConfig: any = {
  data: ''
};
export const DCOBanner: any = {
  data: ''
};
export const footerInfo: any = {
  data: ''
};
export const TrendingGames: any = {
  data: []
};
export const MostlyPlayed: any = {
  data: []
};
export const PopularGames: any = {
  data: []
};
export const RecommendGames: any = {
  data: []
};
export const getBlockedMarketData: any = {
  data: ''
};