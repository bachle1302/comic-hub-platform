ALTER TABLE "Comic" ADD COLUMN "deletedAt" TIMESTAMP(3);
ALTER TABLE "Comic" ADD COLUMN "deletedById" INTEGER;
ALTER TABLE "Comic" ADD COLUMN "deleteReason" TEXT;

ALTER TABLE "Chapter" ADD COLUMN "deletedAt" TIMESTAMP(3);
ALTER TABLE "Chapter" ADD COLUMN "deletedById" INTEGER;
ALTER TABLE "Chapter" ADD COLUMN "deleteReason" TEXT;

CREATE INDEX "Comic_deletedAt_idx" ON "Comic"("deletedAt");
CREATE INDEX "Comic_deletedById_idx" ON "Comic"("deletedById");
CREATE INDEX "Chapter_deletedAt_idx" ON "Chapter"("deletedAt");
CREATE INDEX "Chapter_deletedById_idx" ON "Chapter"("deletedById");
