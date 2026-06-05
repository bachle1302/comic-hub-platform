"use client";

import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import type { AdminSystemSettingsQuery } from "../api/system-settings.schema";

type AdminSystemSettingsFilterProps = {
  initialQuery?: AdminSystemSettingsQuery;
  onChange: (query: AdminSystemSettingsQuery) => void;
};

type VisibilityFilter = "all" | "private" | "public";

function visibilityToQuery(value: VisibilityFilter): boolean | undefined {
  if (value === "public") {
    return true;
  }

  if (value === "private") {
    return false;
  }

  return undefined;
}

function queryToVisibility(value?: boolean): VisibilityFilter {
  if (value === true) {
    return "public";
  }

  if (value === false) {
    return "private";
  }

  return "all";
}

export function AdminSystemSettingsFilter({
  initialQuery,
  onChange,
}: AdminSystemSettingsFilterProps) {
  const [group, setGroup] = useState(initialQuery?.group ?? "");
  const [isPublic, setIsPublic] = useState<VisibilityFilter>(
    queryToVisibility(initialQuery?.isPublic),
  );

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    onChange({
      group: group.trim() || undefined,
      isPublic: visibilityToQuery(isPublic),
    });
  }

  function handleClear() {
    setGroup("");
    setIsPublic("all");
    onChange({});
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="grid gap-3 rounded-lg border p-4 md:grid-cols-[1fr_180px_auto]"
    >
      <label className="space-y-2 text-sm">
        <span className="font-medium">Nhóm</span>
        <input
          value={group}
          onChange={(event) => setGroup(event.target.value)}
          className="h-10 w-full rounded-md border bg-background px-3 outline-none focus:border-primary"
          placeholder="general, seo, social, system"
        />
      </label>

      <label className="space-y-2 text-sm">
        <span className="font-medium">Hiển thị public</span>
        <select
          value={isPublic}
          onChange={(event) => setIsPublic(event.target.value as VisibilityFilter)}
          className="h-10 w-full rounded-md border bg-background px-3 outline-none focus:border-primary"
        >
          <option value="all">Tất cả</option>
          <option value="public">Public</option>
          <option value="private">Private</option>
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

