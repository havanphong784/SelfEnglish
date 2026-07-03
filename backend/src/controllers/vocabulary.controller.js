const prisma = require('../config/db');
const {
  packageAccessWhere,
  vocabularyAccessWhere,
  findAccessiblePackage,
  findAccessibleVocabulary,
} = require('../repositories/package.repository');
const {
  getNextLevel,
  getNextLevelForRating,
  isCorrectRating,
  getNextReviewDate,
} = require('../services/review.service');
const {
  normalizeImportedWord,
  buildImportPackageData,
} = require('../services/importVocabulary.service');

const formatVocabulary = (vocabulary, level = 1) => ({
  id: vocabulary.id,
  word: vocabulary.word,
  meaning: vocabulary.meaning,
  ipa: vocabulary.ipa,
  example: vocabulary.example,
  partOfSpeech: vocabulary.partOfSpeech,
  synonyms: vocabulary.synonyms,
  level,
});

exports.getPackages = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const packages = await prisma.vocabularyPackage.findMany({
      where: packageAccessWhere(userId),
      include: {
        _count: {
          select: { vocabularies: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const userVocabs = await prisma.userVocabulary.findMany({
      where: { userId, level: { gt: 0 } },
      include: {
        vocabulary: {
          select: { packageId: true },
        },
      },
    });

    const learnedCountByPackage = {};
    userVocabs.forEach((userVocab) => {
      const packageId = userVocab.vocabulary.packageId;
      if (!packageId) return;
      learnedCountByPackage[packageId] = (learnedCountByPackage[packageId] || 0) + 1;
    });

    res.json(packages.map((pkg) => ({
      id: pkg.id,
      title: pkg.title,
      description: pkg.description,
      level: pkg.level,
      isPro: pkg.isPro,
      visibility: pkg.visibility,
      isOwner: pkg.ownerId === userId,
      totalWords: pkg._count.vocabularies,
      learnedWords: learnedCountByPackage[pkg.id] || 0,
    })));
  } catch (error) {
    next(error);
  }
};

exports.getVocabulariesForReview = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const now = new Date();

    const reviews = await prisma.userVocabulary.findMany({
      where: {
        userId,
        nextReview: { lte: now },
        vocabulary: { is: vocabularyAccessWhere(userId) },
      },
      include: { vocabulary: true },
      take: 20,
    });

    res.json(reviews.map((userVocab) => formatVocabulary(userVocab.vocabulary, userVocab.level)));
  } catch (error) {
    next(error);
  }
};

exports.learnPackage = async (req, res, next) => {
  try {
    const { packageId } = req.params;
    const userId = req.user.id;

    const pkg = await findAccessiblePackage(packageId, userId);
    if (!pkg) {
      return res.status(404).json({ error: 'Khong tim thay goi tu vung' });
    }

    const unlearned = await prisma.vocabulary.findMany({
      where: {
        packageId,
        userVocabularies: {
          none: { userId },
        },
      },
      take: 10,
    });

    res.json(unlearned.map((vocabulary) => formatVocabulary(vocabulary, 1)));
  } catch (error) {
    next(error);
  }
};

exports.updateProgress = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isCorrect, rating } = req.body;
    const userId = req.user.id;

    const vocabulary = await findAccessibleVocabulary(id, userId);
    if (!vocabulary) {
      return res.status(404).json({ error: 'Khong tim thay tu vung' });
    }

    const userVocab = await prisma.userVocabulary.findUnique({
      where: {
        userId_vocabularyId: { userId, vocabularyId: id },
      },
    });

    const previousLevel = userVocab ? userVocab.level : 0;
    const resolvedIsCorrect = rating ? isCorrectRating(rating) : isCorrect;
    const newLevel = rating
      ? getNextLevelForRating(userVocab?.level, rating)
      : getNextLevel(userVocab?.level, isCorrect);
    const nextReview = getNextReviewDate(newLevel);

    const [progress] = await prisma.$transaction([
      prisma.userVocabulary.upsert({
        where: {
          userId_vocabularyId: { userId, vocabularyId: id },
        },
        update: {
          level: newLevel,
          nextReview,
        },
        create: {
          userId,
          vocabularyId: id,
          level: newLevel,
          nextReview,
        },
      }),
      prisma.reviewHistory.create({
        data: {
          userId,
          vocabularyId: id,
          isCorrect: resolvedIsCorrect,
          previousLevel,
          newLevel,
        },
      }),
    ]);

    res.json({
      message: resolvedIsCorrect ? 'Lam tot lam!' : 'Co gang lan sau!',
      progress,
    });
  } catch (error) {
    next(error);
  }
};

exports.importVocabularies = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { words, title, description, level } = req.body;

    const packageData = buildImportPackageData({
      title,
      description,
      level,
      userId,
    });

    const { newPackage, created } = await prisma.$transaction(async (tx) => {
      const pkg = await tx.vocabularyPackage.create({
        data: packageData,
      });

      const result = await tx.vocabulary.createMany({
        data: words.map((word) => normalizeImportedWord(word, pkg.id)),
        skipDuplicates: true,
      });

      return { newPackage: pkg, created: result };
    });

    res.json({
      message: `Da import ${created.count} tu vung vao goi "${newPackage.title}"`,
      packageId: newPackage.id,
    });
  } catch (error) {
    next(error);
  }
};

exports.getRandomVocabularies = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { excludeId, limit = 3, partOfSpeech, excludeSynonyms } = req.query;

    let parsedLimit = parseInt(limit, 10);
    if (Number.isNaN(parsedLimit) || parsedLimit <= 0) parsedLimit = 3;
    parsedLimit = Math.min(parsedLimit, 10);

    let synonymsArray = [];
    if (excludeSynonyms) {
      synonymsArray = excludeSynonyms.split(',').map((item) => item.trim().toLowerCase());
    }

    const whereCondition = {};

    if (excludeId) {
      whereCondition.id = { not: excludeId };
    }

    if (partOfSpeech) {
      whereCondition.partOfSpeech = partOfSpeech;
    }

    let words = await prisma.vocabulary.findMany({
      where: {
        AND: [whereCondition, vocabularyAccessWhere(userId)],
      },
      take: 100,
    });

    if (synonymsArray.length > 0) {
      words = words.filter((word) => !synonymsArray.includes(word.word.toLowerCase()));
    }

    if (words.length < parsedLimit) {
      const fallbackCondition = excludeId ? { id: { not: excludeId } } : {};
      const fallbackWords = await prisma.vocabulary.findMany({
        where: {
          AND: [fallbackCondition, vocabularyAccessWhere(userId)],
        },
        take: 50,
      });

      const existingIds = new Set(words.map((word) => word.id));
      fallbackWords.forEach((word) => {
        if (existingIds.has(word.id)) return;
        if (synonymsArray.length && synonymsArray.includes(word.word.toLowerCase())) return;
        words.push(word);
        existingIds.add(word.id);
      });
    }

    const shuffled = words.sort(() => 0.5 - Math.random());
    res.json(shuffled.slice(0, parsedLimit));
  } catch (error) {
    next(error);
  }
};

exports.saveSession = async (req, res, next) => {
  try {
    const { durationMinutes, wordsLearned } = req.body;
    const userId = req.user.id;

    const session = await prisma.studySession.create({
      data: {
        userId,
        durationMinutes: Number(durationMinutes) || 0,
        wordsLearned: Number(wordsLearned) || 0,
      },
    });

    const lastSession = await prisma.studySession.findFirst({
      where: {
        userId,
        id: { not: session.id },
      },
      orderBy: { date: 'desc' },
    });

    const user = await prisma.user.findUnique({ where: { id: userId } });
    let newStreak = user.streak;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (!lastSession) {
      newStreak = 1;
    } else {
      const lastDate = new Date(lastSession.date);
      lastDate.setHours(0, 0, 0, 0);

      const diffDays = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        newStreak += 1;
      } else if (diffDays > 1) {
        newStreak = 1;
      }
    }

    if (newStreak !== user.streak) {
      await prisma.user.update({
        where: { id: userId },
        data: { streak: newStreak },
      });
    }

    res.json({ message: 'Luu phien hoc thanh cong', session, newStreak });
  } catch (error) {
    next(error);
  }
};

exports.getSchedule = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ error: 'Thieu tham so date (YYYY-MM-DD)' });
    }

    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);
    const nextDay = new Date(targetDate);
    nextDay.setDate(targetDate.getDate() + 1);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const result = { date, isFuture: targetDate >= today, items: [] };

    if (targetDate < today) {
      const history = await prisma.reviewHistory.findMany({
        where: {
          userId,
          vocabulary: { is: vocabularyAccessWhere(userId) },
          reviewedAt: {
            gte: targetDate,
            lt: nextDay,
          },
        },
        include: { vocabulary: true },
      });

      result.items = history.map((item) => ({
        id: item.id,
        word: item.vocabulary.word,
        meaning: item.vocabulary.meaning,
        isCorrect: item.isCorrect,
        previousLevel: item.previousLevel,
        newLevel: item.newLevel,
        reviewedAt: item.reviewedAt,
      }));
    } else {
      const schedules = await prisma.userVocabulary.findMany({
        where: {
          userId,
          vocabulary: { is: vocabularyAccessWhere(userId) },
          nextReview: {
            gte: targetDate,
            lt: nextDay,
          },
        },
        include: { vocabulary: true },
      });

      result.items = schedules.map((item) => ({
        id: item.vocabulary.id,
        word: item.vocabulary.word,
        meaning: item.vocabulary.meaning,
        level: item.level,
        nextReview: item.nextReview,
      }));
    }

    res.json(result);
  } catch (error) {
    next(error);
  }
};

exports.getStats = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await prisma.user.findUnique({ where: { id: userId } });

    const userVocabs = await prisma.userVocabulary.findMany({
      where: { userId },
    });

    const levelDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
    userVocabs.forEach((vocab) => {
      if (levelDistribution[vocab.level] !== undefined) {
        levelDistribution[vocab.level]++;
      }
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const nextDay = new Date(today);
    nextDay.setDate(today.getDate() + 1);

    const todaySessions = await prisma.studySession.findMany({
      where: {
        userId,
        date: { gte: today, lt: nextDay },
      },
    });

    const todayLearned = todaySessions.reduce((sum, session) => sum + session.wordsLearned, 0);

    res.json({
      streak: user.streak,
      targetWeekly: user.targetWeekly,
      todayLearned,
      levelDistribution,
    });
  } catch (error) {
    next(error);
  }
};

exports.getPackageDetails = async (req, res, next) => {
  try {
    const { packageId } = req.params;
    const userId = req.user.id;

    const pkg = await findAccessiblePackage(packageId, userId);
    if (!pkg) {
      return res.status(404).json({ error: 'Khong tim thay goi tu vung' });
    }

    const vocabularies = await prisma.vocabulary.findMany({
      where: { packageId },
      include: {
        userVocabularies: {
          where: { userId },
        },
      },
    });

    const words = vocabularies.map((vocabulary) => {
      const userVocab = vocabulary.userVocabularies[0];
      return {
        ...formatVocabulary(vocabulary, userVocab ? userVocab.level : 0),
        nextReview: userVocab ? userVocab.nextReview : null,
      };
    });

    const levelDistribution = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
    words.forEach((word) => {
      levelDistribution[word.level]++;
    });

    res.json({
      id: pkg.id,
      title: pkg.title,
      description: pkg.description,
      level: pkg.level,
      isPro: pkg.isPro,
      visibility: pkg.visibility,
      isOwner: pkg.ownerId === userId,
      totalWords: words.length,
      learnedWords: words.length - levelDistribution[0],
      levelDistribution,
      words,
    });
  } catch (error) {
    next(error);
  }
};

exports.practicePackage = async (req, res, next) => {
  try {
    const { packageId } = req.params;
    const userId = req.user.id;

    const pkg = await findAccessiblePackage(packageId, userId);
    if (!pkg) {
      return res.status(404).json({ error: 'Khong tim thay goi tu vung' });
    }

    const learned = await prisma.vocabulary.findMany({
      where: {
        packageId,
        userVocabularies: {
          some: { userId, level: { gt: 0 } },
        },
      },
      include: {
        userVocabularies: {
          where: { userId },
        },
      },
    });

    res.json(learned.map((vocabulary) => (
      formatVocabulary(vocabulary, vocabulary.userVocabularies[0].level)
    )));
  } catch (error) {
    next(error);
  }
};

exports.masterVocabulary = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const vocabulary = await findAccessibleVocabulary(id, userId);
    if (!vocabulary) {
      return res.status(404).json({ error: 'Khong tim thay tu vung' });
    }

    const currentProgress = await prisma.userVocabulary.findUnique({
      where: {
        userId_vocabularyId: { userId, vocabularyId: id },
      },
    });

    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + 30);

    const [progress] = await prisma.$transaction([
      prisma.userVocabulary.upsert({
        where: {
          userId_vocabularyId: { userId, vocabularyId: id },
        },
        update: {
          level: 6,
          nextReview,
        },
        create: {
          userId,
          vocabularyId: id,
          level: 6,
          nextReview,
        },
      }),
      prisma.reviewHistory.create({
        data: {
          userId,
          vocabularyId: id,
          isCorrect: true,
          previousLevel: currentProgress ? currentProgress.level : 0,
          newLevel: 6,
        },
      }),
    ]);

    res.json({ message: 'Da danh dau la thuoc', progress });
  } catch (error) {
    next(error);
  }
};
