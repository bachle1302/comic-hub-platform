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

const roleLabels: Record<string, string> = {
  ADMIN: "Quản trị viên",
  USER: "Người dùng",
};

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
              {roleLabels[user.role] ?? user.role}
            </span>
            <span className="rounded-full border px-3 py-1 text-xs font-medium">
              {user.coin} coin
            </span>
            {user.bannedAt ? (
              <span className="rounded-full border border-destructive/40 bg-destructive/10 px-3 py-1 text-xs font-semibold text-destructive">
                Bị khóa
              </span>
            ) : (
              <span className="rounded-full border border-green-600/30 bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                Hoạt động
              </span>
            )}
          </div>
        </div>
      </div>

      {user.bannedAt ? (
        <div className="mt-5 rounded-md border border-destructive/30 bg-destructive/5 p-3">
          <p className="text-sm font-semibold text-destructive">
            Tài khoản này đang bị khóa
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Bị khóa lúc: {formatDate(user.bannedAt)}
          </p>
          <p className="mt-1 break-words text-sm text-muted-foreground">
            Lý do: {user.banReason || "-"}
          </p>
        </div>
      ) : null}

      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <DetailRow label="ID người dùng" value={user.id} />
        <DetailRow
          label="Trạng thái tài khoản"
          value={user.bannedAt ? "Bị khóa" : "Hoạt động"}
        />
        <DetailRow
          label="Bị khóa lúc"
          value={user.bannedAt ? formatDate(user.bannedAt) : "-"}
        />
        <DetailRow label="Lý do khóa" value={user.banReason || "-"} />
        <DetailRow label="Ngày tạo" value={formatDate(user.createdAt)} />
        <DetailRow label="Ngày cập nhật" value={formatDate(user.updatedAt)} />
        <DetailRow label="Số giao dịch" value={user._count?.transactions ?? 0} />
        <DetailRow label="Số lượt mua" value={user._count?.purchases ?? 0} />
        <DetailRow label="Số bình luận" value={user._count?.comments ?? 0} />
        <DetailRow label="Số lượt theo dõi" value={user._count?.follows ?? 0} />
        <DetailRow label="Lịch sử đọc" value={user._count?.histories ?? 0} />
      </div>
    </div>
  );
}
