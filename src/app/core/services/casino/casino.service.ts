import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { apiEndPointData } from '@clientApp-core/services/config/connfig.service';
import { ToastrService } from 'ngx-toastr';
import { catchError } from 'rxjs/operators';
import { CommonService } from '../common/common.service';
import { Router } from '@angular/router';
import { websiteSettings } from '../authentication/authentication-facade.service';
import { userProfileInfo } from '../authentication/b2c-user.service';
import { DataLayerService } from '../window/DataLayerService.service';
declare var BetGames: any;
@Injectable({
    providedIn: 'root'
})
export class CasinoService {
    lobby = 'true';
    reloadURL = '';
    casinoData: any;

    constructor(private http: HttpClient, private toastr: ToastrService,private dataLayerService: DataLayerService,
        public commonService: CommonService, private router: Router) {
    }
    getCasinoToken(params) {
        let CasinoObj = new Object({
            id: params.angularCasinoGameId,
            type: 'Casino',
            date: new Date()
        }), selectedCasino = [];
          if (this.commonService.getCookieValue('recentPlayedgame')) {
            var getCasinoCookie = JSON.parse(this.commonService.getCookieValue('recentPlayedgame'));
          }
          if (getCasinoCookie != null) {
            selectedCasino = getCasinoCookie;
          }
          
        selectedCasino.push(CasinoObj);
        this.commonService.setCookieValue('recentPlayedgame', JSON.stringify(selectedCasino));
        this.casinoData = JSON.parse(localStorage.getItem('casino'));
        const requestBody = { 'strGameCode': params.gameCode, 'tpGameId': params.types, 'tpGameTableId': params.gameCode, 'strProviderCode': params.providerCode };
        const _currentSet ={
            'event': 'casino_game_clicked',
           'game_name': params.name,
           'phone': '+' + userProfileInfo.data.appMobileNo,
            };
            this.dataLayerService.pingHome(_currentSet);
        this.http.post(apiEndPointData.data.cau + 'api/Account' + params.apiEndPoint, requestBody).pipe(catchError(err => throwError(err)))
            .subscribe((response: any) => {
                this.commonService.setLoadingStatus(false);
                if (response !== '' && response !== null && response !== undefined) {
                    if (response.data === '' || response.data === null) {
                        this.toastr.error(response.errorMessage,"Notification",{
                            toastClass: "custom-toast-error"
                          });
                        if(this.casinoData!==undefined && this.casinoData!==null){
                            this.router.navigate(['/live-casino']);
                        };
                    } else {
                        if (response.data === null && response.status !== null) {
                            if (response.status.code !== '0') {
                                this.toastr.error(response.status.returnMessage,"Notification",{
                                    toastClass: "custom-toast-error"
                                  });
                            }
                        }
                        if (response.data === undefined || response.data === null) {
                            this.toastr.error(response.errorMessage,"Notification",{
                                toastClass: "custom-toast-error"
                              });
                        } else {
                            if(response.data.useURL === false){
                            if(!response.data.param) { this.toastr.error(response.data.errorMessage,"Notification",{
                                toastClass: "custom-toast-error"
                              }); }
                            if (response.data.param && response.data.param.sportName === "BetGame") {
                             let production_server = response.data.param.your_production_server;
                             var _bt = _bt || [];
                             _bt.push(['server', production_server]);
                             _bt.push(['partner', response.data.param.your_partner_code]);
                             _bt.push(['token', response.data.param.player_token]);
                             _bt.push(['language', response.data.param.language_code]);
                             _bt.push(['timezone', response.data.param.timezone_utc]);
                             _bt.push(['current_game', response.data.param.current_game]);
                             BetGames.frame(_bt);
                           }
                        } else {
                            let lobby = response.data.lobbyURL;
                            if (params.types === 'casino') {
                                const LiveCasinoUrl = websiteSettings.data.appLivecasinoapiUrl;
                                const token = response.data['token'];
                                lobby = LiveCasinoUrl + '/signin/viewer/walletGameLogin.jsp?token=' + token +
                                    '&lobby=' + this.lobby + '&reloadURL=' + this.reloadURL;
                            }
                            if (lobby) {
                                if (websiteSettings.data.isOpenGameInSameTab) {
                                    window.location.href = lobby;
                                } else if (websiteSettings.data.openGameInNewTab) {
                                    window.open(lobby, '_blank');
                                } else {
                                    localStorage.setItem('lobbyUrl', lobby);
                                    if (params.gameCode !== null && params.gameCode !== undefined && params.gameCode !== 'null' && params.gameCode !== 'NULL') {
                                        this.router.navigate(['casinoGame', (params.gameCode ? params.gameCode : 'all')]);
                                    } else if(params.types !== null && params.types !== undefined && params.types !== 'null' && params.types !== 'NULL') {
                                        this.router.navigate(['casinoGame', params.types]);
                                    } else {
                                        const gameName = params.name.replace(/ /g, '');
                                        const types = gameName !== null && gameName !== undefined && gameName !== '' ? gameName : 'liveCasino';
                                        this.router.navigate(['casinoGame', types]);
                                    }
                                    
                                }
                            } else {
                                if(response.data && response.data.errorMessage) {
                                    this.toastr.error(response.data.errorMessage,"Notification",{
                                        toastClass: "custom-toast-error"
                                      });
                                    if(this.casinoData!==undefined && this.casinoData!==null){
                                        this.router.navigate(['/live-casino']);
                                    };
                                } else {
                                    this.toastr.error(response.errorMessage,"Notification",{
                                        toastClass: "custom-toast-error"
                                      });
                                }
                            }
                        }
                        }
                    }
                }
                localStorage.removeItem('casino');
            }, err => {
                this.commonService.setLoadingStatus(false);
                console.log('getCasinoToken', err);
            });
    }
}
