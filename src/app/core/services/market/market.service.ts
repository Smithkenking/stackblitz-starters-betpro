import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseRequestService } from '@clientApp-core/services/base/base.request.service';

@Injectable({
  providedIn: 'root'
})
export class MarketService extends BaseRequestService {
  constructor(httpClient: HttpClient) {
    super(httpClient);
  }
}
