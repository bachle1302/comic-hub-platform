"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "@/features/auth";
import { saveHistory } from "../api/histories.api";

const SAVE_INTERVAL_MS = 10000;
const MIN_PROGRESS_DELTA = 0.1;
const IMAGE_CHANGE_SAVE_DELAY_MS = 700;

type SaveReadingProgressProps = {
  chapterId: number;
  comicId: number;
  disabled?: boolean;
  totalImages: number;
};

type ReadingProgressSnapshot = {
  imageIndex: number;
  progress: number;
};

export function SaveReadingProgress({
  chapterId,
  comicId,
  disabled = false,
  totalImages,
}: SaveReadingProgressProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const lastSavedAtRef = useRef(0);
  const lastSavedImageIndexRef = useRef(-1);
  const lastProgressRef = useRef(0);
  const pendingProgressRef = useRef<ReadingProgressSnapshot | null>(null);
  const isSavingRef = useRef(false);
  const hasPendingChangeRef = useRef(false);
  const frameIdRef = useRef<number | null>(null);
  const imageChangeTimeoutRef = useRef<number | null>(null);
  const hasUserScrolledRef = useRef(false);

  useEffect(() => {
    if (disabled || isLoading || !isAuthenticated || totalImages <= 0) {
      return;
    }

    lastSavedAtRef.current = 0;
    lastSavedImageIndexRef.current = -1;
    lastProgressRef.current = 0;
    pendingProgressRef.current = null;
    isSavingRef.current = false;
    hasPendingChangeRef.current = false;
    frameIdRef.current = null;
    imageChangeTimeoutRef.current = null;
    hasUserScrolledRef.current = false;

    function calculateProgress(): ReadingProgressSnapshot {
      const scrollableHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const rawProgress =
        scrollableHeight <= 0 ? 1 : window.scrollY / scrollableHeight;
      const progress = Math.min(Math.max(rawProgress, 0), 1);
      const imageIndex = Math.min(
        Math.max(Math.floor(progress * totalImages), 0),
        Math.max(totalImages - 1, 0),
      );

      return {
        imageIndex,
        progress,
      };
    }

    function hasProgressChange(snapshot: ReadingProgressSnapshot) {
      return (
        Math.abs(snapshot.progress - lastProgressRef.current) >= MIN_PROGRESS_DELTA
      );
    }

    function isSameSnapshot(
      left: ReadingProgressSnapshot | null,
      right: ReadingProgressSnapshot,
    ) {
      return (
        left?.imageIndex === right.imageIndex && left.progress === right.progress
      );
    }

    function saveProgressNow(snapshot: ReadingProgressSnapshot) {
      pendingProgressRef.current = snapshot;
      hasPendingChangeRef.current = true;

      isSavingRef.current = true;

      void saveHistory({
        comicId,
        chapterId,
        imageIndex: snapshot.imageIndex,
        progress: snapshot.progress,
      })
        .then(() => {
          lastSavedAtRef.current = Date.now();
          lastSavedImageIndexRef.current = snapshot.imageIndex;
          lastProgressRef.current = snapshot.progress;

          if (isSameSnapshot(pendingProgressRef.current, snapshot)) {
            pendingProgressRef.current = null;
            hasPendingChangeRef.current = false;
          }
        })
        .catch(() => undefined)
        .finally(() => {
          isSavingRef.current = false;
        });
    }

    function scheduleImageChangeSave(snapshot: ReadingProgressSnapshot) {
      pendingProgressRef.current = snapshot;
      hasPendingChangeRef.current = true;

      if (imageChangeTimeoutRef.current !== null) {
        window.clearTimeout(imageChangeTimeoutRef.current);
      }

      imageChangeTimeoutRef.current = window.setTimeout(() => {
        imageChangeTimeoutRef.current = null;

        if (!pendingProgressRef.current || isSavingRef.current) {
          return;
        }

        saveProgressNow(pendingProgressRef.current);
      }, IMAGE_CHANGE_SAVE_DELAY_MS);
    }

    function trySaveProgress(force = false) {
      const snapshot = force
        ? pendingProgressRef.current ?? calculateProgress()
        : calculateProgress();

      if (!snapshot || !hasUserScrolledRef.current) {
        return;
      }

      const isImageChange =
        snapshot.imageIndex !== lastSavedImageIndexRef.current;

      if (isSavingRef.current) {
        pendingProgressRef.current = snapshot;
        hasPendingChangeRef.current = true;
        return;
      }

      if (force) {
        if (isImageChange || hasProgressChange(snapshot)) {
          saveProgressNow(snapshot);
        }
        return;
      }

      if (isImageChange) {
        scheduleImageChangeSave(snapshot);
        return;
      }

      const now = Date.now();
      const shouldSaveProgressOnly =
        hasProgressChange(snapshot) &&
        now - lastSavedAtRef.current >= SAVE_INTERVAL_MS;

      if (!shouldSaveProgressOnly) {
        return;
      }

      saveProgressNow(snapshot);
    }

    function scheduleProgressCheck() {
      if (frameIdRef.current !== null) {
        return;
      }

      frameIdRef.current = window.requestAnimationFrame(() => {
        frameIdRef.current = null;
        trySaveProgress(false);
      });
    }

    const handleScroll = () => {
      hasUserScrolledRef.current = true;
      scheduleProgressCheck();
    };
    const handleBeforeUnload = () => {
      if (hasPendingChangeRef.current) {
        trySaveProgress(true);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      if (frameIdRef.current !== null) {
        window.cancelAnimationFrame(frameIdRef.current);
        frameIdRef.current = null;
      }

      if (imageChangeTimeoutRef.current !== null) {
        window.clearTimeout(imageChangeTimeoutRef.current);
        imageChangeTimeoutRef.current = null;
      }

      if (hasPendingChangeRef.current) {
        trySaveProgress(true);
      }

      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [chapterId, comicId, disabled, isAuthenticated, isLoading, totalImages]);

  return null;
}
