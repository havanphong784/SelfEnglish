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

const getNextReviewDate = (level, fromDate = new Date()) => {
  const nextReview = new Date(fromDate);
  nextReview.setDate(nextReview.getDate() + calculateInterval(level));
  return nextReview;
};

module.exports = {
  calculateInterval,
  getNextLevel,
  getNextReviewDate,
};
