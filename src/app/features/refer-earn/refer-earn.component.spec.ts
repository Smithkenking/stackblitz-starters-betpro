import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReferEarnComponent } from './refer-earn.component';

describe('ReferEarnComponent', () => {
  let component: ReferEarnComponent;
  let fixture: ComponentFixture<ReferEarnComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReferEarnComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReferEarnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
