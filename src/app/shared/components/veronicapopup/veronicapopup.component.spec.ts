import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { VeronicapopupComponent } from './veronicapopup.component';

describe('VeronicapopupComponent', () => {
  let component: VeronicapopupComponent;
  let fixture: ComponentFixture<VeronicapopupComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ VeronicapopupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VeronicapopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
