"use client";

import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  adminAuditActionValues,
  type AdminAuditAction,
  type AdminAuditLogsQuery,
} from "../api/admin-audit-logs.schema";

type AdminAuditLogsFilterProps = {
  initialQuery?: AdminAuditLogsQuery;
  onChange: (query: AdminAuditLogsQuery) => void;
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

function parseOptionalText(value: string): string | undefined {
  const trimmed = value.trim();

  return trimmed || undefined;
}

function parseAction(value: string): AdminAuditAction | undefined {
  return adminAuditActionValues.find((action) => action === value);
}

export function AdminAuditLogsFilter({
  initialQuery,
  onChange,
}: AdminAuditLogsFilterProps) {
  const [q, setQ] = useState(initialQuery?.q ?? "");
  const [action, setAction] = useState(initialQuery?.action ?? "");
  const [adminId, setAdminId] = useState(
    numberToInputValue(initialQuery?.adminId),
  );
  const [entityType, setEntityType] = useState(initialQuery?.entityType ?? "");
  const [entityId, setEntityId] = useState(initialQuery?.entityId ?? "");
  const [dateFrom, setDateFrom] = useState(initialQuery?.dateFrom ?? "");
  const [dateTo, setDateTo] = useState(initialQuery?.dateTo ?? "");
  const [limit, setLimit] = useState(String(initialQuery?.limit ?? 20));

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    onChange({
      action: parseAction(action),
      adminId: parseOptionalNumber(adminId),
      dateFrom: parseOptionalText(dateFrom),
      dateTo: parseOptionalText(dateTo),
      entityId: parseOptionalText(entityId),
      entityType: parseOptionalText(entityType),
      limit: parseOptionalNumber(limit) ?? 20,
      page: 1,
      q: parseOptionalText(q),
    });
  }

  function handleClear() {
    setQ("");
    setAction("");
    setAdminId("");
    setEntityType("");
    setEntityId("");
    setDateFrom("");
    setDateTo("");
    setLimit("20");
    onChange({
      limit: 20,
      page: 1,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-lg border p-4">
      <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-4">
        <label className="space-y-2 text-sm">
          <span className="font-medium">Tim kiem</span>
          <input
            type="text"
            value={q}
            onChange={(event) => setQ(event.target.value)}
            className="h-10 w-full rounded-md border bg-background px-3 outline-none focus:border-primary"
            placeholder="message, email, entity..."
          />
        </label>

        <label className="space-y-2 text-sm">
          <span className="font-medium">Action</span>
          <select
            value={action}
            onChange={(event) => setAction(event.target.value)}
            className="h-10 w-full rounded-md border bg-background px-3 outline-none focus:border-primary"
          >
            <option value="">Tat ca</option>
            {adminAuditActionValues.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-2 text-sm">
          <span className="font-medium">Admin ID</span>
          <input
            type="number"
            min={1}
            value={adminId}
            onChange={(event) => setAdminId(event.target.value)}
            className="h-10 w-full rounded-md border bg-background px-3 outline-none focus:border-primary"
            placeholder="VD: 1"
          />
        </label>

        <label className="space-y-2 text-sm">
          <span className="font-medium">Entity type</span>
          <input
            type="text"
            value={entityType}
            onChange={(event) => setEntityType(event.target.value)}
            className="h-10 w-full rounded-md border bg-background px-3 outline-none focus:border-primary"
            placeholder="User, Comic, Chapter..."
          />
        </label>

        <label className="space-y-2 text-sm">
          <span className="font-medium">Entity ID</span>
          <input
            type="text"
            value={entityId}
            onChange={(event) => setEntityId(event.target.value)}
            className="h-10 w-full rounded-md border bg-background px-3 outline-none focus:border-primary"
            placeholder="VD: 2"
          />
        </label>

        <label className="space-y-2 text-sm">
          <span className="font-medium">Tu ngay</span>
          <input
            type="date"
            value={dateFrom}
            onChange={(event) => setDateFrom(event.target.value)}
            className="h-10 w-full rounded-md border bg-background px-3 outline-none focus:border-primary"
          />
        </label>

        <label className="space-y-2 text-sm">
          <span className="font-medium">Den ngay</span>
          <input
            type="date"
            value={dateTo}
            onChange={(event) => setDateTo(event.target.value)}
            className="h-10 w-full rounded-md border bg-background px-3 outline-none focus:border-primary"
          />
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
      </div>

      <div className="flex flex-wrap gap-2">
        <Button type="submit">Loc</Button>
        <Button type="button" variant="outline" onClick={handleClear}>
          Xoa loc
        </Button>
      </div>
    </form>
  );
}
