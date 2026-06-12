"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth";
import {
  createComment,
  getBatchCommentLikeStatus,
  getChapterComments,
  getComicComments,
} from "../api/comments.api";
import type { Comment, CommentsPaginated } from "../api/comments.schema";
import { CommentForm } from "./CommentForm";
import { CommentItem } from "./CommentItem";

type CommentSectionProps = {
  targetId: number;
  targetType: "chapter" | "comic";
};

const COMMENTS_LIMIT = 20;

function collectCommentIds(comments: Comment[]): number[] {
  return comments.flatMap((comment) => [
    comment.id,
    ...comment.replies.map((reply) => reply.id),
  ]);
}

export function CommentSection({ targetId, targetType }: CommentSectionProps) {
  const pathname = usePathname();
  const { isAuthenticated, isLoading: isAuthLoading, user } = useAuth();
  const [comments, setComments] = useState<CommentsPaginated | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [likedMap, setLikedMap] = useState<ReadonlyMap<number, boolean>>(
    new Map(),
  );
  const [page, setPage] = useState(1);
  const commentIds = useMemo(
    () => (comments ? collectCommentIds(comments.items) : []),
    [comments],
  );
  const commentIdsKey = useMemo(() => commentIds.join(","), [commentIds]);

  const loadComments = useCallback(
    async (nextPage: number) => {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const result =
          targetType === "comic"
            ? await getComicComments({
                comicId: targetId,
                limit: COMMENTS_LIMIT,
                page: nextPage,
              })
            : await getChapterComments({
                chapterId: targetId,
                limit: COMMENTS_LIMIT,
                page: nextPage,
              });

        setComments(result);
        setPage(result.meta.page);
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : "Không tải được bình luận",
        );
      } finally {
        setIsLoading(false);
      }
    },
    [targetId, targetType],
  );

  useEffect(() => {
    const task = window.setTimeout(() => {
      void loadComments(1);
    }, 0);

    return () => window.clearTimeout(task);
  }, [loadComments]);

  useEffect(() => {
    if (isAuthLoading || !isAuthenticated || commentIds.length === 0) {
      return;
    }

    let isCancelled = false;

    const task = window.setTimeout(() => {
      void getBatchCommentLikeStatus(commentIds)
        .then((result) => {
          if (isCancelled) {
            return;
          }

          setLikedMap(
            new Map(result.items.map((item) => [item.commentId, item.isLiked])),
          );
        })
        .catch(() => {
          if (!isCancelled) {
            setLikedMap(new Map());
          }
        });
    }, 0);

    return () => {
      isCancelled = true;
      window.clearTimeout(task);
    };
  }, [commentIds, commentIdsKey, isAuthenticated, isAuthLoading]);

  async function handleCreate(content: string) {
    await createComment(
      targetType === "comic"
        ? {
            comicId: targetId,
            content,
          }
        : {
            chapterId: targetId,
            content,
          },
    );
    await loadComments(1);
  }

  async function goToPage(nextPage: number) {
    await loadComments(nextPage);
  }

  return (
    <section className="dark mx-auto max-w-5xl space-y-4 rounded-lg border border-zinc-900 bg-black p-4 text-zinc-100">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-xl font-semibold">Bình luận</h2>
          <p className="text-sm text-muted-foreground">
            {comments?.meta.total ?? 0} bình luận
          </p>
        </div>
      </div>

      {isAuthLoading ? (
        <p className="text-sm text-muted-foreground">
          Đang kiểm tra đăng nhập...
        </p>
      ) : isAuthenticated ? (
        <CommentForm onSubmit={handleCreate} />
      ) : (
        <p className="text-sm text-muted-foreground">
          <Link
            href={`/login?next=${encodeURIComponent(pathname)}`}
            className="font-medium text-primary"
          >
            Đăng nhập
          </Link>{" "}
          để bình luận.
        </p>
      )}

      {errorMessage ? (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          {errorMessage}
        </div>
      ) : null}

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Đang tải bình luận...</p>
      ) : comments && comments.items.length > 0 ? (
        <div className="space-y-3">
          {comments.items.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              currentUserId={user?.id ?? null}
              currentUserRole={user?.role ?? null}
              likedMap={isAuthenticated ? likedMap : undefined}
              allowReply={isAuthenticated}
              onDeleted={() => loadComments(page)}
              onReplyCreated={() => loadComments(page)}
              onUpdated={() => loadComments(page)}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
          Chưa có bình luận nào.
        </div>
      )}

      {comments && comments.meta.totalPages > 1 ? (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={!comments.meta.hasPreviousPage || isLoading}
            onClick={() => void goToPage(page - 1)}
          >
            Trang trước
          </Button>
          <span className="text-sm text-muted-foreground">
            Trang {comments.meta.page}/{comments.meta.totalPages}
          </span>
          <Button
            type="button"
            variant="outline"
            disabled={!comments.meta.hasNextPage || isLoading}
            onClick={() => void goToPage(page + 1)}
          >
            Trang sau
          </Button>
        </div>
      ) : null}
    </section>
  );
}
