import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginSportBookTypeComponent } from './login-sport-book-type.component';

describe('LoginSportBookTypeComponent', () => {
  let component: LoginSportBookTypeComponent;
  let fixture: ComponentFixture<LoginSportBookTypeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LoginSportBookTypeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginSportBookTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
