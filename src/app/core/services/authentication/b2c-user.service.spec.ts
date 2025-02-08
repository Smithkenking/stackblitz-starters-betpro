import { TestBed } from '@angular/core/testing';

import { B2cUserService } from './b2c-user.service';

describe('B2cUserService', () => {
  let service: B2cUserService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(B2cUserService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
