import { Injectable } from '@angular/core';
import { DeviceDetectorService } from 'ngx-device-detector';

@Injectable({
    providedIn: 'root'
  })
export class DeviceInfoService {
    constructor(private deviceService: DeviceDetectorService) {}

    getDeviceInfo () {
        return this.deviceService.getDeviceInfo();
    }
    isDesktop () {
        return this.deviceService.isDesktop();
    }
    isTablet () {
        return this.deviceService.isTablet();
    }
    isMobile () {
        return this.deviceService.isMobile();
    }
}
