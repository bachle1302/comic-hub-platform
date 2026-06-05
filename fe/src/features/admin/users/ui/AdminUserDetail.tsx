"use client";

import Image from "next/image";
import { formatDate } from "@/shared/utils/format";
import type { AdminUserDetail as AdminUserDetailType } from "../api/admin-users.schema";

type AdminUserDetailProps = {
  user: AdminUserDetailType;
};

function DetailRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-md border bg-background p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 break-words text-sm font-medium">{value}</p>
    </div>
  );
}

export function AdminUserDetail({ user }: AdminUserDetailProps) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full border bg-muted text-xl font-semibold">
          {user.avatar ? (
            <Image
              src={user.avatar}
              alt={user.name}
              width={64}
              height={64}
              unoptimized
              className="h-full w-full object-cover"
            />
          ) : (
            user.name.slice(0, 1).toUpperCase()
          )}
        </div>

        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold">{user.name}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{user.email}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="rounded-full border px-3 py-1 text-xs font-medium">
              {user.role}
            </span>
            <span className="rounded-full border px-3 py-1 text-xs font-medium">
              {user.coin} coin
            </span>
            {user.bannedAt ? (
              <span className="rounded-full border border-destructive/40 bg-destructive/10 px-3 py-1 text-xs font-semibold text-destructive">
                Banned
              </span>
            ) : (
              <span className="rounded-full border border-green-600/30 bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                Active
              </span>
            )}
          </div>
        </div>
      </div>

      {user.bannedAt ? (
        <div className="mt-5 rounded-md border border-destructive/30 bg-destructive/5 p-3">
          <p className="text-sm font-semibold text-destructive">
            Tai khoan nay dang bi ban
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Banned at: {formatDate(user.bannedAt)}
          </p>
          <p className="mt-1 break-words text-sm text-muted-foreground">
            Reason: {user.banReason || "-"}
          </p>
        </div>
      ) : null}

      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <DetailRow label="User ID" value={user.id} />
        <DetailRow
          label="Account status"
          value={user.bannedAt ? "Banned" : "Active"}
        />
        <DetailRow
          label="Banned at"
          value={user.bannedAt ? formatDate(user.bannedAt) : "-"}
        />
        <DetailRow label="Ban reason" value={user.banReason || "-"} />
        <DetailRow label="Created" value={formatDate(user.createdAt)} />
        <DetailRow label="Updated" value={formatDate(user.updatedAt)} />
        <DetailRow label="Transactions" value={user._count?.transactions ?? 0} />
        <DetailRow label="Purchases" value={user._count?.purchases ?? 0} />
        <DetailRow label="Comments" value={user._count?.comments ?? 0} />
        <DetailRow label="Follows" value={user._count?.follows ?? 0} />
        <DetailRow label="Histories" value={user._count?.histories ?? 0} />
      </div>
    </div>
  );
}
