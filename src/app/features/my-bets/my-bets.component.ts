import { DatePipe } from '@angular/common';
import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MarketRateFacadeService } from '@clientApp-core/services/market/market-rates/market-rate-facade.service';
import { untilDestroyed } from 'ngx-take-until-destroy';
import { Subject, throwError } from 'rxjs';
import { catchError, take, takeUntil } from 'rxjs/operators';
import * as M from "materialize-css/dist/js/materialize";
import { arrayUniqueByKey } from '@clientApp-core/services/shared/JSfunction.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthFacadeService, websiteSettings } from '@clientApp-core/services/authentication/authentication-facade.service';
import { CommonService } from '@clientApp-core/services/common/common.service';
import { FanceType } from '@clientApp-core/enums/market-fancy.type';
declare var $: any;

@Component({
  selector: 'app-my-bets',
  templateUrl: './my-bets.component.html',
  styleUrls: ['./my-bets.component.scss']
})
export class MyBetsComponent implements OnInit,AfterViewInit, OnDestroy {
  betList: any = [];
  allBetList: any = [];
  @ViewChild('dataTable', { static: true }) table;
  @ViewChild('fdp', { static: true }) fdpicker: ElementRef;
  @ViewChild('tdp', { static: true }) tdpicker: ElementRef;
  @ViewChild('sports', { static: false }) sports: ElementRef;
  @ViewChild('tournament', { static: false }) tournament: ElementRef;
  @ViewChild('match', { static: false }) match: ElementRef;
  @ViewChild('market', { static: false }) market: ElementRef;
  fdinstances: any;
  tdinstances: any;
  sportVal = 0;
  tournamentval = 0;
  matchVal = 0;
  marketVal = 0;
  betTypeVal: any = 0;
  sportsData: any[] = [];
  tournamentsData: any[] = [];
  matchsData: any[] = [];
  marketsData: any[] = [];
  dataTable: any;
  fromDate = new Date(new Date().getTime() - (7 * 24 * 60 * 60 * 1000));
  toDate = new Date();
  notifier = new Subject();
  constructor(private marketRateFacadeService: MarketRateFacadeService, public datepipe: DatePipe,
    private router: Router, public commonService:CommonService,private authService: AuthFacadeService) {
    this.commonService.getRealBalanceUseStatus().pipe(takeUntil(this.notifier)).subscribe(isChecked => {
      this.getAllBetList();
    });
   }

  ngOnInit(): void {
    this.getConfig();
    this.getAllBetList();
  }
  ngAfterViewInit() {
    var elemsTabs = document.querySelectorAll('.tabs');
    var tabinstances = M.Tabs.init(elemsTabs, {});
    var elems = document.querySelectorAll('.collapsible');
    var instances = M.Collapsible.init(elems, {});
    const self = this;
    setTimeout(function () {
      var elems = document.querySelectorAll('select');
      var instances = M.FormSelect.init(elems, {});
    }, 1000);
    this.fdinstances = M.Datepicker.init(this.fdpicker.nativeElement, {
      defaultDate: this.fromDate,
      setDefaultDate: true,
      onSelect: function (date) {
        self.fromDate = date;
        self.getFilterResult();
      }
    });
    this.tdinstances = M.Datepicker.init(this.tdpicker.nativeElement, {
      defaultDate: this.toDate,
      setDefaultDate: true,
      onSelect: function (date) {
        self.toDate = date;
        self.getFilterResult();
      }
    });
  }
  getAllBetList() {
    if(websiteSettings.data !== ""){
      if (!websiteSettings.data.appIsRealBalanceUse) {
        this.marketRateFacadeService.getAllBetListWager().pipe(takeUntil(this.notifier), take(1), catchError(err => throwError(err))).subscribe(response => {
          if (response && response.length > 0) {
          this.allBetList = Object.assign([], response);
          this.betList = Object.assign([], response);
          this.loadDatatable();
          this.getSportsData();
          this.getFilterResult();
        } else {
            this.betList = [];
            this.loadDatatable();
        }
      }, err => console.log('getAllBetList', err));
      } else {
        this.marketRateFacadeService.getAllBetList().pipe(takeUntil(this.notifier), take(1), catchError(err => throwError(err))).subscribe(response => {
          if (response && response.length > 0) {
          this.allBetList = Object.assign([], response);
          this.betList = Object.assign([], response);
          this.loadDatatable();
          this.getSportsData();
          this.getFilterResult();
        } else {
          this.betList = [];
          this.loadDatatable();
        }
      }, err => console.log('getAllBetList', err));
      }
   }
  }
  getConfig() {
    this.authService.getConfig$()
      .pipe(take(1),
        takeUntil(this.notifier),
        catchError(err => throwError(err))
      ).subscribe(response => {
        if (response) {
          this.getAllBetList();
        }
      }, err => console.log('getConfig', err));
  }
  loadDatatable() {
    const self = this;
    this.dataTable = $(this.table.nativeElement);
    if (this.dataTable.DataTable) {
      this.dataTable.DataTable({
        data: self.betList,
        responsive: true,
        order: [0, 'desc'],
        destroy: true,
        columns: [{
          title: 'Date',
          data: 'appMarketDate',
          render: function (data, type, row) {
            if (type === 'display' || type === 'filter') {
              return self.datepipe.transform(row.appMarketDate, 'dd/MM/yyyy, h:mm a');
            }
            return data;
          }
        }, {
          title: 'Event',
          data: 'appMatch',
          render: function (data, type, row) {
            // return self.getEventName(row);
            return "<a  class=cursor-pointer id=" + row.appBetID + ">" + self.getEventName(row) + "</a>"
          }
        }, {
          title: 'Market',
          data: 'appBetName'
        },
        {
          title: 'Selection',
          data: 'appRunner'
        }, {
          title: 'Type',
          data: 'appIsBack',
          render: function (data, type, row) {
            return row.appIsBack ? 'Back' : 'Lay';
          }
        }, {
          title: 'Rate',
          data: 'appRate'
        }, {
          title: 'Stake',
          data: 'appStake'
        }, {
          title: 'P/L',
          data: 'appProfit'
        }, {
          title: 'Matched/UnMatched',
          data: 'appIsMatched',
          render: function (data, type, row) {
            return row.appIsMatched ? 'Matched' : 'UnMatched';
          }
        }],
        bLengthChange: false
      });
    } else {
      setTimeout(() => {
        self.loadDatatable();
      }, 1000);
    }
    this.dataTable.off().on('click', 'a', function () {
      var row = $(self.table.nativeElement).DataTable().row($(this).parents('tr')).data();
      if (row && row.appFancyType !== null && row.appFancyType !== undefined && row.appFancyType !== '' && row.appFancyType == FanceType.Virtual) {
        self.router.navigate(['event', 'virtual-sports', row.appTournamentID]);
      } else if (row && row.appMatchID !== null && row.appMatchID !== undefined && row.appMatchID !== '' && row.appMatchID !== 0) {
        self.router.navigate(['event', row.appMatchID, row.appMatch]);
      }
    });
  }
  getEventName(row: any) {
    return row.appSport + '/' + row.appTournament + '/' + row.appMatch;
  }
  getSportsData() {
    this.sportsData = Object.assign([],(arrayUniqueByKey(this.allBetList, 'appSportID')));
  }
  getTournamentData(sportID: number) {
    const filterData = this.allBetList.filter(x => x.appSportID === sportID);
    this.tournamentsData = Object.assign([],(arrayUniqueByKey(filterData, 'appTournamentID')));
    const self = this;
      setTimeout(function () {
        var sports = M.FormSelect.init(self.tournament.nativeElement, {});
      }, 500);
  }
  getMatchData(tournamentID: number) {
    const filterData = this.allBetList.filter(x => x.appTournamentID === tournamentID);
    this.matchsData = Object.assign([],(arrayUniqueByKey(filterData, 'appMatchID')));
    const self = this;
      setTimeout(function () {
        var sports = M.FormSelect.init(self.match.nativeElement, {});
      }, 500);
  }
  getMarketData(matchID: number) {
    const filterData = this.allBetList.filter(x => x.appMatchID === matchID);
    this.marketsData = Object.assign([],(arrayUniqueByKey(filterData, 'appBetID')));
    const self = this;
    setTimeout(function () {
      var sports = M.FormSelect.init(self.market.nativeElement, {});
    }, 500);
  }
  onSportChange(val: any) {
    this.getTournamentData(+val);
    this.tournamentval = 0;
    this.matchVal = 0;
    this.marketVal = 0;
    this.matchsData = [];
    this.marketsData = [];
    M.updateTextFields();
    this.getFilterResult();
  }
  onTournamentChange(val: any) {
    this.getMatchData(+val);
    this.matchVal = 0;
    this.marketVal = 0;
    this.marketsData = [];
    M.updateTextFields();
    this.getFilterResult();
  }
  onMatchChange(val: any) {
    this.getMarketData(+val);
    this.marketVal = 0;
    M.updateTextFields();
    this.getFilterResult();
  }
  onMarketChange(val: any) {
    this.getFilterResult();
  }
  onBetsTypeChange(val: any) {
    this.getFilterResult();
  }
  getFilterResult() {
    if (this.sportVal !== 0) {
      this.betList = Object.assign([],(this.allBetList.filter(x => x.appSportID === +this.sportVal)));
      if (this.tournamentval !== 0) {
        this.betList = Object.assign([],(this.betList.filter(x => x.appTournamentID === +this.tournamentval)));
        if (this.matchVal !== 0) {
          this.betList = Object.assign([],(this.betList.filter(x => x.appMatchID === +this.matchVal)));
          if (this.marketVal !== 0) {
            this.betList = Object.assign([],(this.betList.filter(x => x.mid === +this.marketVal)));
          }
        }
      }
    } else {
      this.betList = Object.assign([], (this.allBetList));
    }
    const self = this;
    this.betList = Object.assign([],(this.betList.filter(function (a) {
      let start_Date = self.datepipe.transform(self.fromDate, 'MM/dd/yyyy');
      let end_Date = self.datepipe.transform(self.toDate, 'MM/dd/yyyy')
      let Date_to_check = self.datepipe.transform(a.appMarketDate, 'MM/dd/yyyy')     
      var d1 = new Date(start_Date);
      var d2 = new Date(end_Date);
      var d3 = new Date(Date_to_check);
      return d1.getTime() <= d3.getTime()  && d3.getTime() <= d2.getTime();
    })));
    const data = Object.assign([],(this.betList));
    if (this.betTypeVal !== null && this.betTypeVal !== undefined && this.betTypeVal !== 0 && this.betTypeVal !== 'All') {
      this.betList = Object.assign([],(data.filter(x => x.appIsMatched === this.betTypeVal)));
    } else {
      this.betList = Object.assign([],(data));
    }
    this.loadDatatable();
  }
  isEmpty(obj:any) {
    for (var key in obj) {
      if (obj.hasOwnProperty(key))
        return false;
    }
    return true;
  } 
  ngOnDestroy() {
    
    this.notifier.next();
    this.notifier.complete(); 
   }

}
