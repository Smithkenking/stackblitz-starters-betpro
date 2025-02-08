import { Authenticate } from '@clientApp-core/models/auth/authentication.models';
import { BaseRequest } from '@clientApp-core/models/base/base-request.model';

export class LoginRequest implements BaseRequest<Authenticate> {
    constructor(public body: any, public queryParameter: Authenticate, public endPoint: string, public baseUrl: string = null) {}
}
export class ConfigRequest implements BaseRequest<any> {
  constructor(public body: any, public queryParameter: any, public endPoint: string, public baseUrl: string = null) {}
}
export function mapLoginRequest(name: string, password: string, Captcha: string, RequestId: string,LoginWith: number): BaseRequest<Authenticate> {
  // const auth = new Authenticate(name, password, Captcha, RequestId,LoginWith);
  const auth = {
    "UserName": name,
    "Password": password,
    "Captcha": Captcha,
    "RequestId": RequestId,
    "LoginWith": LoginWith
  }
  const request = new LoginRequest(auth, null , mapEndpoint('Login'));
  return request;
}
export function mapConfigRequest(): BaseRequest<any> {
   const request = new ConfigRequest({}, {}, mapConfigEndpoint(''));
   return request;
}
export function mapPushNotificationConfigRequest(wpn: any): BaseRequest<any> {
  const payload = Object.assign(wpn);
  const request = new ConfigRequest(payload, {}, mapPushNotificationConfigEndpoint(''));
  return request;
}
export function mapCasinoConfigRequest(): BaseRequest<any> {
  const request = new ConfigRequest({}, {}, mapCasinoConfigEndpoint(''));
  return request;
}
 export function mapIsAuthorizedRequest(): BaseRequest<any> {
      const request = new LoginRequest({}, null, mapEndpoint('IsAuthorized'));
   return request;
}
export function mapLogoutRequest(): BaseRequest<any> {
  const request = new LoginRequest({}, null, mapLogoutEndpoint(''));
  return request;
}
export function CaptchaCodeRequest(): BaseRequest<any> {
  const request = new LoginRequest({}, null, CaptchaCodeEndPoint(''));
  return request;
}
export function mapGetGuestMLConfigEndPointRequest(): BaseRequest<any> {
  const request = new LoginRequest({}, null, GetGuestMLConfigEndPoint(''));
  return request;
}
export function mapGetGuestCasinoConfigEndPointRequest(): BaseRequest<any> {
  const request = new LoginRequest({}, null, GetGuestCasinoConfigEndPoint(''));
  return request;
}
export function mapGetDashboardMarketRequest(id): BaseRequest<any> {
  const request = new LoginRequest({"matchId":id}, null, mapGetDashboardMarketEndpoint(''));
  return request;
}
export function mapFavoriteGamesRequest(): BaseRequest<any> {
  const request = new ConfigRequest({}, {}, mapFavoritesGameEndpoint(''));
  return request;
}
export function mapAddFavoriteGameRequest(addgame: any): BaseRequest<any> {
  const payload = Object.assign(addgame);
  const request = new ConfigRequest(payload, {}, mapAddFavoriteGamePoint(''));
  return request;
}
export function mapRemoveFavoriteGameRequest(removegame: any): BaseRequest<any> {
  const payload = Object.assign(removegame);
  const request = new ConfigRequest(payload, {}, mapRemoveFavoriteGamePoint(''));
  return request;
}
export function mapisBlackListIpAddressRequest(): BaseRequest<any> {
  const request = new ConfigRequest({}, {}, mapisBlackListIpAddress(''));
  return request;
}
export function mapBlockDataRequest(): BaseRequest<any> {
  const request = new ConfigRequest({}, {}, 'api/Account/getBlockData');
  return request;
}
export function mapPageContentRequest(appAlias:any): BaseRequest<any> {
  const request = new ConfigRequest({'appAlias': appAlias}, {}, 'api/Account/getPageContent');
  return request;
}
export function mapgetBlogCategoryRequest(): BaseRequest<any> {
  const request = new ConfigRequest({}, {}, 'api/Account/getBlogCategoryData');
  return request;
}
export function mapgetTrendingGamesRequest(): BaseRequest<any> {
  const request = new ConfigRequest({}, {}, mapgetTrendingGamesEndpoint(''));
  return request;
}
export function mapgetMostlyPlayedRequest(): BaseRequest<any> {
  const request = new ConfigRequest({}, {}, mapgetMostlyPlayedEndpoint(''));
  return request;
}
export function mapgetBlogRequest(): BaseRequest<any> {
  const request = new ConfigRequest({}, {}, 'api/Account/getBlogData');
  return request;
}

export function mapgetPopularGamesRequest(): BaseRequest<any> {
  const request = new ConfigRequest({}, {}, mapgetPopularGamesEndpoint(''));
  return request;
}
export function mapgetRecommendGamesRequest(): BaseRequest<any> {
  const request = new ConfigRequest({}, {}, mapgetRecommendGamesEndpoint(''));
  return request;
}
export function mapSetRealBalanceUseRequest(): BaseRequest<any> {
  const request = new ConfigRequest({}, {}, 'api/Account/SetRealBalanceUse');
  return request;
}
export function mapSignUpLoginWithWARequest(body): BaseRequest<any> {
  const request = new ConfigRequest(body, {}, 'api/B2CUser/SignUpLoginWithWA');
  return request;
}
export function mapUpdateUsernamePasswordRequest(body): BaseRequest<any> {
  const request = new ConfigRequest(body, {}, 'api/B2CUser/UpdateUsernamePassword');
  return request;
}
export function mapnotificationListRequest(): BaseRequest<any> {
  const request = new ConfigRequest({}, {}, 'api/notificationList');
  return request;
}
export function mapUpdateNotificationRequest(id): BaseRequest<any> {
  const request = new ConfigRequest({"notificationID":id}, {}, 'api/UpdateNotification');
  return request;
}
export function mapDemoLoginRequest(body): BaseRequest<any> {
  const request = new ConfigRequest(body, {}, 'api/Account/DemoLogin');
  return request;
}
export function mapGetGuestMatchWiseMarketMultipleRequest(matchIds): BaseRequest<any> {
  const request = new LoginRequest({"matchIds":matchIds}, null, 'api/Account/GetGuestMatchWiseMarketMultiple');
  return request;
}
export function mapNewsRequest(): BaseRequest<any> {
  const request = new ConfigRequest({}, {},'api/Account/News');
  return request;
}
export function mapEndpoint(endPoint: string): string {
  let endPointUrl = '';
  switch (endPoint) {
  case 'Login':
  {
    endPointUrl = 'api/Account/Login';
    break;
  }
  case 'IsAuthorized':
  {
    endPointUrl = 'api/Account/IsAuthorized';
  }
  }

  return endPointUrl;
}
export function mapConfigEndpoint(endPoint: any): string {
  const endPointUrl = 'api/Account/GetConfig';
  return endPointUrl;
}
export function mapgetTrendingGamesEndpoint(endPoint: any): string {
  const endPointUrl = 'api/Account/getTrendingGamesList';
  return endPointUrl;
}
export function mapgetMostlyPlayedEndpoint(endPoint: any): string {
  const endPointUrl = 'api/Account/getMostlyPlayedGamesList';
  return endPointUrl;
}
export function mapgetPopularGamesEndpoint(endPoint: any): string {
  const endPointUrl = 'api/Account/getPopularGamesList';
  return endPointUrl;
}
export function mapgetRecommendGamesEndpoint(endPoint: any): string {
  const endPointUrl = 'api/Account/getUserRecommendationGamesList';
  return endPointUrl;
}
export function mapPushNotificationConfigEndpoint(endPoint: any): string {
  const endPointUrl = 'api/Account/CreateDevice';
  return endPointUrl;
}
export function mapCasinoConfigEndpoint(endPoint: any): string {
  const endPointUrl = 'api/Account/getCasinoConfig';
  return endPointUrl;
}
export function mapLogoutEndpoint(endPoint: any): string {
  const endPointUrl = 'api/Account/Logout';
  return endPointUrl;
}
export function CaptchaCodeEndPoint(endPoint: any): string {
  const endPointUrl = 'api/Account/GetCaptcha';
  return endPointUrl;
}

export function mapGetDashboardMarketEndpoint(endPoint: any): string {
    const endPointUrl = 'api/Account/GetGuestMatchWiseMarket';
    return endPointUrl;
  }
export function GetGuestCasinoConfigEndPoint(endPoint: any): string {
    const endPointUrl = 'api/Account/GetGuestCasinoConfig';
    return endPointUrl;
}
export function GetGuestMLConfigEndPoint(endPoint: any): string {
  const endPointUrl = 'api/Account/GetGuestMLConfig';
  return endPointUrl;
}
export function mapFavoritesGameEndpoint(endPoint: any): string {
  const endPointUrl = 'api/Account/getFavoritesGameList';
  return endPointUrl;
}
export function mapAddFavoriteGamePoint(endPoint: any): string {
  const endPointUrl =  'api/Account/AddFavoritesGame';
  return endPointUrl;
}
export function mapRemoveFavoriteGamePoint(endPoint: any): string {
  const endPointUrl =  'api/Account/RemoveFavoritesGame';
  return endPointUrl;
}
export function mapisBlackListIpAddress(endPoint: any): string {
  const endPointUrl =  'api/Account/isBlackListIpAddress';
  return endPointUrl;
}
