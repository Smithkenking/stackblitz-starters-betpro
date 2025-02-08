import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
// import { Router } from '@angular/router';
import { AuthFacadeService, casinoGameMenuSettings, GuestCasinoConfig, websiteSettings } from '@clientApp-core/services/authentication/authentication-facade.service';
import { CasinoService } from '@clientApp-core/services/casino/casino.service';
import { CommonService } from '@clientApp-core/services/common/common.service';
import { apiEndPointData } from '@clientApp-core/services/config/connfig.service';
import { SharedModule } from '@clientApp-shared/shared.module';
import { untilDestroyed } from 'ngx-take-until-destroy';
import { ToastrService } from 'ngx-toastr';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
  standalone: true,
  imports:[CommonModule,SharedModule],
  selector: 'app-right-content',
  templateUrl: './right-content.component.html',
  styleUrls: ['./right-content.component.scss']
})
export class RightContentComponent implements OnInit, OnDestroy {
  isB2C: boolean;
  @Output() openPopup = new EventEmitter();
  constructor(private authService: AuthFacadeService, private commonService : CommonService, public router: Router,private toastr: ToastrService, private casinoService: CasinoService) { }

  ngOnInit(): void {
    this.getConfig();
    if (!this.isUserActive()) {
      this.isB2C = apiEndPointData.data.isB2C;
    } else {
      this.isB2C = websiteSettings.data.isB2C; 
    }
  }
  getConfig() {
    this.authService.getConfig$()
        .pipe(
            untilDestroyed(this),
            catchError(err => throwError(err))
        ).subscribe(response => {
            if (response) {
                this.isB2C = websiteSettings.data.isB2C;
            }
        }, err => console.log('getConfig', err));
}
  onAviatorClick() {
    if (!this.isUserActive()) {
      this.commonService.setLoginPopupOpen(true);
      const selectedProvider = 'Spribe';
    const selectedgame = 'Aviator';
    const casinoGameMenu = GuestCasinoConfig.data.casinoMenu ? GuestCasinoConfig.data.casinoMenu : [];
    const item = casinoGameMenu.find(x => x.nm?.toLowerCase().replace(/\s/g, '') === selectedgame.toLowerCase().replace(/\s/g, '') && 
      x.pn?.toLowerCase().replace(/\s/g, '') === selectedProvider.toLowerCase().replace(/\s/g, ''));
      if (item) {
        let casinoMenu: any = {};
        casinoMenu.name = item.nm;
        casinoMenu.icon = item.ic;
        casinoMenu.isActive = item.ia;
        casinoMenu.isShow = item.isw;
        casinoMenu.types = item.ty;
        casinoMenu.isNewGame = item.ing;
        casinoMenu.gameCode = item.gc;
        casinoMenu.apiParamName = item.apn;
        casinoMenu.apiEndPoint = item.aep;
        casinoMenu.categoryID = item.ci;
        casinoMenu.displayOrder = item.dor;
        casinoMenu.appCasinoGameID = item.cgi;
        casinoMenu.appProviderID = item.pid;
        casinoMenu.isPopular = item.isd;
        casinoMenu.gameType = item.gt;
        casinoMenu.providerName = item.pn;
        localStorage.setItem('casino', JSON.stringify(casinoMenu));
        sessionStorage.setItem('isAviatorGameOpen', JSON.stringify({ isAviatorGameOpen: true }));
      }
    } else {
      const selectedProvider = 'Spribe';
      const selectedgame = 'Aviator';
      const casinoGameMenu = casinoGameMenuSettings.data.casinoMenu ? casinoGameMenuSettings.data.casinoMenu : [];
      const param = casinoGameMenu.find(x => x.name?.toLowerCase().replace(/\s/g, '') === selectedgame.toLowerCase().replace(/\s/g, '') &&
        x.providerName?.toLowerCase().replace(/\s/g, '') === selectedProvider.toLowerCase().replace(/\s/g, ''));
      if (param) {
        this.commonService.setLoadingStatus(true);
        this.casinoService.getCasinoToken(param);
        sessionStorage.setItem('isAviatorGameOpen', JSON.stringify({ isAviatorGameOpen: true }));
      } else {
        this.toastr.error('Game is currently disabled',"Notification",{
          toastClass: "custom-toast-error"
        });
      }
    }
}
  isUserActive():boolean {
    let userActive: boolean = false;
    const user = JSON.parse(localStorage.getItem('token'));
    if (user != null) {
      userActive = true
    }
    return userActive;
  }
  ngOnDestroy(): void {
    
  }
}
