"use client";

import { Button } from "@/components/ui/button";
import type { AdminComment } from "../api/admin-comments.schema";

type AdminCommentsTableProps = {
  comments: AdminComment[];
  deletingId?: number | null;
  onDelete: (id: number) => Promise<void> | void;
};

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

function getUserLabel(comment: AdminComment): string {
  if (!comment.user) {
    return "Nguoi dung";
  }

  return comment.user.email
    ? `${comment.user.name} (${comment.user.email})`
    : comment.user.name;
}

function isDeletedComment(comment: AdminComment): boolean {
  return comment.isDeleted || Boolean(comment.deletedAt);
}

export function AdminCommentsTable({
  comments,
  deletingId,
  onDelete,
}: AdminCommentsTableProps) {
  if (comments.length === 0) {
    return (
      <div className="rounded-lg border p-6 text-sm text-muted-foreground">
        Khong co binh luan nao.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1120px] text-sm">
          <thead className="bg-muted/60 text-left">
            <tr>
              <th className="px-4 py-3 font-medium">ID</th>
              <th className="px-4 py-3 font-medium">Noi dung</th>
              <th className="px-4 py-3 font-medium">User</th>
              <th className="px-4 py-3 font-medium">Comic</th>
              <th className="px-4 py-3 font-medium">Chapter</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Ngay tao</th>
              <th className="px-4 py-3 text-right font-medium">Thao tac</th>
            </tr>
          </thead>
          <tbody>
            {comments.map((comment) => {
              const isDeleted = isDeletedComment(comment);

              return (
                <tr key={comment.id} className="border-t align-top">
                <td className="px-4 py-3">{comment.id}</td>
                <td className="max-w-md px-4 py-3">
                  <p className="line-clamp-3 whitespace-pre-line">
                    {comment.content}
                  </p>
                  {comment.parentId ? (
                    <p className="mt-1 text-xs text-muted-foreground">
                      Parent #{comment.parentId}
                    </p>
                  ) : null}
                </td>
                <td className="px-4 py-3">{getUserLabel(comment)}</td>
                <td className="px-4 py-3">
                  {comment.comic ? (
                    <span>
                      {comment.comic.name} #{comment.comic.id}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {comment.chapter ? (
                    <span>
                      Chapter {comment.chapter.chapterNumber}:{" "}
                      {comment.chapter.name} #{comment.chapter.id}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        isDeleted
                          ? "rounded-full bg-destructive/10 px-2 py-1 text-xs font-medium text-destructive"
                          : "rounded-full bg-emerald-500/10 px-2 py-1 text-xs font-medium text-emerald-700"
                      }
                    >
                      {isDeleted ? "Deleted" : "Active"}
                    </span>
                    {comment.deletedAt ? (
                      <p className="mt-2 text-xs text-muted-foreground">
                        Deleted: {formatDate(comment.deletedAt)}
                      </p>
                    ) : null}
                    {comment.deleteReason ? (
                      <p className="mt-1 max-w-xs text-xs text-muted-foreground">
                        Reason: {comment.deleteReason}
                      </p>
                    ) : null}
                  </td>
                  <td className="px-4 py-3">{formatDate(comment.createdAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end">
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        disabled={isDeleted || deletingId === comment.id}
                        onClick={() => {
                          if (window.confirm("Xoa binh luan nay?")) {
                            void onDelete(comment.id);
                          }
                        }}
                      >
                        {isDeleted
                          ? "Da xoa"
                          : deletingId === comment.id
                            ? "Dang xoa..."
                            : "Xoa"}
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
