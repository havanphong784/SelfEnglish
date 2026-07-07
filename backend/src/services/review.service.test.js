const {
  calculateInterval,
  getNextLevel,
  getNextReviewDate,
} = require('./review.service');

describe('review.service', () => {
  it('maps levels to spaced repetition intervals', () => {
    expect([1, 2, 3, 4, 5, 6].map(calculateInterval)).toEqual([1, 2, 4, 8, 15, 30]);
    expect(calculateInterval(0)).toBe(1);
  });

  it('promotes and demotes levels predictably', () => {
    expect(getNextLevel(undefined, true)).toBe(2);
    expect(getNextLevel(undefined, false)).toBe(1);
    expect(getNextLevel(3, true)).toBe(4);
    expect(getNextLevel(6, true)).toBe(6);
    expect(getNextLevel(4, false)).toBe(3);
    expect(getNextLevel(5, false)).toBe(3);
    expect(getNextLevel(6, false)).toBe(3);
  });

  it('calculates next review from a stable date', () => {
    const base = new Date('2026-07-03T00:00:00.000Z');
    expect(getNextReviewDate(3, base).toISOString()).toBe('2026-07-07T00:00:00.000Z');
  });
});
