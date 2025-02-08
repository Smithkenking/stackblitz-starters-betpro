/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { LoginAdvanceSessionTypeComponent } from './login-advance-session-type.component';

describe('CommmonAdvanceSessionTypeComponent', () => {
  let component: LoginAdvanceSessionTypeComponent;
  let fixture: ComponentFixture<LoginAdvanceSessionTypeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LoginAdvanceSessionTypeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginAdvanceSessionTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
