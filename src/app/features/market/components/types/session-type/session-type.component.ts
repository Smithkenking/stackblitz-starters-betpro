import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { mapGroupByKey } from '@clientApp-core/services/shared/JSfunction.service';

@Component({
  selector: 'app-session-type',
  templateUrl: './session-type.component.html',
  styleUrls: ['./session-type.component.scss']
})
export class SessionTypeComponent implements OnInit,OnChanges, OnDestroy {
  @Input() fancyMarkets: [];
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
    if (this.fancyMarkets && this.fancyMarkets.length >0) {
      let matchesGroup = mapGroupByKey(this.fancyMarkets, 'categoryName');
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
