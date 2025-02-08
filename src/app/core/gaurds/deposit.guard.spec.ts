import { TestBed } from '@angular/core/testing';

import { DepositGuard } from './deposit.guard';

describe('DepositGuard', () => {
  let guard: DepositGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(DepositGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
