const prisma = require('../config/db');

// Lấy thông tin thống kê chung cho Dashboard
exports.getDashboardStats = async (req, res, next) => {
  try {
    // Giả sử lấy userId từ Auth Middleware (hiện tại hardcode hoặc lấy user đầu tiên)
    const user = await prisma.user.findFirst();
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const totalWords = await prisma.vocabulary.count();
    
    // Lấy 7 phiên học gần nhất
    const recentSessions = await prisma.studySession.findMany({
      where: { userId: user.id },
      orderBy: { date: 'desc' },
      take: 7
    });

    res.json({
      user: {
        name: user.name,
        streak: user.streak,
        targetWeekly: user.targetWeekly
      },
      stats: {
        totalWords,
        recentSessions: recentSessions.reverse() // Xếp theo thứ tự thời gian tăng dần để vẽ biểu đồ
      }
    });
  } catch (error) {
    next(error);
  }
};
