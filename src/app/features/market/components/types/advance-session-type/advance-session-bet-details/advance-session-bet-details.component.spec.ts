import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AdvanceSessionBetDetailsComponent } from './advance-session-bet-details.component';

describe('AdvanceSessionBetDetailsComponent', () => {
  let component: AdvanceSessionBetDetailsComponent;
  let fixture: ComponentFixture<AdvanceSessionBetDetailsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AdvanceSessionBetDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdvanceSessionBetDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
