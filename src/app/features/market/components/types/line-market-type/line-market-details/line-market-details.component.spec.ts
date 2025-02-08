import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { LineMarketDetailsComponent } from './line-market-details.component';

describe('LineMarketDetailsComponent', () => {
  let component: LineMarketDetailsComponent;
  let fixture: ComponentFixture<LineMarketDetailsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ LineMarketDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LineMarketDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
