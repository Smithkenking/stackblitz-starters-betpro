import { Component, OnInit, ViewChild, OnDestroy, AfterViewInit, ElementRef } from '@angular/core';
import { apiEndPointData } from '@clientApp-core/services/config/connfig.service';
import { untilDestroyed } from 'ngx-take-until-destroy';
import { AccountStatementFacadeService } from '@clientApp-core/services/account-statement/account-statement-facade.service';
import { take, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import * as M from "materialize-css/dist/js/materialize";
import { CommonService } from '@clientApp-core/services/common/common.service';
import { GetDateSortOrder, GetSortOrder } from '@clientApp-core/utilities/app-configuration';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { mapGroupByKey, sumByKey } from '@clientApp-core/services/shared/JSfunction.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-account-statement',
  templateUrl: './account-statement.component.html',
  styleUrls: ['./account-statement.component.scss']
})
export class AccountStatementComponent implements OnInit, AfterViewInit, OnDestroy {
  accountstatement: any[] = [];
  betWiseHistory: any[] = [];
  currentPage: number = 1; // Current page number
  itemsPerPage: number = 6;
  @ViewChild('cbh', { static: true }) cbhModal: ElementRef;
  cbhModalInstances: any;
  avgForm: UntypedFormGroup;
  backTotal: number;
  layTotal: number;
  marketTotal: number;
  commission: number;
  total: number;
  avgDetails: any;
  isSportsData: boolean = false;
  loading : boolean = true;
  constructor(public commonService: CommonService,private route: ActivatedRoute,
    private accountStatementService: AccountStatementFacadeService) {
  }
  ngOnInit() {
    this.loading = true;
    this.accountStatementService.getAccountStatement$()
      .pipe(
        untilDestroyed(this),
        take(1),
        catchError(err => throwError(err))
    ).subscribe(response => {
      const sortData = response.sort(GetSortOrder('appFinalTransactionID'));
        this.accountstatement = this.mapAccountStatement(sortData).sort(GetDateSortOrder('appFinalTransactionID', 'desc'));
        this.loading = false;
    }, err =>{ this.loading = false;console.log('getaccountstatement', err)});
    this.avgForm = new UntypedFormGroup({
      avgCtrl: new UntypedFormControl(false),
    });
  }
  ngAfterViewInit() {
    this.cbhModalInstances = M.Modal.init(this.cbhModal.nativeElement, {});
  }
  getPaginatedItems(): any[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.accountstatement.slice(startIndex, endIndex);
  }

  getPageCount(): number {
    return Math.ceil(this.accountstatement.length / this.itemsPerPage);
  }

  onPageChange(pageNumber: number): void {
    if (pageNumber >= 1 && pageNumber <= this.getPageCount()) {
      this.currentPage = pageNumber;
    }
  }

  generatePaginationRange(): number[] {
    const pageCount = this.getPageCount();
    const range = [];

    for (let i = 1; i <= pageCount; i++) {
      range.push(i);
    }

    return range;
  }

  private mapAccountStatement(accountStatements: any): any {

    let totalAmount = 0;
    return accountStatements.map(function (obj) {
      if (parseFloat(obj.appAmount) > 0) {
        totalAmount += Math.abs(parseFloat(obj.appAmount));
        obj.appCR = formatinComma((Math.abs(obj.appAmount)).toFixed(2));
      } else {
        totalAmount -= Math.abs(parseFloat(obj.appAmount));
        obj.appDR = formatinComma((Math.abs(obj.appAmount)).toFixed(2));
      }
      obj.appBalance = formatinComma(totalAmount.toFixed(2));
      return obj;
    });
    function formatinComma(formatted) {
      return formatted.toString().replace(/,/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }
  }
  getBetHistory(row: any) {
      this.isSportsData = false;
  if (row.appBetID != 0 && row.appBetID != null) {
     if(row.result != null) {
      this.isSportsData = true;
     }
    this.commonService.setLoadingStatus(true);
    this.accountStatementService.getBetHistory$(row.appBetID)
      .pipe(
        untilDestroyed(this),catchError(err => throwError(err))
      ).subscribe(response => {
        const Data = this.mapBetHistory(response);
        this.betWiseHistory = Data;
        this.getTotals(Data);
        this.avgDetails = this.mapAvgDetails(Data);
        this.commonService.setLoadingStatus(false);
        this.cbhModalInstances.open();
      }, err => { this.commonService.setLoadingStatus(false); console.log('getBetHistory', err) });
    }
      
  }
  private mapBetHistory(betHistory: any): any {
    let totalAmount = 0;
    return betHistory.map(function (obj) {
      if (obj.appIsIn) {
        totalAmount += Math.abs(parseFloat(obj.appAmount));
        obj.appCR = formatinComma((Math.abs(obj.appAmount)).toFixed(2));
      } else {
        totalAmount -= Math.abs(parseFloat(obj.appAmount));
        obj.appDR = formatinComma((Math.abs(obj.appAmount)).toFixed(2));
      }
      obj.appBalance = formatinComma(totalAmount.toFixed(2));
      return obj;
    });
    function formatinComma(formatted) {
      return formatted.toString().replace(/,/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }
  }
  private getTotals(plDetails) {
    this.backTotal = sumByKey(plDetails.filter(x => x.appIsBack), 'appAmount'),
      this.layTotal = sumByKey(plDetails.filter(x => !x.appIsBack), 'appAmount'),
      this.marketTotal = this.backTotal + this.layTotal;
    if (this.commission === undefined || this.commission === null) { this.commission = 0; }
    this.total = (this.backTotal + this.layTotal) + this.commission;
  }
  private mapAvgDetails(plDetails): any {

    const groupByTitle = mapGroupByKey(plDetails, 'appBetTitle');

    const groupByBetType =  Object.keys(groupByTitle).map(key => ({
      lay: groupByTitle[key].filter(x => !x.appIsBack),
      back: groupByTitle[key].filter(x => x.appIsBack),
      }));
    const finalData = Object.keys(groupByBetType).map(key => ({
      back: this.mapGroupByBetType(groupByBetType[key],'back'),
      lay:  this.mapGroupByBetType(groupByBetType[key], 'lay')
    }));
    const mapFinalData = Object.keys(finalData).map((key) => [finalData[key].back, finalData[key].lay]);
    const flattenDeep = [].concat.apply([], mapFinalData);
    return flattenDeep.filter((x: any) => x.appBetTitle != null);
  }
  mapGroupByBetType(obj, type) {
    let groupByBetObj = {
      appTransactionType: '',
      appSport: '',
      appTournament:'',
      appMatch:'',
      appBetName: '',
      appMarketID_BF:'',
      appBetTitle: null,
      appRate: 0,
      appStake: 0,
      appPL: 0,
      appProfit:0,
      type: 'Lay',
      appDR: '',
      appCR: '',
      appBalance: '',
      appMarket:''
    };
    if (obj.back && obj.back.length > 0 && type == 'back') {
      groupByBetObj = {
        appTransactionType: obj.back[0].appTransactionType,
        appSport: obj.back[0].appSport,
        appTournament: obj.back[0].appTournament,
        appMatch: obj.back[0].appMatch,
        appBetName: obj.back[0].appBetName,
        appMarketID_BF: obj.back[0].appMarketID_BF,
        appBetTitle: obj.back[0] != null ? obj.back[0].appBetTitle : null,
        appRate: sumByKey(obj.back, 'appRate'),
        appStake: sumByKey(obj.back, 'appStake'),
        appPL: sumByKey(obj.back, 'appAmount'),
        type: 'Back',
        appProfit: this.sumOfStringValues(obj.back, 'appProfit'),
        appCR: this.sumOfStringValues(obj.back, 'appCR'),
        appDR: this.sumOfStringValues(obj.back, 'appDR'),
        appBalance: this.sumOfStringValues(obj.back, 'appBalance'),
        appMarket: obj.back[0].appMarket,
      }
    } else if (obj.lay && obj.lay.length > 0 && type == 'lay') {
      groupByBetObj = {
        appTransactionType: obj.lay[0].appTransactionType,
        appSport: obj.lay[0].appSport,
        appTournament: obj.lay[0].appTournament,
        appMatch: obj.lay[0].appMatch,
        appBetName: obj.lay[0].appBetName,
        appMarketID_BF: obj.lay[0].appMarketID_BF,
        appBetTitle: obj.lay[0] != null ? obj.lay[0].appBetTitle : null,
        appRate: sumByKey(obj.lay, 'appRate'),
        appStake: sumByKey(obj.lay, 'appStake'),
        appPL: sumByKey(obj.lay, 'appAmount'),
        type: 'Lay',
        appProfit: this.sumOfStringValues(obj.lay, 'appProfit'),
        appCR: this.sumOfStringValues(obj.lay, 'appCR'),
        appDR: this.sumOfStringValues(obj.lay, 'appDR'),
        appBalance: this.sumOfStringValues(obj.lay, 'appBalance'),
        appMarket: obj.lay[0].appMarket,
      }
    } else {
      groupByBetObj.type = type == 'back' ? 'Back' :'Lay';
   }
    return groupByBetObj;
  }
  hideModal(){
    this.cbhModalInstances.close();
  }

  GetGameData(eReportKey) {
    if (eReportKey) {
      const URL = apiEndPointData.data.LiveCasinoVeronicaReportURL;
      const vURL = URL + '/home?Key=' + eReportKey;
      window.open(vURL, '_blank', 'scrollbars=1,menubar=0,resizable=1,width=1000,height=600');
    }
  }
  sumOfStringValues(array, key) {
    let sum = a => a.reduce((x, y) => x + y);
    let totalAmount = sum(array.map(x => Number(x[key])));
    return !isNaN(totalAmount) ? totalAmount.toFixed(2) : '-';
  }
  isEmpty(obj:any) {
    for (var key in obj) {
      if (obj.hasOwnProperty(key))
        return false;
    }
    return true;
  }
  ngOnDestroy() {
    
  }
}
