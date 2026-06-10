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
        <span className="font-medium">Trạng thái</span>
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          className="h-10 w-full rounded-md border bg-background px-3 outline-none focus:border-primary"
        >
          <option value="">Tất cả</option>
          <option value="PENDING">Đang chờ</option>
          <option value="RESOLVED">Đã giải quyết</option>
          <option value="REJECTED">Đã bác bỏ</option>
        </select>
      </label>

      <label className="space-y-2 text-sm">
        <span className="font-medium">ID bình luận</span>
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
        <span className="font-medium">ID người dùng</span>
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
