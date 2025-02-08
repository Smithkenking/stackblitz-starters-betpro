import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginRightsidebarComponent } from './login-rightsidebar.component';

describe('LoginRightsidebarComponent', () => {
  let component: LoginRightsidebarComponent;
  let fixture: ComponentFixture<LoginRightsidebarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LoginRightsidebarComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginRightsidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
