import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AdvanceSessionTypeComponent } from './advance-session-type.component';

describe('AdvanceSessionTypeComponent', () => {
  let component: AdvanceSessionTypeComponent;
  let fixture: ComponentFixture<AdvanceSessionTypeComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AdvanceSessionTypeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdvanceSessionTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
