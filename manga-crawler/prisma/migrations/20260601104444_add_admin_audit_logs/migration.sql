-- CreateEnum
CREATE TYPE "AdminAuditAction" AS ENUM ('CREATE_AUTHOR', 'UPDATE_AUTHOR', 'DELETE_AUTHOR', 'CREATE_CATEGORY', 'UPDATE_CATEGORY', 'DELETE_CATEGORY', 'CREATE_COMIC', 'UPDATE_COMIC', 'DELETE_COMIC', 'CREATE_CHAPTER', 'UPDATE_CHAPTER', 'DELETE_CHAPTER', 'UPLOAD_CHAPTER_IMAGES', 'DELETE_COMMENT', 'DELETE_REPORTED_COMMENT', 'UPDATE_COMMENT_REPORT_STATUS', 'ADJUST_USER_COIN', 'UPDATE_USER', 'DELETE_USER', 'SYSTEM');

-- CreateTable
CREATE TABLE "AdminAuditLog" (
    "id" SERIAL NOT NULL,
    "adminId" INTEGER,
    "adminEmail" TEXT,
    "adminName" TEXT,
    "action" "AdminAuditAction" NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "message" TEXT NOT NULL,
    "metadata" JSONB,
    "ip" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminAuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AdminAuditLog_adminId_idx" ON "AdminAuditLog"("adminId");

-- CreateIndex
CREATE INDEX "AdminAuditLog_action_idx" ON "AdminAuditLog"("action");

-- CreateIndex
CREATE INDEX "AdminAuditLog_entityType_idx" ON "AdminAuditLog"("entityType");

-- CreateIndex
CREATE INDEX "AdminAuditLog_entityId_idx" ON "AdminAuditLog"("entityId");

-- CreateIndex
CREATE INDEX "AdminAuditLog_createdAt_idx" ON "AdminAuditLog"("createdAt");

-- AddForeignKey
ALTER TABLE "AdminAuditLog" ADD CONSTRAINT "AdminAuditLog_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
