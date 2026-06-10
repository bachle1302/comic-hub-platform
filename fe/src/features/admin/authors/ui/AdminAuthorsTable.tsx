"use client";

import { Button } from "@/components/ui/button";
import type { AdminAuthor } from "../api/admin-authors.schema";

type AdminAuthorsTableProps = {
  authors: AdminAuthor[];
  deletingId?: number | null;
  onDelete: (author: AdminAuthor) => void;
  onEdit: (author: AdminAuthor) => void;
};

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

export function AdminAuthorsTable({
  authors,
  deletingId,
  onDelete,
  onEdit,
}: AdminAuthorsTableProps) {
  if (authors.length === 0) {
    return (
      <div className="rounded-lg border p-6 text-sm text-muted-foreground">
        Chưa có tác giả nào.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-sm">
          <thead className="bg-muted/60 text-left">
            <tr>
              <th className="px-4 py-3 font-medium">ID</th>
              <th className="px-4 py-3 font-medium">Tên</th>
              <th className="px-4 py-3 font-medium">Slug</th>
              <th className="px-4 py-3 font-medium">Số truyện</th>
              <th className="px-4 py-3 font-medium">Ngày tạo</th>
              <th className="px-4 py-3 text-right font-medium">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {authors.map((author) => (
              <tr key={author.id} className="border-t">
                <td className="px-4 py-3">{author.id}</td>
                <td className="px-4 py-3 font-medium">{author.name}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  {author.slug}
                </td>
                <td className="px-4 py-3">{author._count?.comics ?? 0}</td>
                <td className="px-4 py-3">{formatDate(author.createdAt)}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(author)}
                    >
                      Sửa
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      disabled={deletingId === author.id}
                      onClick={() => onDelete(author)}
                    >
                      {deletingId === author.id ? "Đang xóa..." : "Xóa"}
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
