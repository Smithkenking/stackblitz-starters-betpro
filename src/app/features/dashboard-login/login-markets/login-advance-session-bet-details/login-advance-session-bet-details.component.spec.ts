/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { LoginAdvanceSessionBetDetailsComponent } from './login-advance-session-bet-details.component';

describe('CommonAdvanceSessionBetDetailsComponent', () => {
  let component: LoginAdvanceSessionBetDetailsComponent;
  let fixture: ComponentFixture<LoginAdvanceSessionBetDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LoginAdvanceSessionBetDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginAdvanceSessionBetDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
