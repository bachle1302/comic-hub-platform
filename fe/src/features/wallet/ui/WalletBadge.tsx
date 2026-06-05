"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/features/auth";
import { getWallet } from "../api/wallet.api";

export function WalletBadge() {
  const { isAuthenticated, isLoading } = useAuth();
  const [coin, setCoin] = useState<number | null>(null);

  useEffect(() => {
    if (isLoading) {
      return;
    }

    const task = window.setTimeout(() => {
      if (!isAuthenticated) {
        setCoin(null);
        return;
      }

      void getWallet()
        .then((wallet) => setCoin(wallet.coin))
        .catch(() => setCoin(null));
    }, 0);

    return () => window.clearTimeout(task);
  }, [isAuthenticated, isLoading]);

  if (isLoading || !isAuthenticated) {
    return null;
  }

  return (
    <Link
      href="/me/wallet"
      className="rounded-md border bg-muted px-2 py-1 text-xs font-medium hover:bg-muted/80"
    >
      {coin ?? 0} coin
    </Link>
  );
}
