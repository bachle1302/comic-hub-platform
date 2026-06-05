"use client";

import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import type {
  ContactTicketStatus,
  ContactTicketsQuery,
  ContactTicketType,
} from "../api/contact-tickets.schema";

type AdminContactTicketsFilterProps = {
  initialQuery?: ContactTicketsQuery;
  onChange: (query: ContactTicketsQuery) => void;
};

const typeOptions: Array<{ label: string; value: ContactTicketType }> = [
  { value: "TECHNICAL", label: "Ky thuat" },
  { value: "PAYMENT", label: "Thanh toan" },
  { value: "COPYRIGHT", label: "Ban quyen" },
  { value: "ACCOUNT", label: "Tai khoan" },
  { value: "OTHER", label: "Khac" },
];

const statusOptions: Array<{ label: string; value: ContactTicketStatus }> = [
  { value: "NEW", label: "Moi" },
  { value: "IN_PROGRESS", label: "Dang xu ly" },
  { value: "RESOLVED", label: "Da xu ly" },
  { value: "CLOSED", label: "Da dong" },
];

function parseOptionalNumber(value: string): number | undefined {
  if (!value.trim()) {
    return undefined;
  }

  const parsed = Number(value);

  return Number.isFinite(parsed) && parsed > 0 ? Math.trunc(parsed) : undefined;
}

export function AdminContactTicketsFilter({
  initialQuery,
  onChange,
}: AdminContactTicketsFilterProps) {
  const [status, setStatus] = useState<ContactTicketStatus | "all">(
    initialQuery?.status ?? "all",
  );
  const [type, setType] = useState<ContactTicketType | "all">(
    initialQuery?.type ?? "all",
  );
  const [q, setQ] = useState(initialQuery?.q ?? "");
  const [email, setEmail] = useState(initialQuery?.email ?? "");
  const [userId, setUserId] = useState(
    initialQuery?.userId === undefined ? "" : String(initialQuery.userId),
  );
  const [limit, setLimit] = useState(String(initialQuery?.limit ?? 20));

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    onChange({
      status: status === "all" ? undefined : status,
      type: type === "all" ? undefined : type,
      q: q.trim() || undefined,
      email: email.trim() || undefined,
      userId: parseOptionalNumber(userId),
      limit: parseOptionalNumber(limit) ?? 20,
      page: 1,
    });
  }

  function handleClear() {
    setStatus("all");
    setType("all");
    setQ("");
    setEmail("");
    setUserId("");
    setLimit("20");
    onChange({
      limit: 20,
      page: 1,
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="grid gap-3 rounded-lg border p-4 lg:grid-cols-[160px_160px_1fr_220px_140px_120px_auto]"
    >
      <label className="space-y-2 text-sm">
        <span className="font-medium">Status</span>
        <select
          value={status}
          onChange={(event) =>
            setStatus(event.target.value as ContactTicketStatus | "all")
          }
          className="h-10 w-full rounded-md border bg-background px-3 outline-none focus:border-primary"
        >
          <option value="all">Tat ca</option>
          {statusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      <label className="space-y-2 text-sm">
        <span className="font-medium">Type</span>
        <select
          value={type}
          onChange={(event) =>
            setType(event.target.value as ContactTicketType | "all")
          }
          className="h-10 w-full rounded-md border bg-background px-3 outline-none focus:border-primary"
        >
          <option value="all">Tat ca</option>
          {typeOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      <label className="space-y-2 text-sm">
        <span className="font-medium">Tu khoa</span>
        <input
          value={q}
          onChange={(event) => setQ(event.target.value)}
          className="h-10 w-full rounded-md border bg-background px-3 outline-none focus:border-primary"
          placeholder="Subject, message, order..."
        />
      </label>

      <label className="space-y-2 text-sm">
        <span className="font-medium">Email</span>
        <input
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="h-10 w-full rounded-md border bg-background px-3 outline-none focus:border-primary"
          placeholder="user@example.com"
        />
      </label>

      <label className="space-y-2 text-sm">
        <span className="font-medium">User ID</span>
        <input
          type="number"
          min={1}
          value={userId}
          onChange={(event) => setUserId(event.target.value)}
          className="h-10 w-full rounded-md border bg-background px-3 outline-none focus:border-primary"
          placeholder="ID"
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
