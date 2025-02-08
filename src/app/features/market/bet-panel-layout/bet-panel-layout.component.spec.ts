import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { BetPanelLayoutComponent } from './bet-panel-layout.component';

describe('BetPanelLayoutComponent', () => {
  let component: BetPanelLayoutComponent;
  let fixture: ComponentFixture<BetPanelLayoutComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ BetPanelLayoutComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BetPanelLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
