import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VirtualBetDetailsComponent } from './virtual-bet-details.component';

describe('VirtualBetDetailsComponent', () => {
  let component: VirtualBetDetailsComponent;
  let fixture: ComponentFixture<VirtualBetDetailsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [VirtualBetDetailsComponent]
    });
    fixture = TestBed.createComponent(VirtualBetDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
