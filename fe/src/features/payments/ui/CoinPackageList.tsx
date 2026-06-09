"use client";

import { EmptyState } from "@/shared/ui";
import type { CoinPackage } from "../api/payments.schema";
import { CoinPackageCard } from "./CoinPackageCard";

type CoinPackageListProps = {
  coinPackages: CoinPackage[];
  errorMessage?: string | null;
  isLoading?: boolean;
  pendingPackageId?: number | null;
  onSelect: (coinPackageId: number) => Promise<void> | void;
};

export function CoinPackageList({
  coinPackages,
  errorMessage = null,
  isLoading = false,
  onSelect,
  pendingPackageId = null,
}: CoinPackageListProps) {
  if (isLoading) {
    return (
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((item) => (
          <div key={item} className="h-48 animate-pulse rounded-lg bg-muted" />
        ))}
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
        {errorMessage}
      </div>
    );
  }

  if (coinPackages.length === 0) {
    return (
      <EmptyState
        title="Chưa có gói coin"
        description="Hiện chưa có gói nạp coin nào đang hoạt động."
      />
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {coinPackages.map((coinPackage) => (
        <CoinPackageCard
          key={coinPackage.id}
          coinPackage={coinPackage}
          isSubmitting={pendingPackageId === coinPackage.id}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}
