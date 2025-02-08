import { TestBed, inject } from '@angular/core/testing';

import { CricketLiveScoreService } from './cricket-live-score.service';

describe('CricketLiveScoreService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CricketLiveScoreService]
    });
  });

  it('should be created', inject([CricketLiveScoreService], (service: CricketLiveScoreService) => {
    expect(service).toBeTruthy();
  }));
});
