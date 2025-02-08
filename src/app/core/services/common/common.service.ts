import { Injectable } from '@angular/core';
import { Subject, Observable, BehaviorSubject } from 'rxjs';
import { MarketBet } from '@clientApp-core/models/market/market-bet.model';
import { CookieService } from 'ngx-cookie-service';
import { ChipFacadeService } from '../chip/chip-facade.service';
import { take } from 'rxjs/operators';
import { apiEndPointData } from '../config/connfig.service';
import { MarketRates } from '@clientApp-core/models/market/market-rates.model';
import { MarketRunner } from '@clientApp-core/models/market/market-runner.model';

@Injectable({ providedIn: 'root' })
export class CommonService {

  private _loadingStatus = new Subject<any>();
  private _oneClickStakeStatus = new Subject<any>();
  private _oneClickBetStatus = new Subject<boolean>();
  private _darkThemeStatus = new Subject<boolean>();
  private _isOpenLoginPopup = new Subject<boolean>();
  private _isQuickBetClick = new Subject<boolean>();
  private _isOpenReferEarnPopup = new Subject<boolean>();
  private _casinogamesopen = new Subject<boolean>();
  _allgamesSubject = new Subject<any>();
  _allproviderSubject = new Subject<any>();
  _allCasinogameSubject = new Subject<any>();
  private _realBalanceUseStatus = new Subject<boolean>();
  private _eventCountSubject = new Subject<any>();
  private previousUrl: BehaviorSubject<string> = new BehaviorSubject<string>(null);
  public previousUrl$: Observable<string> = this.previousUrl.asObservable();

  centralizationIds: string;
  inPlayStatus = false;
  public sessionPostion: any = [];
  configData: any;
  marketClientBets: MarketBet[] = [];
  allMarkets = []; 
  selectedTab = 'Home';
  selectedRecingGame = '';
  isMarketLiabilityClick: boolean;
  isShowLiveTvCenter = false;
  ipAddress: string = '';
  chipList: any = [];
  isNewsExits: boolean = false;
  isCheckAcceptAnyOdds: boolean = false;
  curMarketsVol: MarketRates[] = [];
  curMarketsRunners: MarketRunner[] = [];
  FavoriteIds: any = [];
  accountbalance: any;
  transactioncount: any;
  selectedSport = 'All Sports';
    accountliability: any;
  constructor(private cookieService: CookieService , private chipService: ChipFacadeService) { }
  
  setCookieValue(name: string, value: string,expires?: number) {
    const domain = window.location.hostname;
    this.cookieService.set(name, value, expires ? expires : 365,'/',domain ? domain : '',false,'Lax');
  }
  getCookieValue(name: string) {
    return this.cookieService.get(name);
  }
  getAllCookieValue() {
    return this.cookieService.getAll();
  }
  getCasinoOpenStatus(): Observable<boolean> {
      return this._casinogamesopen.asObservable();
   }
   setCasinoOpenStatus(status: boolean) {
       this._casinogamesopen.next(status);
   }
  deleteCookieValue(name: string) {
    return this.cookieService.delete(name);
  }
  getOneClickStakeStatus(): Observable<string> {
    return this._oneClickStakeStatus.asObservable();
  }
  setOneClickStakeStatus(stake: string) {
    this._oneClickStakeStatus.next(stake);
  }
  getOneClickBetStatus(): Observable<boolean> {
    return this._oneClickBetStatus.asObservable();
  }
  setOneClickBetStatus(isChecked: boolean) {
    this._oneClickBetStatus.next(isChecked);
  }
  getDarkThemeStatus(): Observable<boolean> {
    return this._darkThemeStatus.asObservable();
  }
  setDarkThemeStatus(isChecked: boolean) {
    this._darkThemeStatus.next(isChecked);
  }
  getLoadingStatus(): Observable<boolean> {
    return this._loadingStatus.asObservable();
  }
  setLoadingStatus(status: boolean) {
    this._loadingStatus.next(status);
  }
  getLoginPopupOpen(): Observable<boolean> {
    return this._isOpenLoginPopup.asObservable();
  }
  setLoginPopupOpen(status: boolean) {
    this._isOpenLoginPopup.next(status);
  }
  getQuickBetStatus(): Observable<boolean> {
    return this._isQuickBetClick.asObservable();
  }
  setQuickBetStatus(status: boolean) {
    this._isQuickBetClick.next(status);
  }
  getReferEarnOpenStatus(): Observable<boolean> {
    return this._isOpenReferEarnPopup.asObservable();
  }
  setReferEarnOpenStatus(status: boolean) {
    this._isOpenReferEarnPopup.next(status);
  }
  imgRelativePath(path: string): string {
    return apiEndPointData.data.themeBasePath + path;
  }
  contentRelativePath(path: string): string {
    return apiEndPointData.data.commonContentPath + path;
  } 
  allgames$(): Observable<string> {
    return this._allgamesSubject.asObservable();
  }
  allgamesget(status: string) {
      this._allgamesSubject.next(status);
  }

  allprovider$(): Observable<string> {
    return this._allproviderSubject.asObservable();
  }
  allprovidersget(status: string) {
      this._allproviderSubject.next(status);
  }
  allCasinogame$(): Observable<string> {
    return this._allCasinogameSubject.asObservable();
  }
  allCasinogameget(status: string) {
      this._allCasinogameSubject.next(status);
  }

  getAllChips() {
    this.chipService.getChips$().pipe(take(1)).subscribe(chipResponse => {
      this.chipList = chipResponse;
    });
  }
getRealBalanceUseStatus(): Observable<boolean> {
    return this._realBalanceUseStatus.asObservable();
  }
  setRealBalanceUseStatus(isChecked: boolean) {
    this._realBalanceUseStatus.next(isChecked);
  }
  getEventCounts(): Observable<any> {
    return this._eventCountSubject.asObservable();
  }
  setEventCounts(eventType: string, count: any) {
    this._eventCountSubject.next({event: eventType,count: count});
  }
  setPreviousUrl(previousUrl: string) {
    this.previousUrl.next(previousUrl);
  }
}


