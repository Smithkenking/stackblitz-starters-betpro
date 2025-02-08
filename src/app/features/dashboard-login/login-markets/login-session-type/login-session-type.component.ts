import { Component, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges,EventEmitter } from '@angular/core';
import { mapGroupByKey } from '@clientApp-core/services/shared/JSfunction.service';

@Component({
  selector: 'app-login-session-type',
  templateUrl: './login-session-type.component.html',
  styleUrls: ['./login-session-type.component.scss']
})
export class LoginSessionTypeComponent implements OnInit, OnChanges, OnDestroy {
  @Input() fancyMarkets: [];
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
  openLoginModel(){
    this.openPopup.emit();
  }
  ngOnDestroy(): void {
      
  }
}
