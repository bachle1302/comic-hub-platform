"use client";

import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import type { AdminCommentsQuery } from "../api/admin-comments.schema";

type AdminCommentsFilterProps = {
  initialQuery?: AdminCommentsQuery;
  onChange: (query: AdminCommentsQuery) => void;
};

function numberToInputValue(value?: number): string {
  return value === undefined ? "" : String(value);
}

function parseOptionalNumber(value: string): number | undefined {
  if (!value.trim()) {
    return undefined;
  }

  const parsed = Number(value);

  return Number.isFinite(parsed) && parsed > 0 ? Math.trunc(parsed) : undefined;
}

export function AdminCommentsFilter({
  initialQuery,
  onChange,
}: AdminCommentsFilterProps) {
  const [comicId, setComicId] = useState(numberToInputValue(initialQuery?.comicId));
  const [chapterId, setChapterId] = useState(
    numberToInputValue(initialQuery?.chapterId),
  );
  const [deleted, setDeleted] = useState<NonNullable<AdminCommentsQuery["deleted"]>>(
    initialQuery?.deleted ?? "active",
  );
  const [limit, setLimit] = useState(String(initialQuery?.limit ?? 20));

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    onChange({
      chapterId: parseOptionalNumber(chapterId),
      comicId: parseOptionalNumber(comicId),
      deleted: deleted === "active" ? undefined : deleted,
      limit: parseOptionalNumber(limit) ?? 20,
      page: 1,
    });
  }

  function handleClear() {
    setComicId("");
    setChapterId("");
    setDeleted("active");
    setLimit("20");
    onChange({
      limit: 20,
      page: 1,
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="grid gap-3 rounded-lg border p-4 md:grid-cols-[1fr_1fr_160px_160px_auto]"
    >
      <label className="space-y-2 text-sm">
        <span className="font-medium">ID truyện</span>
        <input
          type="number"
          min={1}
          value={comicId}
          onChange={(event) => setComicId(event.target.value)}
          className="h-10 w-full rounded-md border bg-background px-3 outline-none focus:border-primary"
          placeholder="VD: 1"
        />
      </label>

      <label className="space-y-2 text-sm">
        <span className="font-medium">ID chương</span>
        <input
          type="number"
          min={1}
          value={chapterId}
          onChange={(event) => setChapterId(event.target.value)}
          className="h-10 w-full rounded-md border bg-background px-3 outline-none focus:border-primary"
          placeholder="VD: 10"
        />
      </label>

      <label className="space-y-2 text-sm">
        <span className="font-medium">Trạng thái</span>
        <select
          value={deleted}
          onChange={(event) =>
            setDeleted(event.target.value as "active" | "deleted" | "all")
          }
          className="h-10 w-full rounded-md border bg-background px-3 outline-none focus:border-primary"
        >
          <option value="active">Hoạt động</option>
          <option value="deleted">Đã xóa</option>
          <option value="all">Tất cả</option>
        </select>
      </label>

      <label className="space-y-2 text-sm">
        <span className="font-medium">Số dòng hiển thị</span>
        <select
          value={limit}
          onChange={(event) => setLimit(event.target.value)}
          className="h-10 w-full rounded-md border bg-background px-3 outline-none focus:border-primary"
        >
          <option value="10">10</option>
          <option value="20">20</option>
          <option value="50">50</option>
        </select>
      </label>

      <div className="flex items-end gap-2">
        <Button type="submit">Lọc</Button>
        <Button type="button" variant="outline" onClick={handleClear}>
          Xóa lọc
        </Button>
      </div>
    </form>
  );
}
