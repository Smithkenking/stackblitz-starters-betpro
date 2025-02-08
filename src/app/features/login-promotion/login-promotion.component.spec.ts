import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginPromotionComponent } from './login-promotion.component';

describe('LoginPromotionComponent', () => {
  let component: LoginPromotionComponent;
  let fixture: ComponentFixture<LoginPromotionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LoginPromotionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginPromotionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
