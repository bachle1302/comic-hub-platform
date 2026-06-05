"use client";

import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import type { AdminAnnouncementsQuery } from "../api/announcements.schema";

type AdminAnnouncementsFilterProps = {
  initialQuery?: AdminAnnouncementsQuery;
  onChange: (query: AdminAnnouncementsQuery) => void;
};

function parseLimit(value: string): number {
  const parsed = Number(value);

  return Number.isFinite(parsed) && parsed > 0 ? Math.trunc(parsed) : 20;
}

function parseIsActive(value: string): boolean | undefined {
  if (value === "true") {
    return true;
  }

  if (value === "false") {
    return false;
  }

  return undefined;
}

export function AdminAnnouncementsFilter({
  initialQuery,
  onChange,
}: AdminAnnouncementsFilterProps) {
  const [q, setQ] = useState(initialQuery?.q ?? "");
  const [type, setType] = useState(initialQuery?.type ?? "");
  const [target, setTarget] = useState(initialQuery?.target ?? "");
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
      type:
        type === "INFO" ||
        type === "SUCCESS" ||
        type === "WARNING" ||
        type === "DANGER" ||
        type === "PROMOTION"
          ? type
          : undefined,
      target:
        target === "ALL" || target === "AUTHENTICATED" || target === "GUEST"
          ? target
          : undefined,
      isActive: parseIsActive(isActive),
    });
  }

  function handleClear() {
    setQ("");
    setType("");
    setTarget("");
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
      className="grid gap-3 rounded-lg border bg-card p-4 md:grid-cols-[minmax(0,1fr)_150px_170px_150px_110px_auto]"
    >
      <label className="space-y-2 text-sm">
        <span className="font-medium">Tim kiem</span>
        <input
          type="search"
          value={q}
          onChange={(event) => setQ(event.target.value)}
          className="h-10 w-full rounded-md border bg-background px-3 outline-none focus:border-primary"
          placeholder="Title hoac message"
        />
      </label>

      <label className="space-y-2 text-sm">
        <span className="font-medium">Type</span>
        <select
          value={type}
          onChange={(event) => setType(event.target.value)}
          className="h-10 w-full rounded-md border bg-background px-3 outline-none focus:border-primary"
        >
          <option value="">Tat ca</option>
          <option value="INFO">INFO</option>
          <option value="SUCCESS">SUCCESS</option>
          <option value="WARNING">WARNING</option>
          <option value="DANGER">DANGER</option>
          <option value="PROMOTION">PROMOTION</option>
        </select>
      </label>

      <label className="space-y-2 text-sm">
        <span className="font-medium">Target</span>
        <select
          value={target}
          onChange={(event) => setTarget(event.target.value)}
          className="h-10 w-full rounded-md border bg-background px-3 outline-none focus:border-primary"
        >
          <option value="">Tat ca</option>
          <option value="ALL">ALL</option>
          <option value="AUTHENTICATED">AUTHENTICATED</option>
          <option value="GUEST">GUEST</option>
        </select>
      </label>

      <label className="space-y-2 text-sm">
        <span className="font-medium">Trang thai</span>
        <select
          value={isActive}
          onChange={(event) => setIsActive(event.target.value)}
          className="h-10 w-full rounded-md border bg-background px-3 outline-none focus:border-primary"
        >
          <option value="">Tat ca</option>
          <option value="true">Active</option>
          <option value="false">Disabled</option>
        </select>
      </label>

      <label className="space-y-2 text-sm">
        <span className="font-medium">Limit</span>
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
        <Button type="submit">Loc</Button>
        <Button type="button" variant="outline" onClick={handleClear}>
          Xoa
        </Button>
      </div>
    </form>
  );
}
