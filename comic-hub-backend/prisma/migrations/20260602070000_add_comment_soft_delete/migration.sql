ALTER TABLE "Comment" ADD COLUMN "deletedAt" TIMESTAMP(3);
ALTER TABLE "Comment" ADD COLUMN "deletedById" INTEGER;
ALTER TABLE "Comment" ADD COLUMN "deleteReason" VARCHAR(500);

CREATE INDEX "Comment_deletedAt_idx" ON "Comment"("deletedAt");
CREATE INDEX "Comment_deletedById_idx" ON "Comment"("deletedById");
