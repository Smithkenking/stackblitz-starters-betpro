import { TestBed } from '@angular/core/testing';

import { Isb2cuserGuard } from './isb2cuser.guard';

describe('Isb2cuserGuard', () => {
  let guard: Isb2cuserGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(Isb2cuserGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
