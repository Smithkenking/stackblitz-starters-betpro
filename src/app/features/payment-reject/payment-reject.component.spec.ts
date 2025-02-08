import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentRejectComponent } from './payment-reject.component';

describe('PaymentRejectComponent', () => {
  let component: PaymentRejectComponent;
  let fixture: ComponentFixture<PaymentRejectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PaymentRejectComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PaymentRejectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
