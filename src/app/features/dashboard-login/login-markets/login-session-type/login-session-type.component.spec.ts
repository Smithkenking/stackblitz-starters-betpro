import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginSessionTypeComponent } from './login-session-type.component';

describe('LoginSessionTypeComponent', () => {
  let component: LoginSessionTypeComponent;
  let fixture: ComponentFixture<LoginSessionTypeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LoginSessionTypeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginSessionTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
