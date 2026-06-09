"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { createComment, deleteComment, updateComment } from "../api/comments.api";
import type { Comment, CommentReply } from "../api/comments.schema";
import { CommentForm } from "./CommentForm";
import { CommentLikeButton } from "./CommentLikeButton";
import { ReportCommentDialog } from "./ReportCommentDialog";

type CommentItemProps = {
  allowReply?: boolean;
  comment: Comment | CommentReply;
  currentUserId?: number | null;
  currentUserRole?: "ADMIN" | "USER" | null;
  depth?: 0 | 1;
  likedMap?: ReadonlyMap<number, boolean>;
  onDeleted: () => Promise<void> | void;
  onReplyCreated?: () => Promise<void> | void;
  onUpdated: () => Promise<void> | void;
};

function getCommentUserId(comment: Comment | CommentReply): number | null {
  return comment.userId ?? comment.user?.id ?? null;
}

export function CommentItem({
  allowReply = false,
  comment,
  currentUserId,
  currentUserRole,
  depth = 0,
  likedMap,
  onDeleted,
  onReplyCreated,
  onUpdated,
}: CommentItemProps) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const commentUserId = getCommentUserId(comment);
  const isDeleted = comment.isDeleted || Boolean(comment.deletedAt);
  const canEdit =
    !isDeleted && currentUserId !== null && currentUserId === commentUserId;
  const canDelete = canEdit || currentUserRole === "ADMIN";
  const canReply =
    !isDeleted && allowReply && depth === 0 && currentUserId !== null;
  const canReport = !isDeleted && !canEdit && currentUserRole !== "ADMIN";
  const replies = "replies" in comment ? comment.replies : [];

  async function handleUpdate(content: string) {
    setErrorMessage(null);

    try {
      await updateComment(comment.id, { content });
      setIsEditing(false);
      await onUpdated();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Cập nhật bình luận thất bại",
      );
    }
  }

  async function handleDelete() {
    if (!window.confirm("Xóa bình luận này?")) {
      return;
    }

    setErrorMessage(null);

    try {
      await deleteComment(comment.id);
      await onDeleted();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Xóa bình luận thất bại",
      );
    }
  }

  async function handleReply(content: string) {
    setErrorMessage(null);

    try {
      await createComment({
        parentId: comment.id,
        content,
      });
      setIsReplying(false);
      await onReplyCreated?.();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Trả lời bình luận thất bại",
      );
    }
  }

  return (
    <article
      className={
        depth === 0
          ? "rounded-lg border p-4"
          : "border-l-2 border-muted pl-3"
      }
    >
      <div className="flex gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted text-sm font-medium">
          {comment.user?.avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={comment.user.avatar}
              alt={comment.user.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <span>{comment.user?.name.slice(0, 1).toUpperCase() ?? "U"}</span>
          )}
        </div>

        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-medium">{comment.user?.name ?? "Người dùng"}</h3>
            <span className="text-xs text-muted-foreground">
              {new Date(comment.createdAt).toLocaleString("vi-VN", {
                dateStyle: "short",
                timeStyle: "short",
              })}
            </span>
          </div>

          {isDeleted ? (
            <p className="text-sm italic leading-6 text-muted-foreground">
              Bình luận đã bị xóa
            </p>
          ) : isEditing ? (
            <CommentForm
              initialContent={comment.content}
              submitLabel="Lưu"
              onCancel={() => setIsEditing(false)}
              onSubmit={handleUpdate}
            />
          ) : (
            <p className="whitespace-pre-line text-sm leading-6">
              {comment.content}
            </p>
          )}

          {errorMessage ? (
            <p className="text-sm text-destructive">{errorMessage}</p>
          ) : null}

          {!isEditing && !isDeleted ? (
            <div className="flex flex-wrap gap-2">
              <CommentLikeButton
                commentId={comment.id}
                initialIsLiked={likedMap?.get(comment.id) ?? false}
                initialLikeCount={comment.likeCount}
                shouldFetchInitialStatus={false}
              />
              {canReply ? (
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsReplying((current) => !current)}
                >
                  Trả lời
                </Button>
              ) : null}
              {canReport ? (
                <ReportCommentDialog commentId={comment.id} />
              ) : null}
              {canEdit ? (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => setIsEditing(true)}
                >
                  Sửa
                </Button>
              ) : null}
              {canDelete ? (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => void handleDelete()}
                >
                  Xóa
                </Button>
              ) : null}
            </div>
          ) : null}

          {isReplying ? (
            <div className="rounded-md bg-muted/40 p-3">
              <CommentForm
                submitLabel="Gửi trả lời"
                onCancel={() => setIsReplying(false)}
                onSubmit={handleReply}
              />
            </div>
          ) : null}

          {depth === 0 && replies.length > 0 ? (
            <div className="mt-4 space-y-3">
              {replies.map((reply) => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  currentUserId={currentUserId}
                  currentUserRole={currentUserRole}
                  depth={1}
                  likedMap={likedMap}
                  allowReply={false}
                  onDeleted={onDeleted}
                  onUpdated={onUpdated}
                  onReplyCreated={onReplyCreated}
                />
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </article>
  );
}
