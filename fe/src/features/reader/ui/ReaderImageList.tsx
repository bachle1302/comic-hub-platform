"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useMemo } from "react";
import { EmptyState } from "@/shared/ui";
import type { ChapterImage } from "@/features/comics";

type ReaderImageListProps = {
  images: ChapterImage[];
  onImageError?: () => void;
  onReloadChapter?: () => Promise<void> | void;
  onResumeScrolled?: () => void;
  resumeImageIndex?: number | null;
  shouldScrollToResume?: boolean;
};

export function ReaderImageList({
  images,
  onImageError,
  onReloadChapter,
  onResumeScrolled,
  resumeImageIndex = null,
  shouldScrollToResume = false,
}: ReaderImageListProps) {
  const sortedImages = useMemo(
    () => [...images].sort((left, right) => left.order - right.order),
    [images],
  );

  useEffect(() => {
    if (
      !shouldScrollToResume ||
      resumeImageIndex === null ||
      sortedImages.length === 0
    ) {
      return;
    }

    const targetIndex = Math.min(
      Math.max(resumeImageIndex, 0),
      sortedImages.length - 1,
    );
    const timeoutId = window.setTimeout(() => {
      document.getElementById(`page-${targetIndex}`)?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
      onResumeScrolled?.();
    }, 300);

    return () => window.clearTimeout(timeoutId);
  }, [
    onResumeScrolled,
    resumeImageIndex,
    shouldScrollToResume,
    sortedImages.length,
  ]);

  if (sortedImages.length === 0) {
    return (
      <EmptyState
        title="Chuong nay chua co anh"
        description="Vui long quay lai sau khi admin cap nhat noi dung."
      />
    );
  }

  return (
    <>
      <div className="mx-auto flex w-full max-w-[1200px] flex-col items-center gap-1 md:gap-2">
        {sortedImages.map((image, index) => (
          <img
            key={`${image.id ?? image.order}-${image.url}`}
            id={`page-${index}`}
            src={image.url}
            alt={`Page ${image.order}`}
            width={image.width ?? undefined}
            height={image.height ?? undefined}
            loading="lazy"
            onError={onImageError}
            className="w-full max-w-[960px] object-contain"
            style={{
              height: "auto",
              maxWidth: image.width ? `${image.width}px` : undefined,
            }}
          />
        ))}
      </div>
      {onReloadChapter ? (
        <div className="mx-auto mt-3 max-w-[1200px] rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-center text-sm text-amber-900 dark:text-amber-100">
          <p>Anh khong tai duoc hoac link da het han. Vui long tai lai chuong.</p>
          <button
            type="button"
            onClick={() => {
              void onReloadChapter();
            }}
            className="mt-3 rounded-md border border-amber-500/40 bg-background px-4 py-2 text-sm font-medium text-foreground shadow-sm hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Tai lai chuong
          </button>
        </div>
      ) : null}
    </>
  );
}
