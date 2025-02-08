import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { LineMarketTypeComponent } from './line-market-type.component';

describe('LineMarketTypeComponent', () => {
  let component: LineMarketTypeComponent;
  let fixture: ComponentFixture<LineMarketTypeComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ LineMarketTypeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LineMarketTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
