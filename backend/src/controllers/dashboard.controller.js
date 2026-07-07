const prisma = require('../config/db');
const {
  buildRecentStudyDays,
  getRecentStudyQueryStart,
} = require('../services/dashboard.service');

exports.getDashboardStats = async (req, res, next) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const startedWords = await prisma.userVocabulary.count({
      where: { userId: user.id },
    });

    const recentSessions = await prisma.studySession.findMany({
      where: {
        userId: user.id,
        date: { gte: getRecentStudyQueryStart() },
      },
      orderBy: { date: 'asc' },
    });

    res.json({
      user: {
        name: user.name,
        streak: user.streak,
        targetWeekly: user.targetWeekly,
      },
      stats: {
        startedWords,
        totalWords: startedWords,
        recentSessions: buildRecentStudyDays(recentSessions),
      },
    });
  } catch (error) {
    next(error);
  }
};
