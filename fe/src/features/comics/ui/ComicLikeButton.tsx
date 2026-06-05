"use client";

import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCompactNumber } from "@/shared/utils/format";
import {
  getComicLikeStatus,
  likeComic,
  unlikeComic,
} from "../api/comics.api";

type ComicLikeButtonProps = {
  comicId: number;
  initialLikeCount?: number;
};

export function ComicLikeButton({
  comicId,
  initialLikeCount = 0,
}: ComicLikeButtonProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [isBusy, setIsBusy] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const task = window.setTimeout(() => {
      setErrorMessage(null);
      void getComicLikeStatus(comicId)
        .then((status) => {
          setIsLiked(status.isLiked);
          setLikeCount(status.likeCount);
        })
        .catch((error) => {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "Khong kiem tra duoc luot thich",
          );
        });
    }, 0);

    return () => window.clearTimeout(task);
  }, [comicId]);

  async function handleClick() {
    setErrorMessage(null);

    setIsBusy(true);

    try {
      const status = isLiked
        ? await unlikeComic(comicId)
        : await likeComic(comicId);

      setIsLiked(status.isLiked);
      setLikeCount(status.likeCount);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Cap nhat luot thich that bai",
      );
    } finally {
      setIsBusy(false);
    }
  }

  return (
    <div className="space-y-2">
      <Button
        type="button"
        variant={isLiked ? "default" : "outline"}
        disabled={isBusy}
        onClick={handleClick}
        className="gap-2"
      >
        <Heart className={isLiked ? "h-4 w-4 fill-current" : "h-4 w-4"} />
        {isBusy ? "Dang xu ly..." : isLiked ? "Da thich" : "Thich"}
        <span className="text-xs opacity-80">
          {formatCompactNumber(likeCount)}
        </span>
      </Button>

      {errorMessage ? (
        <p className="text-sm text-destructive">{errorMessage}</p>
      ) : null}
    </div>
  );
}
