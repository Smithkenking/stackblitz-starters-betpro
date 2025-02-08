/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { LoginMarketPlaceBetViewsComponent } from './login-market-place-bet-views.component';

describe('CommonMarketPlaceBetViewsComponent', () => {
  let component: LoginMarketPlaceBetViewsComponent;
  let fixture: ComponentFixture<LoginMarketPlaceBetViewsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LoginMarketPlaceBetViewsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginMarketPlaceBetViewsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
