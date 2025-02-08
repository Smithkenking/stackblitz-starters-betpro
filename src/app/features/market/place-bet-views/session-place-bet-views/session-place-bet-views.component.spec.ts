import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SessionPlaceBetViewsComponent } from './session-place-bet-views.component';

describe('SessionPlaceBetViewsComponent', () => {
  let component: SessionPlaceBetViewsComponent;
  let fixture: ComponentFixture<SessionPlaceBetViewsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ SessionPlaceBetViewsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SessionPlaceBetViewsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
