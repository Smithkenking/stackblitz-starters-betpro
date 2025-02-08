import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActiveMarket } from '@clientApp-core/models/market/activemarket.model';
import { MarketBet } from '@clientApp-core/models/market/market-bet.model';
import { CommonService } from '@clientApp-core/services/common/common.service';
import { MarketFacadeService } from '@clientApp-core/services/market/market-facade.service';
import { MarketRateFacadeService } from '@clientApp-core/services/market/market-rates/market-rate-facade.service';
import { mapGroupByKey, arrayUniqueByKey } from '@clientApp-core/services/shared/JSfunction.service';
import { getBetsAverageOdds } from '@clientApp-core/services/shared/shared.service';
import { SharedModule } from '@clientApp-shared/shared.module';
import { getAllMarkets } from '@clientApp-store/selected-market/selectors/selected-market.selectors';
import { ParkBetState } from '@clientApp-store/store.state';
import { select, Store } from '@ngrx/store';
import { untilDestroyed } from 'ngx-take-until-destroy';
import { splitVSPipe } from "../../pipes/split.pipe";

@Component({
    standalone: true,
    selector: 'app-matchedbet',
    templateUrl: './matchedbet.component.html',
    styleUrls: ['./matchedbet.component.scss'],
    imports: [CommonModule, SharedModule, splitVSPipe]
})
export class MatchedbetComponent implements OnInit, OnDestroy {

  bets: MarketBet[];
  selectedMarkets: ActiveMarket[];
  matchBets: any[];
  marketBets: MarketBet[] = [];
  isCheckAverageOdd: boolean = false;
  averageOddList: any = [];
  constructor(private store: Store<ParkBetState>, public commonService: CommonService,
    private marketRateFacadeService: MarketRateFacadeService, private marketFacadeService: MarketFacadeService) { }

  ngOnInit(): void {
    this.selectFromStore();
  }
  selectFromStore() {
    this.store.pipe(select(getAllMarkets)).subscribe((data) => {
      if (data && data.length > 0) {
        this.selectedMarkets = data;
      } else {
        this.commonService.marketClientBets = [];
        this.marketBets = [];
        this.matchBets = [];
        this.marketRateFacadeService.setMatchBetCount().next(0);
      }
    });

    this.marketRateFacadeService.getBetInfo$().subscribe((data) => {
      if (data && data.length > 0) {
        var result = this.marketBets.filter(function (o1) {
          return !data.some(function (o2) {
            return o1.clientBetDetails.betDetailId === o2.clientBetDetails.betDetailId
              && o1.clientBetDetails.clientBetId === o2.clientBetDetails.clientBetId
          });
        });
        const BetListData = Object.assign([],(data.concat(result)));
        this.commonService.marketClientBets = Object.assign([],BetListData);
        this.marketBets = Object.assign([],BetListData);
        this.getBetLists();
      } else {
        this.commonService.marketClientBets = [];
        this.marketBets = [];
        this.matchBets = [];
        this.marketRateFacadeService.setMatchBetCount().next(0);
      }
    });
    this.marketRateFacadeService.getBetList$().subscribe((data) => {
      if (data && data.length > 0) {
        var result = this.marketBets.filter(function (o1) {
          return !data.some(function (o2) {
            return o1.clientBetDetails.betDetailId === o2.clientBetDetails.betDetailId
              && o1.clientBetDetails.clientBetId === o2.clientBetDetails.clientBetId
          });
        });
        const BetListData = Object.assign([],(data.concat(result)));
        this.commonService.marketClientBets = Object.assign([],BetListData);
        this.marketBets = Object.assign([],BetListData);
        this.getBetLists();
      }
    });
    this.marketFacadeService.removeBetFromBetList().pipe(untilDestroyed(this)).subscribe(x => {
      let clientbets;
      const bets = this.marketBets.filter(bet => bet.hasOwnProperty('matchBets'));
      if (bets && bets.length > 0) {
        if (x.BetId !== null && x.MatchId === null) {
          clientbets = this.marketBets.filter(bet => bet.clientBetDetails.betID !== x.BetId
            && bet.matchBets.betId !== x.BetId);
        } else if (x.BetId === null && x.MatchId !== null) {
          clientbets = this.marketBets.filter(bet => bet.matchID !== x.MatchId);
        }
        this.marketBets = Object.assign([],clientbets);
        this.commonService.marketClientBets = Object.assign([],clientbets);
        this.getBetLists();
      }
    });
    // Remove Bet from SignalR method GetDeletedBetList
    this.marketRateFacadeService.deleteBetList$().subscribe((data) => {
      if (data && data.length > 0) {
        var result = this.marketBets.filter(function (o1) {
          return !data.some(function (o2) {
            return o1.clientBetDetails.betDetailId === o2.clientBetDetails.betDetailId
              && o1.clientBetDetails.clientBetId === o2.clientBetDetails.clientBetId
          });
        });
        this.commonService.marketClientBets = Object.assign([],result);
        this.marketBets = Object.assign([],result);
        this.getBetLists();
      }
    });
  }
  getBetLists() {
    // this method use for update pl book in all components
    this.marketRateFacadeService.setMarketClientBetList().next(this.marketBets);
    this.bets = this.marketBets.filter(bet => bet.hasOwnProperty('matchBets'));
    if (this.bets.length > 0) {
      const lookup = mapGroupByKey(arrayUniqueByKey(this.selectedMarkets, 'eid'), 'eid');
      const filteredBets = this.bets.filter(bet => lookup[bet.matchID] !== undefined);
      const groupedBetsByMatch = mapGroupByKey(filteredBets, 'matchID');
      const groupedBetsArray = Array.from(Object.keys(groupedBetsByMatch), k => groupedBetsByMatch[k]);
      this.matchBets = groupedBetsArray.map(function (bets) {
        return {
          match: bets[0].match,
          betDetails: function () {
            const groupedBetsByBetName = bets.reduce((r, a) => {
              r[a.matchBets.betName] = [...r[a.matchBets.betName] || [], a];
              return r;
            }, {});
            return (Array.from(Object.keys(groupedBetsByBetName), k => groupedBetsByBetName[k]))
              .map(function (betDetails) {
                return { name: betDetails[0].matchBets.betName, details: betDetails };
              });

          }()
        };
      });
      if (this.isCheckAverageOdd) { this.getAverageOdds(); }
    } else {
      this.matchBets = null;
    }
    this.marketRateFacadeService.setMatchBetCount().next(this.bets.length);
  }

  // find average odds for match-odd (runner-back-lay wise)
  getAverageOdds() {
    this.averageOddList = [];
    if (this.isCheckAverageOdd) {
      let runnerBetList: any = [];
      if (this.matchBets && this.matchBets.length > 0) {
        runnerBetList = getBetsAverageOdds(this.matchBets, this.selectedMarkets);
        this.getFinalAverage(runnerBetList);
      }
    } else {
      this.reActiveMatchOddBets();
    }
  }

  getFinalAverage(runnerBetList) {
    if (runnerBetList && runnerBetList.length > 0) {
      runnerBetList.forEach(item => {
        let obj = {}; let profit = 0; let rate = 0; let stake = 0;
        item.data.forEach(data => {
          profit += data.matchBets.betDetails.profit;
          rate += data.matchBets.betDetails.rate;
          stake += data.matchBets.betDetails.stake;
        
          obj = {
            match: data.match, betName: data.matchBets.betDetails.betName, betTitle: data.matchBets.betDetails.betTitle,
            isBack: data.matchBets.betDetails.isBack, profit: (profit).toFixed(2), rate: rate, stake: stake,
          };
        });
        this.averageOddList.push(obj);
      });
      this.checkIsSingleTitle();
    }
  }
  // check for title
  checkIsSingleTitle() {
    const list = [];
    this.averageOddList.forEach(data => {
      if(list.includes(data.match)) { data.isHead = false; } else { list.push(data.match); data.isHead = true; }
    });
  }
  reActiveMatchOddBets() {
    if (this.matchBets && this.matchBets.length > 0) {
      this.matchBets.forEach(matchBet => {
        if (matchBet['betDetails'] && matchBet['betDetails'].length > 0) {
          matchBet['betDetails'].forEach(record => {
            record['active'] = true;
          });
        }
      });
    }
  }
  ngOnDestroy() { }
}
