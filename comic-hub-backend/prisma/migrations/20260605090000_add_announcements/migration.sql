-- CreateEnum
CREATE TYPE "AnnouncementType" AS ENUM ('INFO', 'SUCCESS', 'WARNING', 'DANGER', 'PROMOTION');

-- CreateEnum
CREATE TYPE "AnnouncementTarget" AS ENUM ('ALL', 'AUTHENTICATED', 'GUEST');

-- CreateTable
CREATE TABLE "Announcement" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" "AnnouncementType" NOT NULL DEFAULT 'INFO',
    "target" "AnnouncementTarget" NOT NULL DEFAULT 'ALL',
    "linkUrl" VARCHAR(500),
    "linkLabel" VARCHAR(100),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "startsAt" TIMESTAMP(3),
    "endsAt" TIMESTAMP(3),
    "createdById" INTEGER,
    "updatedById" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Announcement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Announcement_isActive_idx" ON "Announcement"("isActive");

-- CreateIndex
CREATE INDEX "Announcement_priority_idx" ON "Announcement"("priority");

-- CreateIndex
CREATE INDEX "Announcement_startsAt_idx" ON "Announcement"("startsAt");

-- CreateIndex
CREATE INDEX "Announcement_endsAt_idx" ON "Announcement"("endsAt");

-- CreateIndex
CREATE INDEX "Announcement_target_idx" ON "Announcement"("target");
