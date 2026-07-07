const RECENT_STUDY_DAY_COUNT = 7;
const STUDY_TIME_ZONE = process.env.STUDY_TIME_ZONE || 'Asia/Ho_Chi_Minh';

const getDateKey = (date, timeZone = STUDY_TIME_ZONE) => {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date(date));

  const byType = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${byType.year}-${byType.month}-${byType.day}`;
};

const addDaysToDateKey = (dateKey, days) => {
  const date = new Date(`${dateKey}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
};

const buildRecentStudyDays = (sessions = [], now = new Date(), timeZone = STUDY_TIME_ZONE) => {
  const todayKey = getDateKey(now, timeZone);
  const dateKeys = Array.from({ length: RECENT_STUDY_DAY_COUNT }, (_, index) => (
    addDaysToDateKey(todayKey, index - RECENT_STUDY_DAY_COUNT + 1)
  ));

  const daysByKey = new Map(dateKeys.map((date) => [
    date,
    {
      date,
      newWordsLearned: 0,
      wordsLearned: 0,
      durationMinutes: 0,
      sessions: 0,
    },
  ]));

  sessions.forEach((session) => {
    const day = daysByKey.get(getDateKey(session.date, timeZone));
    if (!day) return;

    day.newWordsLearned += Number(session.wordsLearned) || 0;
    day.wordsLearned = day.newWordsLearned;
    day.durationMinutes += Number(session.durationMinutes) || 0;
    day.sessions += 1;
  });

  return Array.from(daysByKey.values());
};

const getRecentStudyQueryStart = (now = new Date(), timeZone = STUDY_TIME_ZONE) => {
  const todayKey = getDateKey(now, timeZone);
  const earliestKey = addDaysToDateKey(todayKey, -RECENT_STUDY_DAY_COUNT + 1);
  const queryStart = new Date(`${earliestKey}T00:00:00.000Z`);
  queryStart.setUTCDate(queryStart.getUTCDate() - 1);
  return queryStart;
};

module.exports = {
  RECENT_STUDY_DAY_COUNT,
  STUDY_TIME_ZONE,
  buildRecentStudyDays,
  getRecentStudyQueryStart,
};
