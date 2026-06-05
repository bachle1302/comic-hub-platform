CREATE TABLE "ComicLike" (
  "id" SERIAL NOT NULL,
  "comicId" INTEGER NOT NULL,
  "userId" INTEGER NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "ComicLike_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ComicLike_comicId_userId_key" ON "ComicLike"("comicId", "userId");
CREATE INDEX "ComicLike_comicId_idx" ON "ComicLike"("comicId");
CREATE INDEX "ComicLike_userId_idx" ON "ComicLike"("userId");

ALTER TABLE "ComicLike"
ADD CONSTRAINT "ComicLike_comicId_fkey"
FOREIGN KEY ("comicId") REFERENCES "Comic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ComicLike"
ADD CONSTRAINT "ComicLike_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
