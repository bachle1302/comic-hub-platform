ALTER TABLE "ComicLike" ALTER COLUMN "userId" DROP NOT NULL;

ALTER TABLE "ComicLike" ADD COLUMN "anonymousId" VARCHAR(128);

CREATE UNIQUE INDEX "ComicLike_comicId_anonymousId_key" ON "ComicLike"("comicId", "anonymousId");

CREATE INDEX "ComicLike_anonymousId_idx" ON "ComicLike"("anonymousId");
