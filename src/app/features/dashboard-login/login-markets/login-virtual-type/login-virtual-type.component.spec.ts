import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginVirtualTypeComponent } from './login-virtual-type.component';

describe('LoginVirtualTypeComponent', () => {
  let component: LoginVirtualTypeComponent;
  let fixture: ComponentFixture<LoginVirtualTypeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LoginVirtualTypeComponent]
    });
    fixture = TestBed.createComponent(LoginVirtualTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
