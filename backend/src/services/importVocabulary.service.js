const toStringOrNull = (value) => {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed || null;
};

const normalizeImportedWord = (word, packageId) => ({
  word: String(word.word).trim(),
  meaning: String(word.meaning).trim(),
  ipa: toStringOrNull(word.ipa),
  example: toStringOrNull(word.example),
  partOfSpeech: toStringOrNull(word.partOfSpeech),
  synonyms: Array.isArray(word.synonyms)
    ? word.synonyms.map((item) => String(item).trim()).filter(Boolean)
    : [],
  packageId,
});

const buildImportPackageData = ({ title, description, level, userId, now = new Date() }) => {
  const dateStr = now.toLocaleDateString('vi-VN');
  return {
    title: toStringOrNull(title) || `Tu vung Import (${dateStr})`,
    description: toStringOrNull(description) || 'Goi tu vung ca nhan duoc import tu file JSON.',
    level: toStringOrNull(level) || 'Tuy chon',
    isPro: false,
    ownerId: userId,
    visibility: 'private',
  };
};

module.exports = {
  toStringOrNull,
  normalizeImportedWord,
  buildImportPackageData,
};
