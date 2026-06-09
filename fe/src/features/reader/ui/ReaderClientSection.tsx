"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/features/auth";
import { SaveReadingProgress, getComicHistory } from "@/features/histories";
import {
  PurchaseChapterButton,
  getChapterAccess,
  type ChapterAccess,
} from "@/features/purchases";
import type { ChapterReader } from "../api/reader.schema";
import { getProtectedChapter } from "../api/protected-reader.api";
import type { ProtectedReader } from "../api/protected-reader.schema";
import { ReaderImageList } from "./ReaderImageList";

type ReaderClientSectionProps = {
  chapterNumber: string;
  initialReader: ChapterReader;
  shouldResumeFromHistory?: boolean;
  slug: string;
};

function getChapterId(reader: ChapterReader): number | null {
  return reader.chapter?.id ?? reader.id ?? null;
}

function getChapterPrice(reader: ChapterReader): number {
  return reader.chapter?.price ?? reader.price ?? 0;
}

function getComicId(reader: ChapterReader): number {
  return reader.comic.id;
}

type ResumeState = {
  hasScrolled: boolean;
  imageIndex: number | null;
  isResolved: boolean;
  key: string;
};

export function ReaderClientSection({
  chapterNumber,
  initialReader,
  shouldResumeFromHistory = false,
  slug,
}: ReaderClientSectionProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [hasImageLoadError, setHasImageLoadError] = useState(false);
  const [isLoadingProtected, setIsLoadingProtected] = useState(false);
  const [chapterAccess, setChapterAccess] = useState<ChapterAccess | null>(null);
  const [protectedReader, setProtectedReader] = useState<ProtectedReader | null>(
    null,
  );
  const [resumeState, setResumeState] = useState<ResumeState>({
    hasScrolled: false,
    imageIndex: null,
    isResolved: !shouldResumeFromHistory,
    key: "initial",
  });
  const chapterId = getChapterId(initialReader);
  const comicId = getComicId(initialReader);
  const resumeKey = `${comicId}:${chapterId ?? "none"}:${
    shouldResumeFromHistory ? "continue" : "normal"
  }`;
  const currentResumeState =
    resumeState.key === resumeKey
      ? resumeState
      : {
          hasScrolled: false,
          imageIndex: null,
          isResolved: !shouldResumeFromHistory || (!isLoading && !isAuthenticated),
          key: resumeKey,
        };
  const resumeImageIndex = currentResumeState.imageIndex;
  const isResumeResolved = currentResumeState.isResolved;
  const hasResumeScrolled = currentResumeState.hasScrolled;
  const chapterPrice = getChapterPrice(initialReader);
  const publicImages = initialReader.images;
  const currentImages = protectedReader?.images ?? publicImages;
  const protectedAccess = protectedReader?.access ?? chapterAccess;
  const isPaidLockedPublic = publicImages.length === 0 && chapterPrice > 0;
  const isEmptyFreeChapter = currentImages.length === 0 && chapterPrice <= 0;
  const hasProtectedAccess = Boolean(
    protectedAccess?.hasAccess && currentImages.length > 0,
  );
  const shouldShowPurchase = useMemo(() => {
    if (!isPaidLockedPublic || hasProtectedAccess) {
      return false;
    }

    return !protectedAccess?.hasAccess;
  }, [hasProtectedAccess, isPaidLockedPublic, protectedAccess?.hasAccess]);
  const shouldScrollToResume = Boolean(
    shouldResumeFromHistory &&
      resumeImageIndex !== null &&
      isResumeResolved &&
      !hasResumeScrolled,
  );
  const shouldPauseProgressForResume = Boolean(
    shouldResumeFromHistory &&
      isAuthenticated &&
      (!isResumeResolved || shouldScrollToResume),
  );

  const handleResumeScrolled = useCallback(() => {
    setResumeState((current) => ({
      hasScrolled: true,
      imageIndex: current.key === resumeKey ? current.imageIndex : resumeImageIndex,
      isResolved: true,
      key: resumeKey,
    }));
  }, [resumeImageIndex, resumeKey]);

  const loadProtectedReader = useCallback(async () => {
    setIsLoadingProtected(true);
    setErrorMessage(null);
    setHasImageLoadError(false);

    try {
      setProtectedReader(await getProtectedChapter(slug, chapterNumber));
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Không tải được nội dung chương",
      );
    } finally {
      setIsLoadingProtected(false);
    }
  }, [chapterNumber, slug]);

  const checkAccessAndLoadReader = useCallback(async () => {
    if (!chapterId) {
      return;
    }

    setIsLoadingProtected(true);
    setErrorMessage(null);
    setHasImageLoadError(false);

    try {
      const access = await getChapterAccess(chapterId);
      setChapterAccess(access);

      if (access.hasAccess) {
        setProtectedReader(await getProtectedChapter(slug, chapterNumber));
      }
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Không kiểm tra được quyền đọc",
      );
    } finally {
      setIsLoadingProtected(false);
    }
  }, [chapterId, chapterNumber, slug]);

  const handleProtectedImageError = useCallback(() => {
    setHasImageLoadError(true);
  }, []);

  useEffect(() => {
    if (!shouldResumeFromHistory) {
      return;
    }

    if (isLoading) {
      return;
    }

    if (!isAuthenticated || !chapterId) {
      return;
    }

    let isCancelled = false;

    const task = window.setTimeout(() => {
      void getComicHistory(comicId)
        .then((result) => {
          if (isCancelled) {
            return;
          }

          const history = result.history;
          setResumeState({
            hasScrolled: false,
            imageIndex: history?.chapter.id === chapterId ? history.imageIndex : null,
            isResolved: true,
            key: resumeKey,
          });
        })
        .catch(() => {
          if (!isCancelled) {
            setResumeState({
              hasScrolled: false,
              imageIndex: null,
              isResolved: true,
              key: resumeKey,
            });
          }
        });
    }, 0);

    return () => {
      isCancelled = true;
      window.clearTimeout(task);
    };
  }, [
    chapterId,
    comicId,
    isAuthenticated,
    isLoading,
    resumeKey,
    shouldResumeFromHistory,
  ]);

  useEffect(() => {
    if (!isPaidLockedPublic || isLoading || !isAuthenticated) {
      return;
    }

    const task = window.setTimeout(() => {
      void checkAccessAndLoadReader();
    }, 0);

    return () => window.clearTimeout(task);
  }, [checkAccessAndLoadReader, isAuthenticated, isLoading, isPaidLockedPublic]);

  if (publicImages.length > 0) {
    return (
      <>
        {shouldPauseProgressForResume ? (
          <p className="text-center text-sm text-muted-foreground">
            Đang đưa bạn tới vị trí đã đọc...
          </p>
        ) : null}
        {chapterId ? (
          <SaveReadingProgress
            chapterId={chapterId}
            comicId={comicId}
            disabled={shouldPauseProgressForResume}
            totalImages={publicImages.length}
          />
        ) : null}
        <ReaderImageList
          images={publicImages}
          onResumeScrolled={handleResumeScrolled}
          resumeImageIndex={resumeImageIndex}
          shouldScrollToResume={shouldScrollToResume}
        />
      </>
    );
  }

  if (currentImages.length > 0) {
    const currentChapterId = protectedReader?.chapter.id ?? chapterId;

    return (
      <>
        {shouldPauseProgressForResume ? (
          <p className="text-center text-sm text-muted-foreground">
            Đang đưa bạn tới vị trí đã đọc...
          </p>
        ) : null}
        {currentChapterId ? (
          <SaveReadingProgress
            chapterId={currentChapterId}
            comicId={comicId}
            disabled={shouldPauseProgressForResume}
            totalImages={currentImages.length}
          />
        ) : null}
        <ReaderImageList
          images={currentImages}
          onImageError={handleProtectedImageError}
          onReloadChapter={hasImageLoadError ? loadProtectedReader : undefined}
          onResumeScrolled={handleResumeScrolled}
          resumeImageIndex={resumeImageIndex}
          shouldScrollToResume={shouldScrollToResume}
        />
      </>
    );
  }

  if (isPaidLockedPublic) {
    return (
      <div className="mx-auto max-w-3xl rounded-xl border bg-card p-8 text-center shadow-sm">
        <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-amber-500/10 text-xl">
          $
        </div>
        <h2 className="text-lg font-semibold">Chương này cần mua để đọc</h2>
        <p className="mt-2 text-sm text-muted-foreground">Giá: {chapterPrice} coin</p>

        {isLoading ? (
          <p className="mt-4 text-sm text-muted-foreground">
            Đang kiểm tra đăng nhập...
          </p>
        ) : null}

        {isLoadingProtected ? (
          <p className="mt-4 text-sm text-muted-foreground">
            Đang kiểm tra quyền đọc...
          </p>
        ) : null}

        {shouldShowPurchase && chapterId ? (
          <div className="mt-4">
            <PurchaseChapterButton
              chapterId={chapterId}
              price={protectedAccess?.price ?? chapterPrice}
              onPurchased={loadProtectedReader}
            />
          </div>
        ) : null}

        {!isLoading && !isAuthenticated ? (
          <p className="mt-4 text-sm text-muted-foreground">
            Đăng nhập để mua và đọc chapter trả phí.
          </p>
        ) : null}

        {shouldShowPurchase && !chapterId ? (
          <p className="mt-4 text-sm text-destructive">
            Không xác định được chapter để mua.
          </p>
        ) : null}

        {errorMessage ? (
          <p className="mt-4 text-sm text-destructive">{errorMessage}</p>
        ) : null}
      </div>
    );
  }

  if (isEmptyFreeChapter) {
    return (
      <EmptyFreeChapter />
    );
  }

  return (
    <ReaderImageList
      images={currentImages}
      onResumeScrolled={handleResumeScrolled}
      resumeImageIndex={resumeImageIndex}
      shouldScrollToResume={shouldScrollToResume}
    />
  );
}

function EmptyFreeChapter() {
  return (
    <div className="mx-auto max-w-3xl rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
      Chương này chưa có ảnh.
    </div>
  );
}
