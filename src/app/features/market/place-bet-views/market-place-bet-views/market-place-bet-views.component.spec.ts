import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { MarketPlaceBetViewsComponent } from './market-place-bet-views.component';

describe('MarketPlaceBetViewsComponent', () => {
  let component: MarketPlaceBetViewsComponent;
  let fixture: ComponentFixture<MarketPlaceBetViewsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ MarketPlaceBetViewsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MarketPlaceBetViewsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
