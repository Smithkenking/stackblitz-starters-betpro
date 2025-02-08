import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginVirtualBetDetailsComponent } from './login-virtual-bet-details.component';

describe('LoginVirtualBetDetailsComponent', () => {
  let component: LoginVirtualBetDetailsComponent;
  let fixture: ComponentFixture<LoginVirtualBetDetailsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LoginVirtualBetDetailsComponent]
    });
    fixture = TestBed.createComponent(LoginVirtualBetDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
