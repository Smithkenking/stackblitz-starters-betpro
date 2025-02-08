import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginVirtualSportsComponent } from './login-virtual-sports.component';

describe('LoginVirtualSportsComponent', () => {
  let component: LoginVirtualSportsComponent;
  let fixture: ComponentFixture<LoginVirtualSportsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LoginVirtualSportsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginVirtualSportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
