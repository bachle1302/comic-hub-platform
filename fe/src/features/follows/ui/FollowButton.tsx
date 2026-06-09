"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth";
import {
  followComic,
  getFollowStatus,
  unfollowComic,
} from "../api/follows.api";

type FollowButtonProps = {
  comicId: number;
};

export function FollowButton({ comicId }: FollowButtonProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const [isFollowing, setIsFollowing] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const displayIsFollowing = isAuthenticated && isFollowing;

  useEffect(() => {
    if (isLoading) {
      return;
    }

    const task = window.setTimeout(() => {
      if (!isAuthenticated) {
        setIsFollowing(false);
        return;
      }

      setErrorMessage(null);
      void getFollowStatus(comicId)
        .then((status) => setIsFollowing(status.isFollowing))
        .catch((error) => {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "Không kiểm tra được theo dõi",
          );
        });
    }, 0);

    return () => window.clearTimeout(task);
  }, [comicId, isAuthenticated, isLoading]);

  async function handleClick() {
    setErrorMessage(null);

    if (isLoading) {
      return;
    }

    if (!isAuthenticated) {
      router.push(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }

    setIsBusy(true);

    try {
      if (displayIsFollowing) {
        await unfollowComic(comicId);
        setIsFollowing(false);
      } else {
        await followComic(comicId);
        setIsFollowing(true);
      }
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Cập nhật theo dõi thất bại",
      );
    } finally {
      setIsBusy(false);
    }
  }

  return (
    <div className="space-y-2">
      <Button
        type="button"
        variant={displayIsFollowing ? "outline" : "default"}
        disabled={isLoading || isBusy}
        onClick={handleClick}
      >
        {isLoading
          ? "Đang kiểm tra..."
          : isBusy
            ? "Đang xử lý..."
            : displayIsFollowing
              ? "Bỏ theo dõi"
              : "Theo dõi"}
      </Button>

      {errorMessage ? (
        <p className="text-sm text-destructive">{errorMessage}</p>
      ) : null}
    </div>
  );
}
