CREATE TYPE "ContactTicketType" AS ENUM ('TECHNICAL', 'PAYMENT', 'COPYRIGHT', 'ACCOUNT', 'OTHER');

CREATE TYPE "ContactTicketStatus" AS ENUM ('NEW', 'IN_PROGRESS', 'RESOLVED', 'CLOSED');

ALTER TYPE "AdminAuditAction" ADD VALUE IF NOT EXISTS 'UPDATE_CONTACT_TICKET';

CREATE TABLE "ContactTicket" (
  "id" SERIAL NOT NULL,
  "userId" INTEGER,
  "type" "ContactTicketType" NOT NULL,
  "status" "ContactTicketStatus" NOT NULL DEFAULT 'NEW',
  "name" VARCHAR(100),
  "email" TEXT NOT NULL,
  "subject" VARCHAR(200) NOT NULL,
  "message" TEXT NOT NULL,
  "relatedUrl" VARCHAR(500),
  "orderCode" VARCHAR(100),
  "adminNote" TEXT,
  "ipHash" VARCHAR(128),
  "userAgent" VARCHAR(500),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "resolvedAt" TIMESTAMP(3),
  "closedAt" TIMESTAMP(3),

  CONSTRAINT "ContactTicket_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "ContactTicket"
  ADD CONSTRAINT "ContactTicket_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "ContactTicket_userId_idx" ON "ContactTicket"("userId");
CREATE INDEX "ContactTicket_type_idx" ON "ContactTicket"("type");
CREATE INDEX "ContactTicket_status_idx" ON "ContactTicket"("status");
CREATE INDEX "ContactTicket_email_idx" ON "ContactTicket"("email");
CREATE INDEX "ContactTicket_createdAt_idx" ON "ContactTicket"("createdAt");
