const MAX_LEVEL = 6;

const calculateInterval = (currentLevel) => {
  switch (currentLevel) {
    case 1: return 1;
    case 2: return 2;
    case 3: return 4;
    case 4: return 8;
    case 5: return 15;
    case 6: return 30;
    default: return 1;
  }
};

const getNextLevel = (currentLevel, isCorrect) => {
  if (!currentLevel) {
    return isCorrect ? 2 : 1;
  }

  if (isCorrect) {
    return Math.min(currentLevel + 1, MAX_LEVEL);
  }

  if (currentLevel <= 4) {
    return Math.max(currentLevel - 1, 1);
  }

  return 3;
};

const getNextLevelForRating = (currentLevel, rating) => {
  const level = currentLevel || 0;

  switch (rating) {
    case 'again':
      return level >= 5 ? 3 : Math.max(level - 1, 1);
    case 'hard':
      return Math.max(level, 1);
    case 'good':
      return getNextLevel(level, true);
    case 'easy':
      return Math.min(level + 2, MAX_LEVEL);
    default:
      return getNextLevel(level, Boolean(rating));
  }
};

const isCorrectRating = (rating) => rating !== 'again';

const getNextReviewDate = (level, fromDate = new Date()) => {
  const nextReview = new Date(fromDate);
  nextReview.setDate(nextReview.getDate() + calculateInterval(level));
  return nextReview;
};

module.exports = {
  calculateInterval,
  getNextLevel,
  getNextLevelForRating,
  isCorrectRating,
  getNextReviewDate,
};
