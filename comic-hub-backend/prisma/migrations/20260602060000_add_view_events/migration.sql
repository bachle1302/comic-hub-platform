CREATE TYPE "ViewTargetType" AS ENUM ('COMIC', 'CHAPTER');

CREATE TABLE "ViewEvent" (
    "id" SERIAL NOT NULL,
    "targetType" "ViewTargetType" NOT NULL,
    "comicId" INTEGER,
    "chapterId" INTEGER,
    "userId" INTEGER,
    "ipHash" VARCHAR(128),
    "userAgent" VARCHAR(500),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ViewEvent_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ViewEvent_targetType_idx" ON "ViewEvent"("targetType");
CREATE INDEX "ViewEvent_comicId_idx" ON "ViewEvent"("comicId");
CREATE INDEX "ViewEvent_chapterId_idx" ON "ViewEvent"("chapterId");
CREATE INDEX "ViewEvent_userId_idx" ON "ViewEvent"("userId");
CREATE INDEX "ViewEvent_ipHash_idx" ON "ViewEvent"("ipHash");
CREATE INDEX "ViewEvent_createdAt_idx" ON "ViewEvent"("createdAt");

ALTER TABLE "ViewEvent" ADD CONSTRAINT "ViewEvent_comicId_fkey" FOREIGN KEY ("comicId") REFERENCES "Comic"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ViewEvent" ADD CONSTRAINT "ViewEvent_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES "Chapter"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ViewEvent" ADD CONSTRAINT "ViewEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
