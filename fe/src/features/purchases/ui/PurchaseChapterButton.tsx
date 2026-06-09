"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth";
import { purchaseChapter } from "../api/purchases.api";

type PurchaseChapterButtonProps = {
  chapterId: number;
  onPurchased?: () => Promise<void> | void;
  price: number;
};

export function PurchaseChapterButton({
  chapterId,
  onPurchased,
  price,
}: PurchaseChapterButtonProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  async function handlePurchase() {
    setErrorMessage(null);
    setSuccessMessage(null);

    if (isLoading) {
      return;
    }

    if (!isAuthenticated) {
      router.push(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }

    setIsPurchasing(true);

    try {
      await purchaseChapter(chapterId);
      setSuccessMessage("Mua chương thành công");
      await onPurchased?.();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Mua chương thất bại",
      );
    } finally {
      setIsPurchasing(false);
    }
  }

  return (
    <div className="space-y-3">
      <Button
        type="button"
        disabled={isLoading || isPurchasing}
        onClick={handlePurchase}
      >
        {isPurchasing ? "Đang mua..." : `Mua chương - ${price} coin`}
      </Button>

      {successMessage ? (
        <p className="text-sm text-green-700 dark:text-green-300">
          {successMessage}
        </p>
      ) : null}

      {errorMessage ? (
        <p className="text-sm text-destructive">{errorMessage}</p>
      ) : null}
    </div>
  );
}
