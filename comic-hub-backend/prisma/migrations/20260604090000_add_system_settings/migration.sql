-- CreateEnum
CREATE TYPE "SystemSettingValueType" AS ENUM ('STRING', 'NUMBER', 'BOOLEAN', 'JSON');

-- AlterEnum
ALTER TYPE "AdminAuditAction" ADD VALUE 'UPDATE_SYSTEM_SETTING';

-- CreateTable
CREATE TABLE "SystemSetting" (
    "id" SERIAL NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "valueType" "SystemSettingValueType" NOT NULL DEFAULT 'STRING',
    "group" TEXT NOT NULL DEFAULT 'general',
    "label" TEXT,
    "description" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SystemSetting_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SystemSetting_key_key" ON "SystemSetting"("key");

-- CreateIndex
CREATE INDEX "SystemSetting_group_idx" ON "SystemSetting"("group");

-- CreateIndex
CREATE INDEX "SystemSetting_isPublic_idx" ON "SystemSetting"("isPublic");

