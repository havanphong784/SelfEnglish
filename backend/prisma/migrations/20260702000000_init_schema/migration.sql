CREATE SCHEMA IF NOT EXISTS "public";

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

CREATE TABLE IF NOT EXISTS "User" (
  "id" TEXT NOT NULL,
  "firebaseUid" TEXT,
  "email" TEXT NOT NULL,
  "name" TEXT,
  "streak" INTEGER NOT NULL DEFAULT 0,
  "targetWeekly" INTEGER NOT NULL DEFAULT 80,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "VocabularyPackage" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "level" TEXT NOT NULL DEFAULT 'All Levels',
  "isPro" BOOLEAN NOT NULL DEFAULT false,
  "ownerId" TEXT,
  "visibility" "PackageVisibility" NOT NULL DEFAULT 'system',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "VocabularyPackage_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Vocabulary" (
  "id" TEXT NOT NULL,
  "word" TEXT NOT NULL,
  "meaning" TEXT NOT NULL,
  "ipa" TEXT,
  "example" TEXT,
  "partOfSpeech" TEXT,
  "synonyms" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "packageId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Vocabulary_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "UserVocabulary" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "vocabularyId" TEXT NOT NULL,
  "level" INTEGER NOT NULL DEFAULT 1,
  "nextReview" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "UserVocabulary_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "StudySession" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "durationMinutes" INTEGER NOT NULL DEFAULT 0,
  "wordsLearned" INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT "StudySession_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ReviewHistory" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "vocabularyId" TEXT NOT NULL,
  "reviewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "isCorrect" BOOLEAN NOT NULL,
  "rating" "ReviewRating",
  "previousLevel" INTEGER NOT NULL,
  "newLevel" INTEGER NOT NULL,
  CONSTRAINT "ReviewHistory_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "User_firebaseUid_key" ON "User"("firebaseUid");
CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");
CREATE INDEX IF NOT EXISTS "VocabularyPackage_ownerId_idx" ON "VocabularyPackage"("ownerId");
CREATE INDEX IF NOT EXISTS "VocabularyPackage_visibility_idx" ON "VocabularyPackage"("visibility");
CREATE INDEX IF NOT EXISTS "Vocabulary_packageId_idx" ON "Vocabulary"("packageId");
CREATE INDEX IF NOT EXISTS "Vocabulary_partOfSpeech_idx" ON "Vocabulary"("partOfSpeech");
CREATE INDEX IF NOT EXISTS "UserVocabulary_userId_nextReview_idx" ON "UserVocabulary"("userId", "nextReview");
CREATE INDEX IF NOT EXISTS "UserVocabulary_vocabularyId_idx" ON "UserVocabulary"("vocabularyId");
CREATE UNIQUE INDEX IF NOT EXISTS "UserVocabulary_userId_vocabularyId_key" ON "UserVocabulary"("userId", "vocabularyId");
CREATE INDEX IF NOT EXISTS "StudySession_userId_date_idx" ON "StudySession"("userId", "date");
CREATE INDEX IF NOT EXISTS "ReviewHistory_userId_reviewedAt_idx" ON "ReviewHistory"("userId", "reviewedAt");
CREATE INDEX IF NOT EXISTS "ReviewHistory_vocabularyId_idx" ON "ReviewHistory"("vocabularyId");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'VocabularyPackage_ownerId_fkey'
  ) THEN
    ALTER TABLE "VocabularyPackage"
      ADD CONSTRAINT "VocabularyPackage_ownerId_fkey"
      FOREIGN KEY ("ownerId") REFERENCES "User"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'Vocabulary_packageId_fkey'
  ) THEN
    ALTER TABLE "Vocabulary"
      ADD CONSTRAINT "Vocabulary_packageId_fkey"
      FOREIGN KEY ("packageId") REFERENCES "VocabularyPackage"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'UserVocabulary_userId_fkey'
  ) THEN
    ALTER TABLE "UserVocabulary"
      ADD CONSTRAINT "UserVocabulary_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "User"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'UserVocabulary_vocabularyId_fkey'
  ) THEN
    ALTER TABLE "UserVocabulary"
      ADD CONSTRAINT "UserVocabulary_vocabularyId_fkey"
      FOREIGN KEY ("vocabularyId") REFERENCES "Vocabulary"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'StudySession_userId_fkey'
  ) THEN
    ALTER TABLE "StudySession"
      ADD CONSTRAINT "StudySession_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "User"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'ReviewHistory_userId_fkey'
  ) THEN
    ALTER TABLE "ReviewHistory"
      ADD CONSTRAINT "ReviewHistory_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "User"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'ReviewHistory_vocabularyId_fkey'
  ) THEN
    ALTER TABLE "ReviewHistory"
      ADD CONSTRAINT "ReviewHistory_vocabularyId_fkey"
      FOREIGN KEY ("vocabularyId") REFERENCES "Vocabulary"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
