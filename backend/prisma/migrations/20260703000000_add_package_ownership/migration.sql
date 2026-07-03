ALTER TABLE "VocabularyPackage"
ADD COLUMN "ownerId" TEXT,
ADD COLUMN "visibility" TEXT NOT NULL DEFAULT 'system';

ALTER TABLE "VocabularyPackage"
ADD CONSTRAINT "VocabularyPackage_ownerId_fkey"
FOREIGN KEY ("ownerId") REFERENCES "User"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "VocabularyPackage_ownerId_idx" ON "VocabularyPackage"("ownerId");
CREATE INDEX "VocabularyPackage_visibility_idx" ON "VocabularyPackage"("visibility");
CREATE INDEX "UserVocabulary_userId_nextReview_idx" ON "UserVocabulary"("userId", "nextReview");
CREATE INDEX "StudySession_userId_date_idx" ON "StudySession"("userId", "date");
CREATE INDEX "ReviewHistory_userId_reviewedAt_idx" ON "ReviewHistory"("userId", "reviewedAt");
