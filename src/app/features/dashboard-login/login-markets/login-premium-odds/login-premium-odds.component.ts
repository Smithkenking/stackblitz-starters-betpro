import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { mapGroupByKey } from '@clientApp-core/services/shared/JSfunction.service';

@Component({
  selector: 'app-login-premium-odds',
  templateUrl: './login-premium-odds.component.html',
  styleUrls: ['./login-premium-odds.component.scss']
})
export class LoginPremiumOddsComponent implements OnInit, OnChanges, OnDestroy {
  @Input() premiumoddsMarkets: [];
  @Input() currentMarketVolumn;
  @Input() marketRunner;
  @Input() selectedCategory: string;
  @Output() openPopup = new EventEmitter();
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
  openLoginModel(){
    this.openPopup.emit();
  }
  ngOnDestroy(): void {
      
  }

}
