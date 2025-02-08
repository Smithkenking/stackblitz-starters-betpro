import { UpcomingCountPipe } from './upcoming-count.pipe';

describe('UpcomingCountPipe', () => {
  it('create an instance', () => {
    const pipe = new UpcomingCountPipe();
    expect(pipe).toBeTruthy();
  });
});
