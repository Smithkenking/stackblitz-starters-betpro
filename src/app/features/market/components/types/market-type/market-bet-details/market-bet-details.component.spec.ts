import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { MarketBetDetailsComponent } from './market-bet-details.component';

describe('MarketBetDetailsComponent', () => {
  let component: MarketBetDetailsComponent;
  let fixture: ComponentFixture<MarketBetDetailsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ MarketBetDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MarketBetDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
