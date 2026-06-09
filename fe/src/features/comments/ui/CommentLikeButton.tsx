"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth";
import {
  getCommentLikeStatus,
  likeComment,
  unlikeComment,
} from "../api/comments.api";

type CommentLikeButtonProps = {
  commentId: number;
  initialIsLiked?: boolean;
  initialLikeCount?: number;
  shouldFetchInitialStatus?: boolean;
};

export function CommentLikeButton({
  commentId,
  initialIsLiked = false,
  initialLikeCount = 0,
  shouldFetchInitialStatus = true,
}: CommentLikeButtonProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const [statusOverride, setStatusOverride] = useState<{
    isLiked: boolean;
    likeCount: number;
  } | null>(null);
  const [isLoadingStatus, setIsLoadingStatus] = useState(false);
  const [isMutating, setIsMutating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const displayedIsLiked = statusOverride?.isLiked ?? initialIsLiked;
  const displayedLikeCount = statusOverride?.likeCount ?? initialLikeCount;

  useEffect(() => {
    if (!shouldFetchInitialStatus || isAuthLoading || !isAuthenticated) {
      return;
    }

    let isMounted = true;

    async function loadLikeStatus() {
      setIsLoadingStatus(true);
      setErrorMessage(null);

      try {
        const status = await getCommentLikeStatus(commentId);

        if (!isMounted) {
          return;
        }

        setStatusOverride({
          isLiked: status.isLiked,
          likeCount: status.likeCount,
        });
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setErrorMessage(
          error instanceof Error ? error.message : "Không tải được trạng thái thích",
        );
      } finally {
        if (isMounted) {
          setIsLoadingStatus(false);
        }
      }
    }

    void loadLikeStatus();

    return () => {
      isMounted = false;
    };
  }, [commentId, isAuthenticated, isAuthLoading, shouldFetchInitialStatus]);

  async function handleToggleLike() {
    if (isAuthLoading || isLoadingStatus || isMutating) {
      return;
    }

    if (!isAuthenticated) {
      router.push(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }

    setIsMutating(true);
    setErrorMessage(null);

    try {
      const status = displayedIsLiked
        ? await unlikeComment(commentId)
        : await likeComment(commentId);

      setStatusOverride({
        isLiked: status.isLiked,
        likeCount: status.likeCount,
      });
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Thao tác thất bại");
    } finally {
      setIsMutating(false);
    }
  }

  return (
    <span className="inline-flex items-center gap-2">
      <Button
        type="button"
        size="sm"
        variant={isAuthenticated && displayedIsLiked ? "default" : "ghost"}
        className="h-8 gap-1 px-2 text-xs"
        disabled={isAuthLoading || isLoadingStatus || isMutating}
        onClick={() => void handleToggleLike()}
      >
        <span>{isAuthenticated && displayedIsLiked ? "Đã thích" : "Thích"}</span>
        <span>{displayedLikeCount}</span>
      </Button>
      {errorMessage ? (
        <span className="text-xs text-destructive">{errorMessage}</span>
      ) : null}
    </span>
  );
}
