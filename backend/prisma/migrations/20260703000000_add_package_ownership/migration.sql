ALTER TABLE "VocabularyPackage"
ADD COLUMN IF NOT EXISTS "ownerId" TEXT;

ALTER TABLE "VocabularyPackage"
ADD COLUMN IF NOT EXISTS "visibility" TEXT NOT NULL DEFAULT 'system';

UPDATE "VocabularyPackage" AS package
SET "ownerId" = NULL
WHERE package."ownerId" IS NOT NULL
  AND NOT EXISTS (
    SELECT 1
    FROM "User" AS user_record
    WHERE user_record."id" = package."ownerId"
  );

ALTER TABLE "VocabularyPackage"
DROP CONSTRAINT IF EXISTS "VocabularyPackage_ownerId_fkey";

ALTER TABLE "VocabularyPackage"
ADD CONSTRAINT "VocabularyPackage_ownerId_fkey"
FOREIGN KEY ("ownerId") REFERENCES "User"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX IF NOT EXISTS "VocabularyPackage_ownerId_idx" ON "VocabularyPackage"("ownerId");
CREATE INDEX IF NOT EXISTS "VocabularyPackage_visibility_idx" ON "VocabularyPackage"("visibility");
CREATE INDEX IF NOT EXISTS "UserVocabulary_userId_nextReview_idx" ON "UserVocabulary"("userId", "nextReview");
CREATE INDEX IF NOT EXISTS "StudySession_userId_date_idx" ON "StudySession"("userId", "date");
CREATE INDEX IF NOT EXISTS "ReviewHistory_userId_reviewedAt_idx" ON "ReviewHistory"("userId", "reviewedAt");
