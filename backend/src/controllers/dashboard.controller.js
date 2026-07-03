const prisma = require('../config/db');

exports.getDashboardStats = async (req, res, next) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const totalWords = await prisma.userVocabulary.count({
      where: { userId: user.id },
    });

    const recentSessions = await prisma.studySession.findMany({
      where: { userId: user.id },
      orderBy: { date: 'desc' },
      take: 7,
    });

    res.json({
      user: {
        name: user.name,
        streak: user.streak,
        targetWeekly: user.targetWeekly,
      },
      stats: {
        totalWords,
        recentSessions: recentSessions.reverse(),
      },
    });
  } catch (error) {
    next(error);
  }
};
