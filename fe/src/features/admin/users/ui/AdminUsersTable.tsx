"use client";

import { Button } from "@/components/ui/button";
import { AdminLink } from "@/shared/ui/AdminLink";
import { formatDate } from "@/shared/utils/format";
import type { AdminUserListItem } from "../api/admin-users.schema";

type AdminUsersTableProps = {
  users: AdminUserListItem[];
};

export function AdminUsersTable({ users }: AdminUsersTableProps) {
  if (users.length === 0) {
    return (
      <div className="rounded-lg border p-6 text-sm text-muted-foreground">
        Khong co user phu hop.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[980px] text-sm">
          <thead className="bg-muted/60 text-left">
            <tr>
              <th className="px-4 py-3 font-medium">ID</th>
              <th className="px-4 py-3 font-medium">Ten</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Coin</th>
              <th className="px-4 py-3 font-medium">Purchases</th>
              <th className="px-4 py-3 font-medium">Comments</th>
              <th className="px-4 py-3 font-medium">Follows</th>
              <th className="px-4 py-3 font-medium">Ngay tao</th>
              <th className="px-4 py-3 text-right font-medium">Thao tac</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-t">
                <td className="px-4 py-3">{user.id}</td>
                <td className="px-4 py-3 font-medium">{user.name}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  {user.email}
                </td>
                <td className="px-4 py-3">
                  <span className="rounded-full border px-2 py-1 text-xs font-medium">
                    {user.role}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {user.bannedAt ? (
                    <span className="rounded-full border border-destructive/40 bg-destructive/10 px-2 py-1 text-xs font-semibold text-destructive">
                      Banned
                    </span>
                  ) : (
                    <span className="rounded-full border border-green-600/30 bg-green-50 px-2 py-1 text-xs font-semibold text-green-700">
                      Active
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 font-semibold">{user.coin}</td>
                <td className="px-4 py-3">{user._count?.purchases ?? 0}</td>
                <td className="px-4 py-3">{user._count?.comments ?? 0}</td>
                <td className="px-4 py-3">{user._count?.follows ?? 0}</td>
                <td className="px-4 py-3">{formatDate(user.createdAt)}</td>
                <td className="px-4 py-3 text-right">
                  <Button asChild size="sm" variant="outline">
                    <AdminLink href={`/admin/users/${user.id}`}>Chi tiet</AdminLink>
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
