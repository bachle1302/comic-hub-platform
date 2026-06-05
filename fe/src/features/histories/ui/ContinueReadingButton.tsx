"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth";
import type { HistoryItem } from "../api/histories.schema";
import { getComicHistory } from "../api/histories.api";

type ContinueReadingButtonProps = {
  comicId: number;
  comicSlug: string;
};

export function ContinueReadingButton({
  comicId,
  comicSlug,
}: ContinueReadingButtonProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const [history, setHistory] = useState<HistoryItem | null>(null);

  useEffect(() => {
    const task = window.setTimeout(() => {
      if (!isAuthenticated) {
        setHistory(null);
        return;
      }

      void getComicHistory(comicId)
        .then((result) => setHistory(result.history))
        .catch(() => setHistory(null));
    }, 0);

    return () => window.clearTimeout(task);
  }, [comicId, isAuthenticated, isLoading]);

  if (isLoading || !isAuthenticated || !history) {
    return null;
  }

  return (
    <Button asChild variant="secondary">
      <Link
        href={`/truyen/${comicSlug}/chapter/${history.chapter.chapterNumber}?continue=1`}
      >
        Doc tiep chuong {history.chapter.chapterNumber}
      </Link>
    </Button>
  );
}
