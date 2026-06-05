CREATE TYPE "PaymentOrderStatus" AS ENUM ('PENDING', 'PAID', 'CANCELLED', 'EXPIRED', 'FAILED');

CREATE TYPE "PaymentProvider" AS ENUM ('PAYOS');

CREATE TABLE "CoinPackage" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "coin" INTEGER NOT NULL,
    "price" INTEGER NOT NULL,
    "bonusCoin" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CoinPackage_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PaymentOrder" (
    "id" SERIAL NOT NULL,
    "orderCode" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "coinPackageId" INTEGER,
    "provider" "PaymentProvider" NOT NULL,
    "status" "PaymentOrderStatus" NOT NULL DEFAULT 'PENDING',
    "amount" INTEGER NOT NULL,
    "coin" INTEGER NOT NULL,
    "bonusCoin" INTEGER NOT NULL DEFAULT 0,
    "totalCoin" INTEGER NOT NULL,
    "checkoutUrl" TEXT,
    "paymentLinkId" TEXT,
    "providerPayload" JSONB,
    "paidAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "expiredAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaymentOrder_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "PaymentOrder_orderCode_key" ON "PaymentOrder"("orderCode");
CREATE INDEX "CoinPackage_isActive_idx" ON "CoinPackage"("isActive");
CREATE INDEX "CoinPackage_sortOrder_idx" ON "CoinPackage"("sortOrder");
CREATE INDEX "CoinPackage_price_idx" ON "CoinPackage"("price");
CREATE INDEX "PaymentOrder_userId_idx" ON "PaymentOrder"("userId");
CREATE INDEX "PaymentOrder_status_idx" ON "PaymentOrder"("status");
CREATE INDEX "PaymentOrder_provider_idx" ON "PaymentOrder"("provider");
CREATE INDEX "PaymentOrder_createdAt_idx" ON "PaymentOrder"("createdAt");

ALTER TABLE "PaymentOrder" ADD CONSTRAINT "PaymentOrder_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PaymentOrder" ADD CONSTRAINT "PaymentOrder_coinPackageId_fkey" FOREIGN KEY ("coinPackageId") REFERENCES "CoinPackage"("id") ON DELETE SET NULL ON UPDATE CASCADE;
