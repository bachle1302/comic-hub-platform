"use client";

import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import type {
  AdminCommentReportsQuery,
  CommentReportStatus,
} from "../api/admin-comment-reports.schema";

type AdminCommentReportsFilterProps = {
  initialQuery?: AdminCommentReportsQuery;
  onChange: (query: AdminCommentReportsQuery) => void;
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

function parseStatus(value: string): CommentReportStatus | undefined {
  if (value === "PENDING" || value === "RESOLVED" || value === "REJECTED") {
    return value;
  }

  return undefined;
}

export function AdminCommentReportsFilter({
  initialQuery,
  onChange,
}: AdminCommentReportsFilterProps) {
  const [status, setStatus] = useState(initialQuery?.status ?? "");
  const [commentId, setCommentId] = useState(
    numberToInputValue(initialQuery?.commentId),
  );
  const [userId, setUserId] = useState(numberToInputValue(initialQuery?.userId));
  const [limit, setLimit] = useState(String(initialQuery?.limit ?? 20));

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    onChange({
      status: parseStatus(status),
      commentId: parseOptionalNumber(commentId),
      userId: parseOptionalNumber(userId),
      limit: parseOptionalNumber(limit) ?? 20,
      page: 1,
    });
  }

  function handleClear() {
    setStatus("");
    setCommentId("");
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
      className="grid gap-3 rounded-lg border p-4 md:grid-cols-[160px_1fr_1fr_140px_auto]"
    >
      <label className="space-y-2 text-sm">
        <span className="font-medium">Status</span>
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          className="h-10 w-full rounded-md border bg-background px-3 outline-none focus:border-primary"
        >
          <option value="">All</option>
          <option value="PENDING">PENDING</option>
          <option value="RESOLVED">RESOLVED</option>
          <option value="REJECTED">REJECTED</option>
        </select>
      </label>

      <label className="space-y-2 text-sm">
        <span className="font-medium">Comment ID</span>
        <input
          type="number"
          min={1}
          value={commentId}
          onChange={(event) => setCommentId(event.target.value)}
          className="h-10 w-full rounded-md border bg-background px-3 outline-none focus:border-primary"
          placeholder="VD: 1"
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
          placeholder="VD: 2"
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
