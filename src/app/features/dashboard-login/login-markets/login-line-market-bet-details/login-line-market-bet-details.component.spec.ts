import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginLineMarketBetDetailsComponent } from './login-line-market-bet-details.component';

describe('LoginLineMarketBetDetailsComponent', () => {
  let component: LoginLineMarketBetDetailsComponent;
  let fixture: ComponentFixture<LoginLineMarketBetDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LoginLineMarketBetDetailsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginLineMarketBetDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
