import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VirtualTypeComponent } from './virtual-type.component';

describe('VirtualTypeComponent', () => {
  let component: VirtualTypeComponent;
  let fixture: ComponentFixture<VirtualTypeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [VirtualTypeComponent]
    });
    fixture = TestBed.createComponent(VirtualTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
