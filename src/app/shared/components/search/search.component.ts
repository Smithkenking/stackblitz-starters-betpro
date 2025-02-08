import { Component, ElementRef, Input, OnChanges, OnInit, Output, ViewChild, EventEmitter, OnDestroy } from '@angular/core';
import { BetFacadeService } from "@clientApp-core/services/bet/bet.facade.service";
import { CommonService } from "@clientApp-core/services/common/common.service";
import { SessionService } from "@clientApp-core/services/session/session.service";
import * as M from "materialize-css/dist/js/materialize";
import { apiEndPointData } from "@clientApp-core/services/config/connfig.service";
import { Stake } from "@clientApp-core/models/bet/stake.model";
import { ToastrService } from "ngx-toastr";
import { casinoGameMenuSettings, GuestCasinoConfig, GuestMLConfig, websiteSettings, } from "@clientApp-core/services/authentication/authentication-facade.service";
import { arrayUniqueByKey } from "@clientApp-core/services/shared/JSfunction.service";
import { CasinoService } from "@clientApp-core/services/casino/casino.service";
import { MarketFacadeService } from "@clientApp-core/services/market/market-facade.service";
import { DataLayerService } from "@clientApp-core/services/window/DataLayerService.service";
import { userProfileInfo } from "@clientApp-core/services/authentication/b2c-user.service";
import { CommonModule } from "@angular/common";
import { SharedModule } from "@clientApp-shared/shared.module";
import { Router } from "@angular/router";
import { DateFormatePipe } from "../../pipes/date-formate.pipe";
declare var $: any;
@Component({
  standalone: true,
  selector: "app-search",
  templateUrl: "./search.component.html",
  styleUrls: ["./search.component.scss"],
  imports: [CommonModule, SharedModule, DateFormatePipe],
})
export class SearchComponent implements OnInit, OnChanges , OnDestroy{
  @Input('searchString') searchString: string;
  @Output() valueChange = new EventEmitter();
  @ViewChild('search', { static: true }) searchModel: ElementRef;
  modalInstances: any;
  searchStr: string;
  groupedMarketsList: any = [];
  user: any;
  websitesettings: any;
  constructor(public betService: BetFacadeService, private marketService: MarketFacadeService,
    public router: Router, private sessionService: SessionService, private toastr: ToastrService,
    public commonService: CommonService, private casinoService: CasinoService, private dataLayerService: DataLayerService) { }

  ngOnInit(): void {
    this.modalInstances = M.Modal.init(this.searchModel.nativeElement, {});
    this.user = JSON.parse(localStorage.getItem('token'));
  }
  ngOnChanges() {
    this.searchMatch(this.searchString);
  }

  openPopup() {
    this.searchStr = '';
    this.groupedMarketsList = [];
    this.modalInstances.open();
    $('#searchstr').focus();
    this.user = JSON.parse(localStorage.getItem('token'));
  }
  hideSearchModal() {
    this.groupedMarketsList = [];
    this.searchStr = '';
    this.modalInstances.close();
  }
  searchMatch(searchStr) {
    this.user = JSON.parse(localStorage.getItem('token'));
    if (searchStr && (searchStr).trim() !== '') {
      const searchstr = searchStr.toLowerCase();
      let allMatches = this.marketService.marketList, casinoMenu = [], filterCasinoData = [];
      let config = this.commonService.configData;
      let casinoGameMenu = casinoGameMenuSettings.data.casinoMenu ? casinoGameMenuSettings.data.casinoMenu : [];
      const tpGamePermission = websiteSettings.data.tpGamePermission ? websiteSettings.data.tpGamePermission : [];
      config = this.commonService.configData;
      if (tpGamePermission.length > 0) {
        casinoMenu = casinoGameMenu.filter(ele => {
          return !tpGamePermission.includes(ele.appTpGameRefType) && (config && config[ele.apiParamName] && ele.isActive && ele.providerName !== null)
        });
      } else {
        casinoMenu = casinoGameMenu.filter(ele => {
          return (config && config[ele.apiParamName] && ele.isActive && ele.providerName !== null)
        });
      }
      if (this.user == null || this.user == undefined || this.user == '') {
        allMatches = GuestMLConfig.data.allActiveMarketList ? GuestMLConfig.data.allActiveMarketList : [];
        casinoGameMenu = GuestCasinoConfig.data.casinoMenu ? GuestCasinoConfig.data.casinoMenu : [];
        casinoMenu = casinoGameMenu.filter(ele => {
          return (ele.ia && ele.pn !== null)
        });
        filterCasinoData = Object.assign([], casinoMenu.filter(x => {
          if (x.nm.toLowerCase().includes(searchstr) || x.pn?.toLowerCase().includes(searchstr)) {
            return x;
          }
        }));
      } else {
        filterCasinoData = Object.assign([], casinoMenu.filter(x => {
          if (x.name.toLowerCase().includes(searchstr) || x.providerName?.toLowerCase().includes(searchstr)) {
            return x;
          }
        }));
      }
      let filterdSearch = allMatches.filter((item) => {
        if (item.tn.toLowerCase().includes(searchstr) || item.en.toLowerCase().includes(searchstr)) {
          return item;
        }
      });

      const filterEventData = arrayUniqueByKey(filterdSearch, 'eid');
      this.groupedMarketsList = filterEventData.concat(filterCasinoData);
    } else {
      this.groupedMarketsList = [];
    }
  }
  onMarketClick(match: any) {
    if (match && match.mc) {
      let matches;
      if (this.user == null || this.user == undefined || this.user == '') {
        this.websitesettings = apiEndPointData.data ? apiEndPointData.data : {};
        let allMatches = GuestMLConfig.data.allActiveMarketList ? GuestMLConfig.data.allActiveMarketList : [];
        matches = allMatches.filter((game) => {
          return game.eid === match.eid;
        });
      } else {
        this.websitesettings = websiteSettings.data ? websiteSettings.data : apiEndPointData.data ? apiEndPointData.data : {};
        matches = this.commonService.allMarkets.filter((game) => {
          return game.eid === match.eid;
        });
      }

      if (this.websitesettings.isdr) {
        this.removeCentralGroup(matches);
      }
      const stake = new Stake();
      stake.closeMe = true;
      this.betService.setStake().next(stake);
      var matchCookie = [], selectedMatchcookie = [];
      if (this.commonService.getCookieValue('selected_match_name')) {
        matchCookie = JSON.parse(this.commonService.getCookieValue('selected_match_name'));
      }
      if (matchCookie != null) {
        selectedMatchcookie = matchCookie;
      }
      var selectedMatchName = match.eid;
      const matchObj = new Object({
        id: selectedMatchName,
        type: 'Match',
        date: new Date()
      });
      selectedMatchcookie.push(matchObj);
      var selectedMatchcookieStr = JSON.stringify(selectedMatchcookie);
      this.commonService.setCookieValue('selected_match_name', selectedMatchcookieStr);
      if(apiEndPointData.data.isGoogleTagManagerEnable){
      const _currentSet = {
        'event': 'sports_game',
        'Sport_type': match.st,
        'phone': '+' + userProfileInfo.data.appMobileNo,
      };
      this.dataLayerService.pingHome(_currentSet);
    }
      if (this.user == null || this.user == undefined || this.user == '') {
        const eventName = ((match.en.trim())).replace(/\s/g, '');
        this.router.navigate(['event', match.eid, eventName]);
      } else {
        const eventName = ((match.en.trim())).replace(/\s/g, '');
        this.router.navigate(['event', match.eid, eventName]);
      }
      this.hideSearchModal();
      this.valueChange.emit(this.searchStr);

    } else {
      this.toastr.error('Central id not exist', "Notification", {
        toastClass: "custom-toast-error"
      });
    }
  }
  removeCentralGroup(matches: any) {
    let allMatches;
    if (this.user == null || this.user == undefined || this.user == '') {
      allMatches = GuestMLConfig.data.allActiveMarketList ? GuestMLConfig.data.allActiveMarketList : [];;
    } else {
      allMatches = this.commonService.allMarkets;
    }
    if (allMatches && allMatches.length > 0) {
      const centralizationIds = allMatches.map(match => match.mc).filter(function (el) {
        return el != null && el != undefined && el != '';
      });
      const SelectedcentralizationIds = matches.map(match => match.mc).toString();
      for (let i = 0; i < centralizationIds.length; i++) {
        if (!SelectedcentralizationIds.includes(centralizationIds[i])) {
          this.sessionService.removeCentralGroup(centralizationIds[i].toString());
        }
      }
    }
  }
  onCasinoClick(param) {
    if (this.user == null || this.user == undefined || this.user == '') {
      this.hideSearchModal();
      this.valueChange.emit('loginPage');
    } else {
      this.commonService.setLoadingStatus(true);
      this.casinoService.getCasinoToken(param);
      var getCasinoCookie = [], selectedCasino = [];
      const CasinoObj = new Object({
        id: param.angularCasinoGameId,
        type: 'Casino',
        date: new Date()
      });
      if (this.commonService.getCookieValue('selected_match_name')) {
        getCasinoCookie = JSON.parse(this.commonService.getCookieValue('selected_match_name'));
      }

      if (getCasinoCookie != null) {
        selectedCasino = getCasinoCookie;
      }

      selectedCasino.push(CasinoObj);
      this.commonService.setCookieValue('selected_match_name', JSON.stringify(selectedCasino));
      this.hideSearchModal();
      this.valueChange.emit(this.searchStr);
    }
  }
  ngOnDestroy() {
  }
}
