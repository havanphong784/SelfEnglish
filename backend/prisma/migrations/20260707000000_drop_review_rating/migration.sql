ALTER TABLE "ReviewHistory"
  DROP COLUMN IF EXISTS "rating";

DROP TYPE IF EXISTS "ReviewRating";
