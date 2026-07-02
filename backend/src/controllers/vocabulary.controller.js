const prisma = require('../config/db');

// Lấy danh sách các gói từ vựng
exports.getPackages = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const packages = await prisma.vocabularyPackage.findMany({
      include: {
        _count: {
          select: { vocabularies: true }
        }
      }
    });
    
    // Lấy tất cả từ vựng user đã học
    const userVocabs = await prisma.userVocabulary.findMany({
      where: { userId, level: { gt: 0 } },
      include: { vocabulary: true }
    });

    // Đếm số từ đã học theo từng packageId
    const learnedCountByPackage = {};
    userVocabs.forEach(uv => {
      const pkgId = uv.vocabulary.packageId;
      learnedCountByPackage[pkgId] = (learnedCountByPackage[pkgId] || 0) + 1;
    });

    // Tính tiến độ
    const formatted = packages.map(pkg => ({
      id: pkg.id,
      title: pkg.title,
      description: pkg.description,
      level: pkg.level,
      isPro: pkg.isPro,
      totalWords: pkg._count.vocabularies,
      learnedWords: learnedCountByPackage[pkg.id] || 0
    }));

    res.json(formatted);
  } catch (error) {
    next(error);
  }
};

// Lấy danh sách từ vựng cần ôn hôm nay (nextReview <= now)
exports.getVocabulariesForReview = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const now = new Date();

    // 1. Lấy các từ đã học cần ôn lại
    const reviews = await prisma.userVocabulary.findMany({
      where: {
        userId: userId,
        nextReview: { lte: now }
      },
      include: { vocabulary: true },
      take: 20 // Tối đa 20 từ mỗi lượt ôn
    });

    // 2. Nếu không đủ từ ôn tập, có thể lấy thêm từ mới (chưa có trong UserVocabulary)
    // Nhưng để đơn giản, ta ưu tiên trả về các từ lấy được.
    // Nếu chưa học từ nào, trả về rỗng, Frontend sẽ cho user chọn Package để bắt đầu.

    const formattedData = reviews.map(uv => ({
      id: uv.vocabulary.id, // ID của từ vựng
      word: uv.vocabulary.word,
      meaning: uv.vocabulary.meaning,
      ipa: uv.vocabulary.ipa,
      example: uv.vocabulary.example,
      level: uv.level, // Level của User đối với từ này
    }));

    res.json(formattedData);
  } catch (error) {
    next(error);
  }
};

// Bắt đầu học một gói (Lấy từ mới)
exports.learnPackage = async (req, res, next) => {
  try {
    const { packageId } = req.params;
    const userId = req.user.id;

    // Lấy các từ trong gói chưa được học
    const unlearned = await prisma.vocabulary.findMany({
      where: {
        packageId: packageId,
        userVocabularies: {
          none: { userId: userId }
        }
      },
      take: 10
    });

    const formattedData = unlearned.map(v => ({
      id: v.id,
      word: v.word,
      meaning: v.meaning,
      ipa: v.ipa,
      example: v.example,
      level: 1 // Mới học là level 1
    }));

    res.json(formattedData);
  } catch (error) {
    next(error);
  }
};

// Logic tính số ngày interval dựa trên level hiện tại
const calculateInterval = (currentLevel) => {
  switch (currentLevel) {
    case 1: return 1;
    case 2: return 2;
    case 3: return 4;
    case 4: return 8;
    case 5: return 15;
    case 6: return 30; // Master
    default: return 1;
  }
};

// Cập nhật tiến độ học (Kết quả đúng/sai)
exports.updateProgress = async (req, res, next) => {
  try {
    const { id } = req.params; // vocabularyId
    const { isCorrect } = req.body; // true/false
    const userId = req.user.id;

    // Tìm bản ghi hiện tại
    let userVocab = await prisma.userVocabulary.findUnique({
      where: {
        userId_vocabularyId: { userId, vocabularyId: id }
      }
    });

    let previousLevel = userVocab ? userVocab.level : 0;
    let newLevel = 1;

    if (userVocab) {
      if (isCorrect) {
        newLevel = Math.min(userVocab.level + 1, 6); // Tăng level, tối đa 6
      } else {
        // Sai
        if (userVocab.level <= 4) {
          newLevel = Math.max(userVocab.level - 1, 1); // Giảm 1 level, tối thiểu 1
        } else {
          newLevel = 3; // Level 5, 6 rớt về 3
        }
      }
    } else {
      // Nếu chưa học bao giờ (từ mới)
      newLevel = isCorrect ? 2 : 1; 
    }

    const intervalDays = calculateInterval(newLevel);
    
    // Tính ngày tiếp theo
    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + intervalDays);

    // Cập nhật Database (Dùng transaction để đảm bảo toàn vẹn dữ liệu)
    const [progress, history] = await prisma.$transaction([
      prisma.userVocabulary.upsert({
        where: {
          userId_vocabularyId: { userId, vocabularyId: id }
        },
        update: {
          level: newLevel,
          nextReview: nextReview
        },
        create: {
          userId: userId,
          vocabularyId: id,
          level: newLevel,
          nextReview: nextReview
        }
      }),
      prisma.reviewHistory.create({
        data: {
          userId: userId,
          vocabularyId: id,
          isCorrect: isCorrect,
          previousLevel: previousLevel,
          newLevel: newLevel
        }
      })
    ]);

    res.json({ 
      message: isCorrect ? 'Làm tốt lắm!' : 'Cố gắng lần sau!', 
      progress 
    });
  } catch (error) {
    next(error);
  }
};

// Import danh sách từ vựng (Tự động tạo gói mới)
exports.importVocabularies = async (req, res, next) => {
  try {
    const { words, title, description, level } = req.body;
    if (!words || !Array.isArray(words)) {
      return res.status(400).json({ error: 'Dữ liệu không hợp lệ' });
    }

    // 1. Tạo một Package mới cho nhóm từ vựng này
    const dateStr = new Date().toLocaleDateString('vi-VN');
    const newPackage = await prisma.vocabularyPackage.create({
      data: {
        title: title || `Từ vựng Import (${dateStr})`,
        description: description || 'Gói từ vựng được import từ file JSON cá nhân.',
        level: level || 'Tùy chọn',
        isPro: false
      }
    });

    // 2. Gán packageId cho các từ vựng
    const wordsWithPackage = words.map(w => ({
      ...w,
      packageId: newPackage.id
    }));

    // 3. Insert vào database
    const created = await prisma.vocabulary.createMany({
      data: wordsWithPackage,
      skipDuplicates: true,
    });

    res.json({ message: `Đã import ${created.count} từ vựng vào gói "${newPackage.title}"` });
  } catch (error) {
    next(error);
  }
};

// Random vocabularies (distractors for multiple choice)
exports.getRandomVocabularies = async (req, res, next) => {
  try {
    const { excludeId, limit = 3 } = req.query;
    
    const words = await prisma.vocabulary.findMany({
      where: excludeId ? { id: { not: excludeId } } : undefined,
      take: 50
    });

    const shuffled = words.sort(() => 0.5 - Math.random());
    res.json(shuffled.slice(0, parseInt(limit)));
  } catch (error) {
    next(error);
  }
};

// Lưu lịch sử / session học tập
exports.saveSession = async (req, res, next) => {
  try {
    const { durationMinutes, wordsLearned } = req.body;
    const userId = req.user.id;

    // Lưu session
    const session = await prisma.studySession.create({
      data: {
        userId,
        durationMinutes: durationMinutes || 0,
        wordsLearned: wordsLearned || 0
      }
    });

    // Cập nhật streak
    const lastSession = await prisma.studySession.findFirst({
      where: { 
        userId, 
        id: { not: session.id } 
      },
      orderBy: { date: 'desc' }
    });

    let user = await prisma.user.findUnique({ where: { id: userId } });
    let newStreak = user.streak;

    const today = new Date();
    today.setHours(0,0,0,0);

    if (!lastSession) {
      newStreak = 1;
    } else {
      const lastDate = new Date(lastSession.date);
      lastDate.setHours(0,0,0,0);
      
      const diffDays = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        newStreak += 1;
      } else if (diffDays > 1) {
        newStreak = 1; // Reset
      }
    }

    if (newStreak !== user.streak) {
      await prisma.user.update({
        where: { id: userId },
        data: { streak: newStreak }
      });
    }

    res.json({ message: 'Lưu phiên học thành công', session, newStreak });
  } catch (error) {
    next(error);
  }
};

// Xem lịch trình ôn tập (Tương lai) và Lịch sử (Quá khứ)
exports.getSchedule = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { date } = req.query; // YYYY-MM-DD
    
    if (!date) {
      return res.status(400).json({ error: 'Thiếu tham số date (YYYY-MM-DD)' });
    }

    const targetDate = new Date(date);
    targetDate.setHours(0,0,0,0);
    const nextDay = new Date(targetDate);
    nextDay.setDate(targetDate.getDate() + 1);

    const now = new Date();
    now.setHours(0,0,0,0);

    let result = { date, isFuture: targetDate >= now, items: [] };

    if (targetDate < now) {
      // Quá khứ -> Lấy ReviewHistory
      const history = await prisma.reviewHistory.findMany({
        where: {
          userId,
          reviewedAt: {
            gte: targetDate,
            lt: nextDay
          }
        },
        include: { vocabulary: true }
      });
      result.items = history.map(h => ({
        id: h.id,
        word: h.vocabulary.word,
        meaning: h.vocabulary.meaning,
        isCorrect: h.isCorrect,
        previousLevel: h.previousLevel,
        newLevel: h.newLevel,
        reviewedAt: h.reviewedAt
      }));
    } else {
      // Tương lai hoặc hôm nay -> Lấy UserVocabulary có nextReview trong ngày đó
      const schedules = await prisma.userVocabulary.findMany({
        where: {
          userId,
          nextReview: {
            gte: targetDate,
            lt: nextDay
          }
        },
        include: { vocabulary: true }
      });
      result.items = schedules.map(s => ({
        id: s.vocabulary.id,
        word: s.vocabulary.word,
        meaning: s.vocabulary.meaning,
        level: s.level,
        nextReview: s.nextReview
      }));
    }

    res.json(result);
  } catch (error) {
    next(error);
  }
};

// Get User Stats (Streak, Levels, etc.)
exports.getStats = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    
    // Group by level
    const userVocabs = await prisma.userVocabulary.findMany({
      where: { userId }
    });

    const levelDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
    userVocabs.forEach(v => {
      if (levelDistribution[v.level] !== undefined) {
        levelDistribution[v.level]++;
      }
    });

    const today = new Date();
    today.setHours(0,0,0,0);
    const nextDay = new Date(today);
    nextDay.setDate(today.getDate() + 1);

    const todaySessions = await prisma.studySession.findMany({
      where: {
        userId,
        date: { gte: today, lt: nextDay }
      }
    });

    const todayLearned = todaySessions.reduce((sum, s) => sum + s.wordsLearned, 0);

    res.json({
      streak: user.streak,
      targetWeekly: user.targetWeekly,
      todayLearned,
      levelDistribution
    });
  } catch (error) {
    next(error);
  }
};
// API lấy thông tin chi tiết của một gói từ vựng
exports.getPackageDetails = async (req, res, next) => {
  try {
    const { packageId } = req.params;
    const userId = req.user.id;

    const pkg = await prisma.vocabularyPackage.findUnique({
      where: { id: packageId }
    });

    if (!pkg) {
      return res.status(404).json({ error: 'Không tìm thấy gói từ vựng' });
    }

    const vocabularies = await prisma.vocabulary.findMany({
      where: { packageId: packageId },
      include: {
        userVocabularies: {
          where: { userId: userId }
        }
      }
    });

    const words = vocabularies.map(v => {
      const userVocab = v.userVocabularies[0];
      return {
        id: v.id,
        word: v.word,
        meaning: v.meaning,
        ipa: v.ipa,
        example: v.example,
        level: userVocab ? userVocab.level : 0,
        nextReview: userVocab ? userVocab.nextReview : null
      };
    });

    // Tính thống kê
    const levelDistribution = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
    words.forEach(w => {
      levelDistribution[w.level]++;
    });

    res.json({
      ...pkg,
      totalWords: words.length,
      learnedWords: words.length - levelDistribution[0],
      levelDistribution,
      words
    });
  } catch (error) {
    next(error);
  }
};

// API lấy các từ đã học trong gói để ôn tập tự do
exports.practicePackage = async (req, res, next) => {
  try {
    const { packageId } = req.params;
    const userId = req.user.id;

    const learned = await prisma.vocabulary.findMany({
      where: {
        packageId: packageId,
        userVocabularies: {
          some: { userId: userId, level: { gt: 0 } }
        }
      },
      include: {
        userVocabularies: {
          where: { userId: userId }
        }
      }
    });

    const formattedData = learned.map(v => ({
      id: v.id,
      word: v.word,
      meaning: v.meaning,
      ipa: v.ipa,
      example: v.example,
      level: v.userVocabularies[0].level
    }));

    res.json(formattedData);
  } catch (error) {
    next(error);
  }
};

// API đánh dấu một từ là đã thuộc (Level 6)
exports.masterVocabulary = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + 30);

    const [progress, history] = await prisma.$transaction([
      prisma.userVocabulary.upsert({
        where: {
          userId_vocabularyId: { userId, vocabularyId: id }
        },
        update: {
          level: 6,
          nextReview: nextReview
        },
        create: {
          userId: userId,
          vocabularyId: id,
          level: 6,
          nextReview: nextReview
        }
      }),
      // Có thể lấy level cũ nếu tồn tại
      prisma.reviewHistory.create({
        data: {
          userId: userId,
          vocabularyId: id,
          isCorrect: true,
          previousLevel: 6, // Fake previous level
          newLevel: 6
        }
      })
    ]);

    res.json({ message: 'Đã đánh dấu là thuộc', progress });
  } catch (error) {
    next(error);
  }
};
