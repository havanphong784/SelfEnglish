const { buildRecentStudyDays } = require('./dashboard.service');

describe('dashboard.service', () => {
  it('groups recent study sessions by calendar day', () => {
    const sessions = [
      { date: '2026-07-05T03:00:00.000Z', wordsLearned: 4, durationMinutes: 5 },
      { date: '2026-07-05T10:00:00.000Z', wordsLearned: 6, durationMinutes: 7 },
      { date: '2026-07-07T01:00:00.000Z', wordsLearned: 3, durationMinutes: 4 },
      { date: '2026-06-30T01:00:00.000Z', wordsLearned: 99, durationMinutes: 99 },
    ];

    const days = buildRecentStudyDays(
      sessions,
      new Date('2026-07-07T12:00:00.000Z'),
      'UTC',
    );

    expect(days).toHaveLength(7);
    expect(days.map((day) => day.date)).toEqual([
      '2026-07-01',
      '2026-07-02',
      '2026-07-03',
      '2026-07-04',
      '2026-07-05',
      '2026-07-06',
      '2026-07-07',
    ]);
    expect(days[4]).toEqual({
      date: '2026-07-05',
      newWordsLearned: 10,
      wordsLearned: 10,
      durationMinutes: 12,
      sessions: 2,
    });
    expect(days[6]).toEqual({
      date: '2026-07-07',
      newWordsLearned: 3,
      wordsLearned: 3,
      durationMinutes: 4,
      sessions: 1,
    });
  });
});
