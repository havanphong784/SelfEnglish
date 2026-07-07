const { z } = require('zod');

const uuidParam = z.object({
  id: z.string().uuid(),
});

const packageParam = z.object({
  packageId: z.string().uuid(),
});

const reviewBody = z.object({
  isCorrect: z.boolean(),
}).strict();

const importedWord = z.object({
  word: z.string().trim().min(1),
  meaning: z.string().trim().min(1),
  ipa: z.string().trim().optional().nullable(),
  example: z.string().trim().optional().nullable(),
  partOfSpeech: z.string().trim().optional().nullable(),
  synonyms: z.array(z.string().trim().min(1)).optional().default([]),
});

const importBody = z.object({
  title: z.string().trim().optional(),
  description: z.string().trim().optional(),
  level: z.string().trim().optional(),
  words: z.array(importedWord).min(1).max(1000),
});

const sessionBody = z.object({
  durationMinutes: z.coerce.number().int().min(0).max(1440).optional(),
  wordsLearned: z.coerce.number().int().min(0).max(10000).optional(),
});

const scheduleQuery = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

const randomQuery = z.object({
  excludeId: z.string().uuid().optional(),
  limit: z.coerce.number().int().min(1).max(10).optional().default(3),
  partOfSpeech: z.string().trim().optional(),
  excludeSynonyms: z.string().trim().optional(),
});

module.exports = {
  uuidParam,
  packageParam,
  reviewBody,
  importBody,
  sessionBody,
  scheduleQuery,
  randomQuery,
};
