import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { SessionService } from '@clientApp-core/services/session/session.service';
import { BetFacadeService } from '@clientApp-core/services/bet/bet.facade.service';
import { StoreService } from '@clientApp-core/services/store/store.service';
import { take, catchError } from 'rxjs/operators';
import { CommonService } from '@clientApp-core/services/common/common.service';
import * as M from "materialize-css/dist/js/materialize";
import { throwError } from 'rxjs';
import { mapLiability } from '@clientApp-core/services/shared/dashboard-shared.service';
import { sumByKey } from '@clientApp-core/services/shared/JSfunction.service';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@clientApp-shared/shared.module';
import { Router } from '@angular/router';

@Component({
  standalone: true,
  imports:[CommonModule,SharedModule],
  selector: 'pb-liability',
  templateUrl: './liability.component.html',
  styleUrls: ['./liability.component.css']
})
export class LiabilityComponent implements OnInit {
  @ViewChild('liability', { static: true }) template: ElementRef;
  liabilityData: any[];
  totalLiability: number;
  allMarkets: any;
  modalInstances: any;
  loading = false;

  constructor(private router: Router, private sessionService: SessionService,
    public betService: BetFacadeService, public storeService: StoreService,
    public commonService: CommonService) {
  }

  ngOnInit() {
  }

  ngAfterViewInit() {
    this.modalInstances = M.Modal.init(this.template.nativeElement, {});
  }

  hideModal() {
    this.modalInstances.close();
  }
  openPopup() {
    this.liabilityData = [];
    this.betService.getLiability();
    this.allMarkets = this.commonService.allMarkets;
    this.betService.checkLiability().pipe(take(1), catchError(err => throwError(err))).subscribe(res => {
      this.liabilityData = mapLiability(res);
      this.getTotalLiability();
      this.commonService.setLoadingStatus(false);
      this.modalInstances.open();
    }, err => { this.commonService.setLoadingStatus(false); console.log('getConfig', err) });
  }
  getTotalLiability() {
    this.totalLiability = sumByKey(this.liabilityData, 'totalLiability');
  }
  onMarketSelect(market: any) {
    if(market.liability[0].mid != null && market.liability[0].mid != 0){
    this.removeCentralGroup(market);
    this.storeService.removeAllStoreData();
    const selectedMatch = [];
    selectedMatch.push(market.liability[0].eid);
    localStorage.removeItem("selected_matches");
    localStorage.removeItem("selected_betId");
    localStorage.setItem("selected_matches", JSON.stringify(selectedMatch));
    this.commonService.isMarketLiabilityClick = true;
    this.router.navigate(['event', market.liability[0].eid]);
    this.modalInstances.close();
    this.loading = false;
   }
  }
  removeCentralGroup(matches: any) {
    if (this.allMarkets && this.allMarkets.length > 0) {
      const centralizationIds = this.allMarkets.map(match => match.mc).filter(function (el) {
        return el != null && el != undefined && el != '';
      });
      const SelectedcentralizationIds = matches.liability.map((x) => x.mc).toString();
      for (let i = 0; i < centralizationIds.length; i++) {
        if (!SelectedcentralizationIds.includes(centralizationIds[i])) {
          this.sessionService.removeCentralGroup(centralizationIds[i].toString());
        }
      }
    }
  }
  identify1(index, item) {
    return index;
  }
  identify(index, item) {
    return item.appBetID;
  }
  removeAllGroup() {
    if (this.allMarkets && this.allMarkets.length > 0) {
      const centralizationIds = this.allMarkets.map(match => match.mc).toString();
      this.sessionService.removeAllCentralGroup(centralizationIds);
    }
  }
}
