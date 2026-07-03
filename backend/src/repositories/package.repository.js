const prisma = require('../config/db');

const packageAccessWhere = (userId) => ({
  OR: [
    { visibility: 'system' },
    { visibility: 'public' },
    { ownerId: userId },
  ],
});

const vocabularyAccessWhere = (userId) => ({
  OR: [
    { packageId: null },
    { package: { is: packageAccessWhere(userId) } },
  ],
});

const findAccessiblePackage = (packageId, userId) => prisma.vocabularyPackage.findFirst({
  where: {
    id: packageId,
    ...packageAccessWhere(userId),
  },
});

const findAccessibleVocabulary = (vocabularyId, userId) => prisma.vocabulary.findFirst({
  where: {
    id: vocabularyId,
    ...vocabularyAccessWhere(userId),
  },
});

module.exports = {
  packageAccessWhere,
  vocabularyAccessWhere,
  findAccessiblePackage,
  findAccessibleVocabulary,
};
