import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  configurations: any;
  baseurl: any;
  jsonData: any;
  constructor(private http: HttpClient) {
  }
  loadAppConfig() {
    let promise = new Promise<void>((resolve, reject) => {
      this.http.get('assets/json/config.json?v=6.72.0.0').subscribe((data: any) => {
        this.jsonData = data;
        this.http.post(data.getInitDataUrl + '/api/Account/GetGuestInitData', {})
          .toPromise()
          .then((response: any) => { // Success
            apiEndPointData.data = this.serializeResponse(response.result);  
            resolve();
          }).catch(err => {
            data.inMaintenance = true;
            apiEndPointData.data = data;
            resolve();
            console.log('Configuration Failed');
          });
      });
    });
    return promise;
  }
  apiBaseUrl() {
    if (!this.configurations) {
      throw Error('Config file not loaded!');
    }
    return this.configurations;
  }
  serializeResponse(response: any) {
    let initData = {};
    if (response) {
      initData =Object.assign([],response.initData);
      if (response.themes && response.themes.length > 0) {
        const themeData = Object.assign([],response.themes[0]);
        initData['themes'] = themeData;
        this.jsonData['themeBasePath'] = themeData.tp;
        if (themeData.idl) {
          this.jsonData['logoUrl'] = themeData.dl;
          this.jsonData['lightLogoUrl'] = themeData.ll;
          this.jsonData['darkLogoUrl'] = themeData.dl;
        } else {
          this.jsonData['logoUrl'] = themeData.dl;
          this.jsonData['lightLogoUrl'] = themeData.ll;
          this.jsonData['darkLogoUrl'] = themeData.dl;
        }
      } else {
        console.log('Not found themes data');
        this.jsonData['themeBasePath'] = this.jsonData['commonContentPath'];
      }
      if (response.banners && response.banners !== null && response.banners !== undefined) {
        initData['banners'] = response.banners;
      }
      for (let key in response.appWebConfig) {
        if (response.appWebConfig.hasOwnProperty(key)) {
          initData[key] = response.appWebConfig[key];
        }
      }
    } else {
      console.log('Not found config data');
      this.jsonData['themeBasePath'] = this.jsonData['commonContentPath'];
    }
    initData['isShowBetSlipBelowRunner'] = false;
    initData['inMaintenance'] = response.initData.inMaintenance;
    const mergeData = { ...initData, ...this.jsonData };
    return mergeData;
  }

}
export const apiEndPointData: any = {
  data: ''
};
