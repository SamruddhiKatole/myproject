-- Full-text search columns (D-018).
-- Prisma models `searchVector` as Unsupported("tsvector") and creates a plain column plus a GIN
-- index in the `init` migration. This migration replaces each one with a STORED GENERATED column,
-- so the database keeps it in sync and the app never writes it.
-- The 'simple' configuration is used because Postgres ships no Hindi/Marathi dictionaries.
-- It tokenises Devanagari and Latin text without stemming.
-- Hand-written: Prisma's schema language can't express generated columns or CHECK constraints.

DROP INDEX IF EXISTS "Job_searchVector_idx";
ALTER TABLE "Job" DROP COLUMN "searchVector";
ALTER TABLE "Job" ADD COLUMN "searchVector" tsvector
  GENERATED ALWAYS AS (
    to_tsvector('simple', coalesce("title", '') || ' ' || coalesce("description", ''))
  ) STORED;
CREATE INDEX "Job_searchVector_idx" ON "Job" USING GIN ("searchVector");

DROP INDEX IF EXISTS "WorkerProfile_searchVector_idx";
ALTER TABLE "WorkerProfile" DROP COLUMN "searchVector";
ALTER TABLE "WorkerProfile" ADD COLUMN "searchVector" tsvector
  GENERATED ALWAYS AS (
    to_tsvector('simple', coalesce("displayName", '') || ' ' || coalesce("bio", ''))
  ) STORED;
CREATE INDEX "WorkerProfile_searchVector_idx" ON "WorkerProfile" USING GIN ("searchVector");

-- Guard rails the schema language can't express (validation also lives in Zod services).
ALTER TABLE "Job" ADD CONSTRAINT "Job_payAmount_range" CHECK ("payAmount" BETWEEN 1 AND 1000000);
ALTER TABLE "Job" ADD CONSTRAINT "Job_openings_range" CHECK ("openings" BETWEEN 1 AND 50);
ALTER TABLE "Job" ADD CONSTRAINT "Job_hiredCount_range" CHECK ("hiredCount" >= 0 AND "hiredCount" <= "openings");
ALTER TABLE "Review" ADD CONSTRAINT "Review_rating_range" CHECK ("rating" BETWEEN 1 AND 5);
ALTER TABLE "WorkerProfile" ADD CONSTRAINT "WorkerProfile_experience_range" CHECK ("experienceYears" BETWEEN 0 AND 50);
ALTER TABLE "Locality" ADD CONSTRAINT "Locality_coords_range" CHECK ("lat" BETWEEN -90 AND 90 AND "lng" BETWEEN -180 AND 180);
ALTER TABLE "Block" ADD CONSTRAINT "Block_not_self" CHECK ("blockerUserId" <> "blockedUserId");
