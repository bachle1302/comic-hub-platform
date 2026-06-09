"use client";

import { Button } from "@/components/ui/button";
import type { CoinPackage } from "../api/payments.schema";

type CoinPackageCardProps = {
  coinPackage: CoinPackage;
  isSubmitting?: boolean;
  onSelect: (coinPackageId: number) => Promise<void> | void;
};

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("vi-VN", {
    currency: "VND",
    style: "currency",
  }).format(value);
}

export function CoinPackageCard({
  coinPackage,
  isSubmitting = false,
  onSelect,
}: CoinPackageCardProps) {
  const totalCoin =
    coinPackage.totalCoin ?? coinPackage.coin + coinPackage.bonusCoin;

  return (
    <article className="flex h-full flex-col rounded-lg border bg-card p-4 shadow-sm">
      <div className="flex-1 space-y-3">
        <div>
          <h3 className="text-base font-semibold">{coinPackage.name}</h3>
          <p className="text-sm text-muted-foreground">
            {formatCurrency(coinPackage.price)}
          </p>
        </div>

        <div className="rounded-md bg-muted p-3">
          <p className="text-2xl font-bold">{totalCoin} coin</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Gốc {coinPackage.coin} coin
            {coinPackage.bonusCoin > 0
              ? ` + thưởng ${coinPackage.bonusCoin} coin`
              : ""}
          </p>
        </div>
      </div>

      <Button
        type="button"
        className="mt-4 w-full"
        disabled={isSubmitting}
        onClick={() => void onSelect(coinPackage.id)}
      >
        {isSubmitting ? "Đang tạo đơn..." : "Nạp coin"}
      </Button>
    </article>
  );
}
