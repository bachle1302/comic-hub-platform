"use client";

import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import type { AdminCoinPackagesQuery } from "../api/admin-coin-packages.schema";

type AdminCoinPackagesFilterProps = {
  initialQuery?: AdminCoinPackagesQuery;
  onChange: (query: AdminCoinPackagesQuery) => void;
};

function parseLimit(value: string): number {
  const parsed = Number(value);

  return Number.isFinite(parsed) && parsed > 0 ? Math.trunc(parsed) : 20;
}

function parseActive(value: string): boolean | undefined {
  if (value === "true") {
    return true;
  }

  if (value === "false") {
    return false;
  }

  return undefined;
}

export function AdminCoinPackagesFilter({
  initialQuery,
  onChange,
}: AdminCoinPackagesFilterProps) {
  const [q, setQ] = useState(initialQuery?.q ?? "");
  const [isActive, setIsActive] = useState(
    initialQuery?.isActive === undefined ? "" : String(initialQuery.isActive),
  );
  const [limit, setLimit] = useState(String(initialQuery?.limit ?? 20));

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    onChange({
      page: 1,
      limit: parseLimit(limit),
      q: q.trim() || undefined,
      isActive: parseActive(isActive),
    });
  }

  function handleClear() {
    setQ("");
    setIsActive("");
    setLimit("20");
    onChange({
      page: 1,
      limit: 20,
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="grid gap-3 rounded-lg border bg-card p-4 md:grid-cols-[minmax(0,1fr)_160px_120px_auto]"
    >
      <label className="space-y-2 text-sm">
        <span className="font-medium">Tìm kiếm</span>
        <input
          type="search"
          value={q}
          onChange={(event) => setQ(event.target.value)}
          className="h-10 w-full rounded-md border bg-background px-3 outline-none focus:border-primary"
          placeholder="Tên gói coin"
        />
      </label>

      <label className="space-y-2 text-sm">
        <span className="font-medium">Trạng thái</span>
        <select
          value={isActive}
          onChange={(event) => setIsActive(event.target.value)}
          className="h-10 w-full rounded-md border bg-background px-3 outline-none focus:border-primary"
        >
          <option value="">Tất cả</option>
          <option value="true">Hoạt động</option>
          <option value="false">Ngừng hoạt động</option>
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
          <option value="100">100</option>
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
