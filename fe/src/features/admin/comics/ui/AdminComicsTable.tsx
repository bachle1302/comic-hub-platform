"use client";

import { Button } from "@/components/ui/button";
import type { AdminComic } from "../api/admin-comics.schema";

type AdminComicsTableProps = {
  comics: AdminComic[];
  deletingId?: number | null;
  onDelete: (comic: AdminComic) => void;
  onEdit: (comic: AdminComic) => void;
};

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

function getChapterCount(comic: AdminComic): number {
  return comic.chapterCount ?? comic._count?.chapters ?? 0;
}

function isDeletedComic(comic: AdminComic): boolean {
  return comic.isDeleted || Boolean(comic.deletedAt);
}

export function AdminComicsTable({
  comics,
  deletingId,
  onDelete,
  onEdit,
}: AdminComicsTableProps) {
  if (comics.length === 0) {
    return (
      <div className="rounded-lg border p-6 text-sm text-muted-foreground">
        Chua co truyen nao.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1100px] text-sm">
          <thead className="bg-muted/60 text-left">
            <tr>
              <th className="px-4 py-3 font-medium">Anh</th>
              <th className="px-4 py-3 font-medium">ID</th>
              <th className="px-4 py-3 font-medium">Ten</th>
              <th className="px-4 py-3 font-medium">Slug</th>
              <th className="px-4 py-3 font-medium">Tac gia</th>
              <th className="px-4 py-3 font-medium">The loai</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Delete</th>
              <th className="px-4 py-3 font-medium">Public</th>
              <th className="px-4 py-3 font-medium">Chapters</th>
              <th className="px-4 py-3 font-medium">Views</th>
              <th className="px-4 py-3 font-medium">Ngay tao</th>
              <th className="px-4 py-3 text-right font-medium">Thao tac</th>
            </tr>
          </thead>
          <tbody>
            {comics.map((comic) => {
              const isDeleted = isDeletedComic(comic);

              return (
              <tr key={comic.id} className="border-t align-top">
                <td className="px-4 py-3">
                  {comic.thumbnail ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={comic.thumbnail}
                      alt={comic.name}
                      className="h-16 w-11 rounded border object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-16 w-11 items-center justify-center rounded border bg-muted text-xs text-muted-foreground">
                      N/A
                    </div>
                  )}
                </td>
                <td className="px-4 py-3">{comic.id}</td>
                <td className="max-w-56 px-4 py-3 font-medium">
                  <span className="line-clamp-2">{comic.name}</span>
                </td>
                <td className="max-w-48 px-4 py-3 text-muted-foreground">
                  <span className="line-clamp-2">{comic.slug}</span>
                </td>
                <td className="px-4 py-3">{comic.author?.name ?? "-"}</td>
                <td className="max-w-64 px-4 py-3">
                  <span className="line-clamp-2 text-muted-foreground">
                    {comic.categories
                      ?.map((item) => item.category.name)
                      .join(", ") || "-"}
                  </span>
                </td>
                <td className="px-4 py-3">{comic.status}</td>
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
                  {comic.deletedAt ? (
                    <p className="mt-2 text-xs text-muted-foreground">
                      Deleted: {formatDate(comic.deletedAt)}
                    </p>
                  ) : null}
                  {comic.deleteReason ? (
                    <p className="mt-1 max-w-xs text-xs text-muted-foreground">
                      Reason: {comic.deleteReason}
                    </p>
                  ) : null}
                </td>
                <td className="px-4 py-3">{comic.isPublic ? "Yes" : "No"}</td>
                <td className="px-4 py-3">{getChapterCount(comic)}</td>
                <td className="px-4 py-3">{comic.viewTotal}</td>
                <td className="px-4 py-3">{formatDate(comic.createdAt)}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={isDeleted}
                      onClick={() => onEdit(comic)}
                    >
                      Sua
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      disabled={isDeleted || deletingId === comic.id}
                      onClick={() => onDelete(comic)}
                    >
                      {isDeleted
                        ? "Da xoa"
                        : deletingId === comic.id
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
