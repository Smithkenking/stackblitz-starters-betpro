import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { LiabilityComponent } from './liability.component';

describe('LiabilityComponent', () => {
  let component: LiabilityComponent;
  let fixture: ComponentFixture<LiabilityComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ LiabilityComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LiabilityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
