import { Injectable } from '@angular/core';
import { apiEndPointData } from '../config/connfig.service';

@Injectable({
  providedIn: 'root'
})
export class SocialService {

  getGoogleClientId(): string {
    return apiEndPointData.data.googleAppId;
  }

  getFacebookAppId(): string {
    return apiEndPointData.data.faceBookAppId;
  }
}