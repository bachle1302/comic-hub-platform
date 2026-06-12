"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useMemo, useState, useRef } from "react";
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

type LazyImageProps = {
  image: ChapterImage;
  index: number;
  priority: boolean;
  onImageError?: () => void;
};

const READER_IMAGE_MAX_WIDTH = 820;

function LazyImage({ image, index, priority, onImageError }: LazyImageProps) {
  const [isIntersecting, setIsIntersecting] = useState(priority);
  const ref = useRef<HTMLDivElement>(null);

  if (priority && !isIntersecting) {
    setIsIntersecting(true);
  }

  useEffect(() => {
    if (priority) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsIntersecting(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: "800px 0px 800px 0px", // Preload ahead by 800px (approx. 1-1.5 screens)
      }
    );

    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      observer.disconnect();
    };
  }, [priority]);

  // Use natural aspect ratio if available to prevent layout shift
  const aspectRatioStyle =
    image.width && image.height
      ? { aspectRatio: `${image.width} / ${image.height}` }
      : { minHeight: "500px" };

  return (
    <div
      ref={ref}
      id={`page-${index}`}
      className="w-full bg-muted/10 flex items-center justify-center overflow-hidden"
      style={{
        ...aspectRatioStyle,
        maxWidth: image.width
          ? `${Math.min(image.width, READER_IMAGE_MAX_WIDTH)}px`
          : `${READER_IMAGE_MAX_WIDTH}px`,
      }}
    >
      {isIntersecting ? (
        <img
          src={image.url}
          alt={`Page ${image.order}`}
          width={image.width ?? undefined}
          height={image.height ?? undefined}
          onError={onImageError}
          className="block w-full h-auto object-contain transition-opacity duration-300"
        />
      ) : (
        <div className="text-xs text-muted-foreground/30 animate-pulse py-20">
          Đang tải trang {image.order}...
        </div>
      )}
    </div>
  );
}

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
      <div className="mx-auto flex w-full max-w-[1200px] flex-col items-center gap-0">
        {sortedImages.map((image, index) => {
          const priority = index < 2 || index === resumeImageIndex;
          return (
            <LazyImage
              key={`${image.id ?? image.order}-${image.url}`}
              image={image}
              index={index}
              priority={priority}
              onImageError={onImageError}
            />
          );
        })}
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
