import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginPremiumOddsComponent } from './login-premium-odds.component';

describe('LoginPremiumOddsComponent', () => {
  let component: LoginPremiumOddsComponent;
  let fixture: ComponentFixture<LoginPremiumOddsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LoginPremiumOddsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginPremiumOddsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
