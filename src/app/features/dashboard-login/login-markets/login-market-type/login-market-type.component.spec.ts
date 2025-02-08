/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { loginMarketTypeComponent } from './login-market-type.component';

describe('CommonMarketTypeComponent', () => {
  let component: loginMarketTypeComponent;
  let fixture: ComponentFixture<loginMarketTypeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ loginMarketTypeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(loginMarketTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
