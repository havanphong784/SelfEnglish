DO $$
BEGIN
  CREATE TYPE "PackageVisibility" AS ENUM ('system', 'public', 'private');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE TYPE "ReviewRating" AS ENUM ('again', 'hard', 'good', 'easy');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

UPDATE "VocabularyPackage"
SET "visibility" = CASE
  WHEN "visibility" IN ('system', 'public', 'private') THEN "visibility"
  WHEN "ownerId" IS NULL THEN 'system'
  ELSE 'private'
END;

UPDATE "VocabularyPackage" AS package
SET "ownerId" = NULL,
    "visibility" = 'system'
WHERE package."ownerId" IS NOT NULL
  AND NOT EXISTS (
    SELECT 1
    FROM "User" AS user_record
    WHERE user_record."id" = package."ownerId"
  );

UPDATE "VocabularyPackage"
SET "ownerId" = NULL
WHERE "visibility" = 'system';

UPDATE "VocabularyPackage"
SET "visibility" = 'system'
WHERE "ownerId" IS NULL
  AND "visibility" <> 'system';

ALTER TABLE "VocabularyPackage"
  ALTER COLUMN "visibility" DROP DEFAULT,
  ALTER COLUMN "visibility" TYPE "PackageVisibility" USING ("visibility"::text::"PackageVisibility"),
  ALTER COLUMN "visibility" SET DEFAULT 'system';

ALTER TABLE "ReviewHistory"
  ADD COLUMN IF NOT EXISTS "rating" "ReviewRating";

UPDATE "Vocabulary"
SET "synonyms" = ARRAY[]::TEXT[]
WHERE "synonyms" IS NULL;

ALTER TABLE "Vocabulary"
  ALTER COLUMN "synonyms" SET DEFAULT ARRAY[]::TEXT[],
  ALTER COLUMN "synonyms" SET NOT NULL;

UPDATE "Vocabulary" AS vocabulary
SET "packageId" = NULL
WHERE vocabulary."packageId" IS NOT NULL
  AND NOT EXISTS (
    SELECT 1
    FROM "VocabularyPackage" AS package
    WHERE package."id" = vocabulary."packageId"
  );

DELETE FROM "ReviewHistory" AS history
WHERE NOT EXISTS (
    SELECT 1
    FROM "User" AS user_record
    WHERE user_record."id" = history."userId"
  )
  OR NOT EXISTS (
    SELECT 1
    FROM "Vocabulary" AS vocabulary
    WHERE vocabulary."id" = history."vocabularyId"
  );

DELETE FROM "UserVocabulary" AS progress
WHERE NOT EXISTS (
    SELECT 1
    FROM "User" AS user_record
    WHERE user_record."id" = progress."userId"
  )
  OR NOT EXISTS (
    SELECT 1
    FROM "Vocabulary" AS vocabulary
    WHERE vocabulary."id" = progress."vocabularyId"
  );

DELETE FROM "StudySession" AS session
WHERE NOT EXISTS (
  SELECT 1
  FROM "User" AS user_record
  WHERE user_record."id" = session."userId"
);

CREATE TEMP TABLE "_VocabularyDuplicateMap" ON COMMIT DROP AS
SELECT "id" AS "duplicateId",
       "keeperId"
FROM (
  SELECT "id",
         first_value("id") OVER (
           PARTITION BY "packageId", lower(btrim("word"))
           ORDER BY "createdAt", "id"
         ) AS "keeperId",
         row_number() OVER (
           PARTITION BY "packageId", lower(btrim("word"))
           ORDER BY "createdAt", "id"
         ) AS "rank"
  FROM "Vocabulary"
  WHERE "packageId" IS NOT NULL
) AS ranked
WHERE "rank" > 1;

CREATE TEMP TABLE "_UserVocabularyDuplicateProgressMap" ON COMMIT DROP AS
SELECT loser."id" AS "loserId",
       keeper."id" AS "keeperId"
FROM "UserVocabulary" AS loser
JOIN "_VocabularyDuplicateMap" AS vocabulary_map
  ON vocabulary_map."duplicateId" = loser."vocabularyId"
JOIN "UserVocabulary" AS keeper
  ON keeper."userId" = loser."userId"
 AND keeper."vocabularyId" = vocabulary_map."keeperId";

UPDATE "UserVocabulary" AS keeper
SET "level" = GREATEST(keeper."level", loser."level"),
    "nextReview" = LEAST(keeper."nextReview", loser."nextReview"),
    "updatedAt" = GREATEST(keeper."updatedAt", loser."updatedAt")
FROM "_UserVocabularyDuplicateProgressMap" AS progress_map
JOIN "UserVocabulary" AS loser
  ON loser."id" = progress_map."loserId"
WHERE keeper."id" = progress_map."keeperId";

DELETE FROM "UserVocabulary" AS loser
USING "_UserVocabularyDuplicateProgressMap" AS progress_map
WHERE loser."id" = progress_map."loserId";

UPDATE "UserVocabulary" AS progress
SET "vocabularyId" = vocabulary_map."keeperId"
FROM "_VocabularyDuplicateMap" AS vocabulary_map
WHERE progress."vocabularyId" = vocabulary_map."duplicateId";

UPDATE "ReviewHistory" AS history
SET "vocabularyId" = vocabulary_map."keeperId"
FROM "_VocabularyDuplicateMap" AS vocabulary_map
WHERE history."vocabularyId" = vocabulary_map."duplicateId";

DELETE FROM "Vocabulary" AS vocabulary
USING "_VocabularyDuplicateMap" AS vocabulary_map
WHERE vocabulary."id" = vocabulary_map."duplicateId";

UPDATE "User"
SET "streak" = 0
WHERE "streak" < 0;

UPDATE "User"
SET "targetWeekly" = 0
WHERE "targetWeekly" < 0;

UPDATE "UserVocabulary"
SET "level" = LEAST(6, GREATEST(1, "level"));

UPDATE "ReviewHistory"
SET "previousLevel" = LEAST(6, GREATEST(0, "previousLevel")),
    "newLevel" = LEAST(6, GREATEST(1, "newLevel"));

UPDATE "StudySession"
SET "durationMinutes" = 0
WHERE "durationMinutes" < 0;

UPDATE "StudySession"
SET "wordsLearned" = 0
WHERE "wordsLearned" < 0;

ALTER TABLE "VocabularyPackage" DROP CONSTRAINT IF EXISTS "VocabularyPackage_ownerId_fkey";
ALTER TABLE "Vocabulary" DROP CONSTRAINT IF EXISTS "Vocabulary_packageId_fkey";
ALTER TABLE "UserVocabulary" DROP CONSTRAINT IF EXISTS "UserVocabulary_userId_fkey";
ALTER TABLE "UserVocabulary" DROP CONSTRAINT IF EXISTS "UserVocabulary_vocabularyId_fkey";
ALTER TABLE "StudySession" DROP CONSTRAINT IF EXISTS "StudySession_userId_fkey";
ALTER TABLE "ReviewHistory" DROP CONSTRAINT IF EXISTS "ReviewHistory_userId_fkey";
ALTER TABLE "ReviewHistory" DROP CONSTRAINT IF EXISTS "ReviewHistory_vocabularyId_fkey";

ALTER TABLE "VocabularyPackage"
  ADD CONSTRAINT "VocabularyPackage_ownerId_fkey"
  FOREIGN KEY ("ownerId") REFERENCES "User"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Vocabulary"
  ADD CONSTRAINT "Vocabulary_packageId_fkey"
  FOREIGN KEY ("packageId") REFERENCES "VocabularyPackage"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "UserVocabulary"
  ADD CONSTRAINT "UserVocabulary_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "UserVocabulary"
  ADD CONSTRAINT "UserVocabulary_vocabularyId_fkey"
  FOREIGN KEY ("vocabularyId") REFERENCES "Vocabulary"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "StudySession"
  ADD CONSTRAINT "StudySession_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ReviewHistory"
  ADD CONSTRAINT "ReviewHistory_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ReviewHistory"
  ADD CONSTRAINT "ReviewHistory_vocabularyId_fkey"
  FOREIGN KEY ("vocabularyId") REFERENCES "Vocabulary"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "VocabularyPackage" DROP CONSTRAINT IF EXISTS "VocabularyPackage_visibility_owner_check";
ALTER TABLE "VocabularyPackage"
  ADD CONSTRAINT "VocabularyPackage_visibility_owner_check"
  CHECK (
    ("visibility" = 'system' AND "ownerId" IS NULL)
    OR ("visibility" <> 'system' AND "ownerId" IS NOT NULL)
  );

ALTER TABLE "User" DROP CONSTRAINT IF EXISTS "User_streak_nonnegative_check";
ALTER TABLE "User"
  ADD CONSTRAINT "User_streak_nonnegative_check"
  CHECK ("streak" >= 0);

ALTER TABLE "User" DROP CONSTRAINT IF EXISTS "User_targetWeekly_nonnegative_check";
ALTER TABLE "User"
  ADD CONSTRAINT "User_targetWeekly_nonnegative_check"
  CHECK ("targetWeekly" >= 0);

ALTER TABLE "UserVocabulary" DROP CONSTRAINT IF EXISTS "UserVocabulary_level_range_check";
ALTER TABLE "UserVocabulary"
  ADD CONSTRAINT "UserVocabulary_level_range_check"
  CHECK ("level" BETWEEN 1 AND 6);

ALTER TABLE "ReviewHistory" DROP CONSTRAINT IF EXISTS "ReviewHistory_previousLevel_range_check";
ALTER TABLE "ReviewHistory"
  ADD CONSTRAINT "ReviewHistory_previousLevel_range_check"
  CHECK ("previousLevel" BETWEEN 0 AND 6);

ALTER TABLE "ReviewHistory" DROP CONSTRAINT IF EXISTS "ReviewHistory_newLevel_range_check";
ALTER TABLE "ReviewHistory"
  ADD CONSTRAINT "ReviewHistory_newLevel_range_check"
  CHECK ("newLevel" BETWEEN 1 AND 6);

ALTER TABLE "StudySession" DROP CONSTRAINT IF EXISTS "StudySession_durationMinutes_nonnegative_check";
ALTER TABLE "StudySession"
  ADD CONSTRAINT "StudySession_durationMinutes_nonnegative_check"
  CHECK ("durationMinutes" >= 0);

ALTER TABLE "StudySession" DROP CONSTRAINT IF EXISTS "StudySession_wordsLearned_nonnegative_check";
ALTER TABLE "StudySession"
  ADD CONSTRAINT "StudySession_wordsLearned_nonnegative_check"
  CHECK ("wordsLearned" >= 0);

DROP INDEX IF EXISTS "Vocabulary_packageId_word_ci_key";
CREATE UNIQUE INDEX "Vocabulary_packageId_word_ci_key"
  ON "Vocabulary" ("packageId", lower(btrim("word")))
  WHERE "packageId" IS NOT NULL;

CREATE INDEX IF NOT EXISTS "Vocabulary_packageId_idx" ON "Vocabulary"("packageId");
CREATE INDEX IF NOT EXISTS "Vocabulary_partOfSpeech_idx" ON "Vocabulary"("partOfSpeech");
CREATE INDEX IF NOT EXISTS "UserVocabulary_vocabularyId_idx" ON "UserVocabulary"("vocabularyId");
CREATE INDEX IF NOT EXISTS "ReviewHistory_vocabularyId_idx" ON "ReviewHistory"("vocabularyId");

ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "VocabularyPackage" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Vocabulary" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "UserVocabulary" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "StudySession" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ReviewHistory" ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
    REVOKE ALL ON TABLE
      "User",
      "VocabularyPackage",
      "Vocabulary",
      "UserVocabulary",
      "StudySession",
      "ReviewHistory"
    FROM anon;
  END IF;

  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
    REVOKE ALL ON TABLE
      "User",
      "VocabularyPackage",
      "Vocabulary",
      "UserVocabulary",
      "StudySession",
      "ReviewHistory"
    FROM authenticated;
  END IF;
END $$;
