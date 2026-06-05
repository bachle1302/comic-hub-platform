"use client";

import { Button } from "@/components/ui/button";
import type { AdminChapter } from "../api/admin-chapters.schema";

type AdminChaptersTableProps = {
  chapters: AdminChapter[];
  deletingId?: number | null;
  onDelete: (chapter: AdminChapter) => void;
  onEdit: (chapter: AdminChapter) => void;
};

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

function getImageCount(chapter: AdminChapter): number {
  return chapter._count?.images ?? chapter.images?.length ?? 0;
}

function isDeletedChapter(chapter: AdminChapter): boolean {
  return chapter.isDeleted || Boolean(chapter.deletedAt);
}

export function AdminChaptersTable({
  chapters,
  deletingId,
  onDelete,
  onEdit,
}: AdminChaptersTableProps) {
  if (chapters.length === 0) {
    return (
      <div className="rounded-lg border p-6 text-sm text-muted-foreground">
        Chua co chapter nao cho truyen nay.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[860px] text-sm">
          <thead className="bg-muted/60 text-left">
            <tr>
              <th className="px-4 py-3 font-medium">ID</th>
              <th className="px-4 py-3 font-medium">Ten</th>
              <th className="px-4 py-3 font-medium">Chapter</th>
              <th className="px-4 py-3 font-medium">Gia</th>
              <th className="px-4 py-3 font-medium">Public</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Anh</th>
              <th className="px-4 py-3 font-medium">Views</th>
              <th className="px-4 py-3 font-medium">Ngay tao</th>
              <th className="px-4 py-3 text-right font-medium">Thao tac</th>
            </tr>
          </thead>
          <tbody>
            {chapters.map((chapter) => {
              const isDeleted = isDeletedChapter(chapter);

              return (
              <tr key={chapter.id} className="border-t">
                <td className="px-4 py-3">{chapter.id}</td>
                <td className="px-4 py-3 font-medium">{chapter.name}</td>
                <td className="px-4 py-3">{chapter.chapterNumber}</td>
                <td className="px-4 py-3">{chapter.price}</td>
                <td className="px-4 py-3">
                  {chapter.isPublic ? "Yes" : "No"}
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
                  {chapter.deletedAt ? (
                    <p className="mt-2 text-xs text-muted-foreground">
                      Deleted: {formatDate(chapter.deletedAt)}
                    </p>
                  ) : null}
                  {chapter.deleteReason ? (
                    <p className="mt-1 max-w-xs text-xs text-muted-foreground">
                      Reason: {chapter.deleteReason}
                    </p>
                  ) : null}
                </td>
                <td className="px-4 py-3">{getImageCount(chapter)}</td>
                <td className="px-4 py-3">{chapter.viewTotal}</td>
                <td className="px-4 py-3">{formatDate(chapter.createdAt)}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={isDeleted}
                      onClick={() => onEdit(chapter)}
                    >
                      Sua
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      disabled={isDeleted || deletingId === chapter.id}
                      onClick={() => onDelete(chapter)}
                    >
                      {isDeleted
                        ? "Da xoa"
                        : deletingId === chapter.id
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
