-- CreateEnum
CREATE TYPE "CommentReportStatus" AS ENUM ('PENDING', 'RESOLVED', 'REJECTED');

-- CreateTable
CREATE TABLE "CommentReport" (
    "id" SERIAL NOT NULL,
    "commentId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "reason" VARCHAR(500) NOT NULL,
    "status" "CommentReportStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CommentReport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CommentReport_commentId_userId_key" ON "CommentReport"("commentId", "userId");

-- CreateIndex
CREATE INDEX "CommentReport_commentId_idx" ON "CommentReport"("commentId");

-- CreateIndex
CREATE INDEX "CommentReport_userId_idx" ON "CommentReport"("userId");

-- CreateIndex
CREATE INDEX "CommentReport_status_idx" ON "CommentReport"("status");

-- AddForeignKey
ALTER TABLE "CommentReport" ADD CONSTRAINT "CommentReport_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "Comment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommentReport" ADD CONSTRAINT "CommentReport_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
