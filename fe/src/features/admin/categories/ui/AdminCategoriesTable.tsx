"use client";

import { Button } from "@/components/ui/button";
import type { AdminCategory } from "../api/admin-categories.schema";

type AdminCategoriesTableProps = {
  categories: AdminCategory[];
  deletingId?: number | null;
  onDelete: (category: AdminCategory) => void;
  onEdit: (category: AdminCategory) => void;
};

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

export function AdminCategoriesTable({
  categories,
  deletingId,
  onDelete,
  onEdit,
}: AdminCategoriesTableProps) {
  if (categories.length === 0) {
    return (
      <div className="rounded-lg border p-6 text-sm text-muted-foreground">
        Chua co the loai nao.
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
              <th className="px-4 py-3 font-medium">Ten</th>
              <th className="px-4 py-3 font-medium">Slug</th>
              <th className="px-4 py-3 font-medium">So truyen</th>
              <th className="px-4 py-3 font-medium">Ngay tao</th>
              <th className="px-4 py-3 text-right font-medium">Thao tac</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category) => (
              <tr key={category.id} className="border-t">
                <td className="px-4 py-3">{category.id}</td>
                <td className="px-4 py-3 font-medium">{category.name}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  {category.slug}
                </td>
                <td className="px-4 py-3">{category._count?.comics ?? 0}</td>
                <td className="px-4 py-3">{formatDate(category.createdAt)}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(category)}
                    >
                      Sua
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      disabled={deletingId === category.id}
                      onClick={() => onDelete(category)}
                    >
                      {deletingId === category.id ? "Dang xoa..." : "Xoa"}
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
