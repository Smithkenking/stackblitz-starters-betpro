import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginSportBookBetDeatilsComponent } from './login-sport-book-bet-deatils.component';

describe('LoginSportBookBetDeatilsComponent', () => {
  let component: LoginSportBookBetDeatilsComponent;
  let fixture: ComponentFixture<LoginSportBookBetDeatilsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LoginSportBookBetDeatilsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginSportBookBetDeatilsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
