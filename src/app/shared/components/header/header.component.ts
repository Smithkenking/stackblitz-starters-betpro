import { Component, OnInit, OnDestroy, ViewChild, AfterViewInit, ElementRef } from '@angular/core';
import { BetFacadeService, clientBalance } from '@clientApp-core/services/bet/bet.facade.service';
import { of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { untilDestroyed } from 'ngx-take-until-destroy';
import { LiabilityComponent } from '@clientApp-shared/components/liability/liability.component';
declare var $: any;
import { take, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { CommonService } from '@clientApp-core/services/common/common.service';
import { AuthFacadeService, GuestMLConfig, casinoGameMenuSettings, websiteSettings } from '@clientApp-core/services/authentication/authentication-facade.service';
import { apiEndPointData } from '@clientApp-core/services/config/connfig.service';
import * as M from "materialize-css/dist/js/materialize";
import { GetDateSortOrder, GetSortOrder } from '@clientApp-core/utilities/app-configuration';
import { mapGroupByKey, mapUniqueData, sortBySport } from '@clientApp-core/services/shared/JSfunction.service';
import { MarketRateFacadeService } from '@clientApp-core/services/market/market-rates/market-rate-facade.service';
import { ToastrService } from 'ngx-toastr';
import { DeviceInfoService } from '@clientApp-core/services/device-info/deviceinfo.services';
import { CasinoService } from '@clientApp-core/services/casino/casino.service';
import { CommonModule, DatePipe } from '@angular/common';
import { AudioType } from '@clientApp-core/enums/audio.types';
import { DataLayerService } from '@clientApp-core/services/window/DataLayerService.service';
import { FanceType } from '@clientApp-core/enums/market-fancy.type';
import { MarketFacadeService } from '@clientApp-core/services/market/market-facade.service';
import { IToastButton } from 'app/custom-toast/custom-toast.component';
import { mapMarketTorunaments, appTournament, leftSidebarMapMarket, mapMatch } from '@clientApp-core/services/shared/dashboard-shared.service';
import { StoreService } from '@clientApp-core/services/store/store.service';
import { SharedModule } from '@clientApp-shared/shared.module';
import { Router, ActivatedRoute } from '@angular/router';
import { LeftSidebarComponent } from "../sidebar/left/left.sidebar.component";
import { UserMenuComponent } from "../user-menu/user-menu.component";

@Component({
    standalone: true,
    selector: 'pb-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss'],
    imports: [CommonModule, SharedModule, LeftSidebarComponent, UserMenuComponent, LiabilityComponent]
})
export class HeaderComponent implements OnInit, AfterViewInit, OnDestroy {
    @ViewChild('notificationModal', { static: true }) notificationtemp: ElementRef;
    @ViewChild('liability', { static: true }) liabilityRef: LiabilityComponent;
    user: any;
    account: any;
    markets = [];
    allMarkets: any = [];
    isListwithTournament: boolean;
    excludeSport = [];
    news: any;
    loading = false;
    logoUrl = apiEndPointData.data.logoUrl;
    config: any;
    isNewsExits: boolean = false;
    isCheckedDarkTheme: boolean = false;
    isB2C: boolean;
    WalletList: any = [];
    isWager: boolean = false;
    isUserMenuTrigger: boolean = false;
    isAutowagerPlacebet: boolean;
    isSidemenuTrigger: boolean = false;
    click_id: any = '';
    referralcode: any = '';
    mkt: any = '';
    selectedSport = 'Home';
    notificationList: any = [];
    unReadNotifications: number = 0;
    notificationRef;
    selectedNotification: any;
    isShowVirtualSports: boolean = false;
    notinstances: any
    toastButtons: IToastButton[] = [
        {
            id: "1",
            title: "Deposit"
        },
        {
            id: "2",
            title: "Refer a friend"
        }
    ];
    @ViewChild('userMenu') userMenu: ElementRef;
    @ViewChild('userMenuList') userMenuList: ElementRef;
    @ViewChild('userSetting') userSetting: ElementRef;
    @ViewChild('searchInput') searchInput: ElementRef;
    virtualSportsWorker: any;
    excludeSports: any;
    constructor(public betService: BetFacadeService, public router: Router, private route: ActivatedRoute, private marketService: MarketFacadeService,
        public deviceInfoService: DeviceInfoService, private casinoService: CasinoService, private dataLayerService: DataLayerService,
        public commonService: CommonService, private toastr: ToastrService,
        private authService: AuthFacadeService, private marketRateFacadeService: MarketRateFacadeService, public datepipe: DatePipe) {
        this.commonService.getDarkThemeStatus().subscribe(isChecked => {
            this.isCheckedDarkTheme = isChecked;
            this.checkIsDarkThemeExists();
        });
        this.route.queryParams.subscribe(params => {
            if (params && params['referralcode'] && params['referralcode'] !== '' && apiEndPointData.data.isB2C) {
                this.commonService.setCookieValue('referralcodeset', JSON.stringify(params['referralcode']), 30);
                this.referralcode = params['referralcode'];
            } else if (params && params['mkt'] && params['mkt'] !== '' && apiEndPointData.data.isB2C) {
                this.mkt = params['mkt'];
            }
            if (params && params['click_id'] && params['click_id'] !== '' && apiEndPointData.data.isB2C) {
                this.click_id = params['click_id'];
            }
        });
    }

    ngOnInit() {
        this.user = JSON.parse(localStorage.getItem('token'));
        this.excludeSports = apiEndPointData.data.excludeSports;
        this.excludeSport = this.excludeSports.map(x => x.name);
        if (this.user != null) {
            this.isB2C = websiteSettings.data.isB2C;
            this.isWager = !websiteSettings.data.appIsRealBalanceUse;
            this.isAutowagerPlacebet = websiteSettings.data.appIsAutowagerPlacebet;
            this.isListwithTournament = websiteSettings.data.isLeftSideBarTournamentView;
            this.getMarkets();
            this.getConfig();
            this.betService.getBalanceAndWallet();
            this.betService.checkBalanceAndWallet$().pipe(
                switchMap((resp) => {
                    return of(resp);
                }
                )
            ).subscribe(value => {
                this.account = value.clientBalance;
                this.WalletList = value.lstWalletAmount;
                if (this.account && this.account.liability) {
                    this.account.liability = Math.abs(this.account.liability);
                }
                this.commonService.accountbalance = this.account.balance;
                const output = '1';
                const getLowBalMsg = localStorage.getItem('showLowBalMsg');
                if (this.account.balance == 0 && getLowBalMsg !== output) {
                    localStorage.setItem('showLowBalMsg', '1');
                    this.router.navigateByUrl('/deposit');
                } else if (this.account.balance < 100 && getLowBalMsg !== output) {
                    localStorage.setItem('showLowBalMsg', '1');
                    this.toastr.error('Your balance is low, please Recharge now and start earning more!', "Low balance", {
                        toastClass: "custom-toast-error",
                        closeButton: true,
                        timeOut: 0,
                        tapToDismiss: false,
                        // @ts-ignore
                        buttons: this.toastButtons
                    })
                        .onAction.subscribe(x => {
                            // alert(`${x.title} is pressed`);
                            // console.log(x);
                            if (x.title == 'Deposit') {
                                this.router.navigateByUrl('/deposit');
                            } else if (x.title == 'Refer a friend') {
                                this.router.navigateByUrl('/referandearn');
                            }
                        });
                    //   }).onTap
                    //   .pipe(take(1))
                    //   .subscribe(() => { this.router.navigateByUrl('/deposit');});

                }
            });
            this.authService.getNews();
            this.getNews();
            this.getBalanceAndLiability();
            this.authService.notificationList();
            this.getNotificationList();
            this.marketRateFacadeService.getNotificationFromSignalr$().subscribe((item: any) => {
                this.marketRateFacadeService.setAudioType().next(AudioType.notification);
                this.selectedNotification = item;
                this.notificationRef.open();
                if (item?.isc && item?.dpt) {
                    setTimeout(() => {
                        this.notificationRef?.close();
                        this.selectedNotification = null;
                    }, item?.dpt);
                }
                this.authService.notificationList();
            });
            const allMarkets = this.marketService.marketList;
            // this.isShowVirtualSports = allMarkets.some(el => el.mt == FanceType.Sportbook);
            const sportTournamentList = websiteSettings.data.sportTournamentList ? websiteSettings.data.sportTournamentList : [];
            const tids:any = mapUniqueData(sportTournamentList, 'tid');
            this.isShowVirtualSports = allMarkets.filter(item => tids.includes(item.tid)).length > 0;
        } else {
            this.isB2C = apiEndPointData.data.isB2C;
            this.isListwithTournament = apiEndPointData.data.ilstv;
            const allMarkets = GuestMLConfig.data.allActiveMarketList ? GuestMLConfig.data.allActiveMarketList : [];
            // this.isShowVirtualSports = allMarkets.some(el => el.mt == FanceType.Sportbook);
            const sportTournamentList = GuestMLConfig.data.sportTournamentList ? GuestMLConfig.data.sportTournamentList : [];
            const tids:any = mapUniqueData(sportTournamentList, 'tid');
            this.isShowVirtualSports = allMarkets.filter(item => tids.includes(item.tid)).length > 0;
            this.getGuestMLConfig();
        }
        $(".dropdown-trigger").dropdown();
        const darkThemeCurrentState = this.commonService.getCookieValue('isCheckedDarkTheme');
        this.isCheckedDarkTheme = (darkThemeCurrentState != null && darkThemeCurrentState != undefined && darkThemeCurrentState != '') ? JSON.parse(darkThemeCurrentState).isCheckedDarkTheme : false;
        this.checkIsDarkThemeExists();
        if (typeof Worker !== 'undefined') {

            this.virtualSportsWorker = new Worker('../../../worker/virtualsports.worker',
                { type: "module" });
            this.virtualSportsWorker.onmessage = ({ data }) => {
                let allMarkets = [];
                if (this.user != null) {
                    allMarkets = this.marketService.marketList;
                } else {
                    allMarkets = GuestMLConfig.data.allActiveMarketList ? GuestMLConfig.data.allActiveMarketList : [];
                }
                allMarkets = allMarkets.concat(data);
                if (this.user != null) {
                    this.marketService.marketList = allMarkets;
                } else {
                    GuestMLConfig.data.allActiveMarketList = allMarkets;
                }
                this.allMarkets = allMarkets;
                this.getMarketList();
            };
        } else {
            // Web workers are not supported in this environment.
            // You should add a fallback so that your 
            // program still executes correctly.
        }
        this.marketRateFacadeService.getAddNewDashboardMarketInfo$().subscribe(data => {
            this.virtualSportsWorker.postMessage(data);
        });
    }

    getMarketList() {
        if (this.user != null) {
            this.allMarkets = this.marketService.marketList;
        } else {
            this.allMarkets = GuestMLConfig.data.allActiveMarketList ? GuestMLConfig.data.allActiveMarketList : [];
        }
        this.isShowVirtualSports = this.allMarkets.some(el => el.mt == FanceType.Sportbook);
        if (this.allMarkets && this.allMarkets.length > 0) {
            let mappedMarket: any = [];
            const allMarkets = this.allMarkets.sort(GetSortOrder('ed'));
            if (this.isListwithTournament) {
                mappedMarket = mapMarketTorunaments(allMarkets);
                mappedMarket = mappedMarket.map((market) => {
                    return { sport: market.sport, appTournament: appTournament(market.appTournament) };
                });
            } else {
                mappedMarket = leftSidebarMapMarket(allMarkets);
                mappedMarket = mappedMarket.map((market) => {
                    return { sport: market.sport, matches: mapMatch(market.matches) };
                });
            }
            const filterdArr = mappedMarket.filter((v) => !this.excludeSport.includes(v.sport));

            this.markets = sortBySport(filterdArr);
        }
    }
    ngAfterViewInit() {
        let elems = document.querySelectorAll('.dropdown-trigger');
        let instances = M.Dropdown.init(elems, {
            inDuration: 300,
            outDuration: 225,
            constrain_width: true,
            hover: false,
            gutter: 0,
            belowOrigin: false,
            closeOnClick: true
        });
        // let notelems = document.querySelectorAll('.notification-dropdown');
        // this.notinstances = M.Dropdown.init(notelems, {
        //     inDuration: 300,
        //     outDuration: 225,
        //     constrain_width: true,
        //     hover: false,
        //     gutter: 0,
        //     belowOrigin: false,
        //     closeOnClick: true
        // });
        let notelemsmob = document.querySelectorAll('.not-dropdown-mobile');
        let notinstancesmob = M.Dropdown.init(notelemsmob, {});
        setTimeout(() => {
            let elems3 = document.querySelectorAll('.dropdown-trigger3');
            if (this.deviceInfoService.isMobile()) {
                let instances3 = M.Dropdown.init(elems3, {});
            } else {
                let instances3 = M.Dropdown.init(elems3, { hover: true });
            }
        }, 1000);
        // $(".notification-dropdown").on("click", function (a) {
        //     $("main").toggleClass("overlay");
        //     a.stopPropagation()
        // });
        // $(document).on("click", function (a) {
        //     if ($('.not-dropdown').is("main") === false) {
        //         $("main").removeClass("overlay");
        //     }
        // });
        // this.notificationRef = M.Modal.init(this.notificationtemp.nativeElement, { dismissible: false });
        // $('ul.dropdown-content li').on('touchend', function (e) {
        //     e.stopPropagation();
        // });
        // var scrollTop = 0;
        // $(window).scroll(function () {
        //     scrollTop = $(window).scrollTop();

        //     if (scrollTop >= 10) {
        //         $('.news-feed').addClass('news-feed-bg');
        //     }
        //     else if (scrollTop < 10) {
        //         $('.news-feed').removeClass('news-feed-bg');
        //     }
        // });
        $('#surface2').click(function () {
            $('body').addClass("remove-padding");
          });
        
          $('#surface1').click(function () {
            $('body').removeClass("remove-padding");
          });
        
          // $('#surface2').click(function(){
          //   $('.sidenav').addClass("block");
          // });
        
          $("#surface1").click(function(){
            $("body").addClass("toggle_block");
          });
          
          $('.toggle').click(function(){
            $('footer').toggleClass("remove-padding");
          });
    }
    getGuestMLConfig() {
        this.authService.getMarketConfig$().pipe(catchError(err => throwError(err))).subscribe((response: any) => {
            if (response) {
                const allMarkets = response.allActiveMarketList;
                // this.isShowVirtualSports = allMarkets.some(el => el.mt == FanceType.Sportbook);
                const sportTournamentList = GuestMLConfig.data.sportTournamentList ? GuestMLConfig.data.sportTournamentList : [];
                const tids:any = mapUniqueData(sportTournamentList, 'tid');
                this.isShowVirtualSports = allMarkets.filter(item => tids.includes(item.tid)).length > 0;
                this.allMarkets = response.allActiveMarketList;
                this.getMarketList();
            }
        }, err => console.log('getGuestMLConfig', err));

    }
    getMarkets() {
        this.marketService.getMarkets$()
            .pipe(
                untilDestroyed(this),
                catchError(err => throwError(err))
            ).subscribe(response => {
                if (response && response.length > 0) {
                    // this.isShowVirtualSports = response.some(el => el.mt == FanceType.Sportbook);
                    const sportTournamentList = websiteSettings.data.sportTournamentList ? websiteSettings.data.sportTournamentList : [];
                    const tids:any = mapUniqueData(sportTournamentList, 'tid');
                    this.isShowVirtualSports = response.filter(item => tids.includes(item.tid)).length > 0;
                    this.allMarkets = response;
                    this.commonService.allMarkets = response;
                    this.getMarketList();
                }
            }, err => console.log('left menu getMarkets', err));
    }
    toggleSideNav() {
        this.isSidemenuTrigger = !this.isSidemenuTrigger;
        var menu = document.querySelectorAll('.iconMenu-bar');
        for (var i = 0; i < menu.length; i++) {
            menu[i].classList.toggle('open');
        }
        var menu1 = document.querySelectorAll('main');
        for (var i = 0; i < menu1.length; i++) {
            menu1[i].classList.toggle('sidebar-open');
        }
        setTimeout(() => {
            var pos = $(".selectbet-header").width(); // don't need to use 'px'
            if (pos) {
                $(".scoreboard-sticky").css('width', pos + 'px');
            }
        }, 500);
    }
    getNews() {
        this.authService.getNews$()
            .pipe(
                untilDestroyed(this),
                take(1),
                catchError(err => throwError(err))
            ).subscribe(response => {
                this.news = response;
                if (this.news && this.news.length > 0) {
                    this.isNewsExits = true;
                    this.commonService.isNewsExits = true;
                }
            }, err => console.log('getNews', err));
    }
    getNotificationList() {
        this.authService.getNotification$().pipe(catchError(err => throwError(err))).subscribe((reponse: any) => {
            if (reponse.result) {
                const response = reponse.result;
                this.unReadNotifications = response.filter(x => !x.isr).length;
                let Group = mapGroupByKey(response, 'dt');
                this.notificationList = Object.keys(Group).map(key => ({
                    date: key,
                    values: Group[key]
                })).sort(GetDateSortOrder('date', 'desc'));
            }
        }, errorObj => {
            console.log('notificationList', errorObj);
        });
    }
    updateNotification(item) {
        this.selectedNotification = item;
        if (this.selectedNotification && this.selectedNotification.url !== null && this.selectedNotification.url !== undefined && this.selectedNotification.url !== '') {
            window.open(this.selectedNotification.url, '_blank');
            this.notificationRef.close();
            this.selectedNotification = null;
        }
        if (!item.isr) {
            this.authService.updateNotification(item.id).pipe(catchError(err => throwError(err))).subscribe((reponse: any) => {
                if (reponse.isSuccess) {
                    this.authService.notificationList();
                }
            }, errorObj => {
                console.log('updateNotification', errorObj);
            });
        }
        // this.notificationRef.open();
    }
    notificationMarkAsRead() {
        this.authService.updateNotification(-1).pipe(catchError(err => throwError(err))).subscribe((reponse: any) => {
            if (reponse.isSuccess) {
                this.authService.notificationList();
            }
        }, errorObj => {
            console.log('updateNotification', errorObj);
        });
    }
    onSelectedNotificationClick() {
        if (this.selectedNotification && this.selectedNotification.url !== null && this.selectedNotification.url !== undefined && this.selectedNotification.url !== '') {
            window.open(this.selectedNotification.url, '_self');
            this.notificationRef.close();
            this.selectedNotification = null;
        }
    }
    transformDate(date: any) {
        const currentDate = new Date();
        const someDate = new Date(date);
        if (someDate.getDate() == currentDate.getDate() &&
            someDate.getMonth() == currentDate.getMonth() &&
            someDate.getFullYear() == currentDate.getFullYear()) {
            return 'Today';
        } else if (someDate.getDate() == currentDate.getDate() - 1 &&
            someDate.getMonth() == currentDate.getMonth() &&
            someDate.getFullYear() == currentDate.getFullYear()) {
            return 'Yesterday';
        } else {
            return this.datepipe.transform(date, 'dd-MM-yyyy');
        }
    }
    getConfig() {
        this.authService.getConfig$()
            .pipe(
                untilDestroyed(this),
                take(1),
                catchError(err => throwError(err))
            ).subscribe(response => {
                if (response) {
                    this.commonService.configData = response;
                    this.isListwithTournament = websiteSettings.data.isLeftSideBarTournamentView;
                    this.config = response;
                    this.isB2C = websiteSettings.data.isB2C;
                    this.isWager = !websiteSettings.data.appIsRealBalanceUse;
                    this.isAutowagerPlacebet = websiteSettings.data.appIsAutowagerPlacebet;
                    const sportTournamentList = websiteSettings.data.sportTournamentList ? websiteSettings.data.sportTournamentList : [];
                    const tids:any = mapUniqueData(sportTournamentList, 'tid');
                    this.isShowVirtualSports = this.allMarkets.filter(item => tids.includes(item.tid)).length > 0;
                }
            }, err => console.log('getConfig', err));
    }
    onLiabilityClick() {
        if (this.account && this.account.liability !== 0) {
            this.liabilityRef.openPopup();
        }
    }
    bottomTabsclickEvent() {
        if (this.user != null) {
            window.open(apiEndPointData.data.WhatsappURLafterLogin, '_blank');
        } else {
            const _currentSet = {
                'event': 'whatsapp_click'
            };
            this.dataLayerService.pingHome(_currentSet);
            window.open(apiEndPointData.data.WhatsappURLbeforeLogin, '_blank');
        }
    }
    checkIsDarkThemeExists() {
        if (this.isCheckedDarkTheme) {
            document.body.classList.add('dark');
            this.logoUrl = apiEndPointData.data.lightLogoUrl;
        } else {
            document.body.classList.remove('dark');
            this.logoUrl = apiEndPointData.data.darkLogoUrl;
        }
    }
    toogleSidenavBar(event: any) {
        event.stopPropagation();
        $('.iconsidebar-menu').toggleClass('iconsidebar-menu-mobile');
    }
    getBalanceAndLiability() {
        this.marketRateFacadeService.getBalance$().subscribe((data: any) => {
            const balance = data && data.length > 0 ? data[0].appBalance : null;
            if (balance !== null && balance !== undefined && balance >= 0) {
                this.account.balance = balance;
                this.commonService.accountbalance = this.account.balance;
                clientBalance.balance = balance;
            }
            const withdrawableAmount = data && data.length > 0 ? data[0].appWithdrawableAmount : null;
            if (withdrawableAmount !== null && withdrawableAmount !== undefined && withdrawableAmount >= 0) {
                this.account.withdrawableAmount = withdrawableAmount;
                clientBalance.withdrawableAmount = withdrawableAmount;
            }
        });
        this.marketRateFacadeService.getLiability$().subscribe((liability: any) => {
            if (liability !== null && liability !== undefined && liability >= 0) {
                this.account.liability = Math.abs(liability);
                clientBalance.liability = Math.abs(liability);
            }
        });
        this.marketRateFacadeService.getWallet$().subscribe((wallet: any) => {
            if (wallet !== null && wallet !== undefined) {
                var objIndex = this.WalletList.findIndex(x => x.walletId == wallet.walletId);
                if (objIndex !== undefined && objIndex !== null && objIndex >= 0) {
                    this.WalletList[objIndex].walletName = wallet.walletName;
                    this.WalletList[objIndex].walletAmount = wallet.walletAmount;
                } else {
                    this.WalletList.push(wallet);
                }
            }
        });
    }
    OnSignUpClick() {
        if (this.click_id && this.referralcode) {
            this.router.navigate(['/signup'], { queryParams: { referralcode: this.referralcode, click_id: this.click_id } });
        } else if (this.click_id) {
            this.router.navigate(['/signup'], { queryParams: { click_id: this.click_id } });
        } else if (this.referralcode) {
            this.router.navigate(['/signup'], { queryParams: { referralcode: this.referralcode } });
        } else {
            this.router.navigate(['/signup']);
        }
    }
    OnSignInClick() {
        this.commonService.setLoginPopupOpen(true);
    }
    onAviatorClick() {
        if (this.user != null) {
            const selectedProvider = 'SmartsoftGaming';
            const selectedgame = 'JetX';
            const casinoGameMenu = casinoGameMenuSettings.data.casinoMenu ? casinoGameMenuSettings.data.casinoMenu : [];
            const param = casinoGameMenu.find(x => x.name?.toLowerCase().replace(/\s/g, '') === selectedgame.toLowerCase().replace(/\s/g, '') &&
                x.providerName?.toLowerCase().replace(/\s/g, '') === selectedProvider.toLowerCase().replace(/\s/g, ''));
            if (param) {
                this.commonService.setLoadingStatus(true);
                this.casinoService.getCasinoToken(param);
                sessionStorage.setItem('isAviatorGameOpen', JSON.stringify({ isAviatorGameOpen: true }));
                // }
            } else {
                this.toastr.error('Game is currently disabled', "Notification", {
                    toastClass: "custom-toast-error"
                });
            }
        } else {
            this.OnSignInClick();
        }
    }
    onMenuClick(sport) {
        this.selectedSport = sport;
        this.commonService.selectedTab = sport;
        if (this.click_id && this.mkt) {
            this.router.navigate(['/sports'], { queryParams: { mkt: this.mkt, click_id: this.click_id } });
        } else if (this.click_id) {
            this.router.navigate(['/sports'], { queryParams: { click_id: this.click_id } });
        } else if (this.mkt) {
            this.router.navigate(['/sports'], { queryParams: { mkt: this.mkt } });
        } else {
            this.router.navigate(['/sports']);
        }

    }
    identify(index, item) {
        return index;
    }
    ngOnDestroy() { }
}