import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { mapGroupByKey } from '@clientApp-core/services/shared/JSfunction.service';

@Component({
  selector: 'app-premium-odds',
  templateUrl: './premium-odds.component.html',
  styleUrls: ['./premium-odds.component.scss']
})
export class PremiumOddsComponent implements OnInit, OnChanges, OnDestroy{
  @Input() premiumoddsMarkets: [];
  @Input() currentMarketVolumn;
  @Input() marketRunner;
  @Input() selectedCategory: string;
  @Input() marketIndex: number;
  @Input() matchIndex: number;
  markets: any = [];
  constructor() { }

  ngOnInit(): void {
    this.groupByCategory();
  }
  ngOnChanges(changes: SimpleChanges): void {
    this.groupByCategory(); 
  }
  groupByCategory() {
    if (this.premiumoddsMarkets && this.premiumoddsMarkets.length >0) {
      let matchesGroup = mapGroupByKey(this.premiumoddsMarkets, 'categoryName');
      this.markets =  Object.keys(matchesGroup).map(key => ({
                      categoryName: key,
                      markets: matchesGroup[key]
      }));
    }
  }
  trackByFunction(index, item) {
    return index;
  }
  identify(index, item) {
    return item.mid;
  }
  ngOnDestroy(): void {
      
  }

}
