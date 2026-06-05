"use client";

import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import type { AdminUsersQuery } from "../api/admin-users.schema";

type AdminUsersFilterProps = {
  initialQuery?: AdminUsersQuery;
  onChange: (query: AdminUsersQuery) => void;
};

function parseLimit(value: string): number {
  const parsed = Number(value);

  return Number.isFinite(parsed) && parsed > 0 ? Math.trunc(parsed) : 20;
}

export function AdminUsersFilter({
  initialQuery,
  onChange,
}: AdminUsersFilterProps) {
  const [q, setQ] = useState(initialQuery?.q ?? "");
  const [role, setRole] = useState(initialQuery?.role ?? "");
  const [limit, setLimit] = useState(String(initialQuery?.limit ?? 20));

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    onChange({
      limit: parseLimit(limit),
      page: 1,
      q: q.trim() || undefined,
      role: role === "USER" || role === "ADMIN" ? role : undefined,
    });
  }

  function handleClear() {
    setQ("");
    setRole("");
    setLimit("20");
    onChange({
      limit: 20,
      page: 1,
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="grid gap-3 rounded-lg border bg-card p-4 md:grid-cols-[minmax(0,1fr)_160px_140px_auto]"
    >
      <label className="space-y-2 text-sm">
        <span className="font-medium">Tim kiem</span>
        <input
          type="search"
          value={q}
          onChange={(event) => setQ(event.target.value)}
          className="h-10 w-full rounded-md border bg-background px-3 outline-none focus:border-primary"
          placeholder="Ten hoac email"
        />
      </label>

      <label className="space-y-2 text-sm">
        <span className="font-medium">Role</span>
        <select
          value={role}
          onChange={(event) => setRole(event.target.value)}
          className="h-10 w-full rounded-md border bg-background px-3 outline-none focus:border-primary"
        >
          <option value="">Tat ca</option>
          <option value="USER">USER</option>
          <option value="ADMIN">ADMIN</option>
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
          Xoa loc
        </Button>
      </div>
    </form>
  );
}
