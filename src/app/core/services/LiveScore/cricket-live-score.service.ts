import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { websiteSettings } from '../authentication/authentication-facade.service';
import { apiEndPointData } from '../config/connfig.service';

@Injectable({
  providedIn: 'root'
})
export class CricketLiveScoreService {
  constructor(private http: HttpClient) {
  }
  getLiveScoreswidget(eventId: any) {
    let url = websiteSettings.data.appScoreWidgetUrl + eventId;
    if (apiEndPointData.data.sbbc && apiEndPointData.data.sbfc) {
     url = websiteSettings.data.appScoreWidgetUrl + eventId + "&color=" + apiEndPointData.data.sbbc + "&font=" + apiEndPointData.data.sbfc;
    }
    return this.http.get(url);
  }
}
