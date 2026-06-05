"use client";

import type { AdminAuditLog } from "../api/admin-audit-logs.schema";
import { AdminAuditLogMetadata } from "./AdminAuditLogMetadata";

type AdminAuditLogsTableProps = {
  logs: AdminAuditLog[];
};

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

function getAdminLabel(log: AdminAuditLog): string {
  if (log.adminName && log.adminEmail) {
    return `${log.adminName} (${log.adminEmail})`;
  }

  return log.adminName ?? log.adminEmail ?? "-";
}

function shortenText(value?: string | null, maxLength = 72): string {
  if (!value) {
    return "-";
  }

  return value.length > maxLength ? `${value.slice(0, maxLength)}...` : value;
}

export function AdminAuditLogsTable({ logs }: AdminAuditLogsTableProps) {
  if (logs.length === 0) {
    return (
      <div className="rounded-lg border p-6 text-sm text-muted-foreground">
        Khong co audit log nao.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1280px] text-sm">
          <thead className="bg-muted/60 text-left">
            <tr>
              <th className="px-4 py-3 font-medium">ID</th>
              <th className="px-4 py-3 font-medium">Thoi gian</th>
              <th className="px-4 py-3 font-medium">Admin</th>
              <th className="px-4 py-3 font-medium">Action</th>
              <th className="px-4 py-3 font-medium">Entity</th>
              <th className="px-4 py-3 font-medium">Message</th>
              <th className="px-4 py-3 font-medium">Metadata</th>
              <th className="px-4 py-3 font-medium">IP</th>
              <th className="px-4 py-3 font-medium">User agent</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} className="border-t align-top">
                <td className="px-4 py-3">{log.id}</td>
                <td className="whitespace-nowrap px-4 py-3">
                  {formatDate(log.createdAt)}
                </td>
                <td className="max-w-xs px-4 py-3">
                  <p>{getAdminLabel(log)}</p>
                  {log.adminId ? (
                    <p className="text-xs text-muted-foreground">
                      Admin #{log.adminId}
                    </p>
                  ) : null}
                </td>
                <td className="px-4 py-3">
                  <span className="rounded-full border bg-muted px-2 py-1 text-xs font-medium">
                    {log.action}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <p>{log.entityType}</p>
                  <p className="text-xs text-muted-foreground">
                    {log.entityId ? `#${log.entityId}` : "-"}
                  </p>
                </td>
                <td className="max-w-sm px-4 py-3">{log.message}</td>
                <td className="px-4 py-3">
                  <AdminAuditLogMetadata metadata={log.metadata} />
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  {log.ip ?? "-"}
                </td>
                <td className="max-w-xs px-4 py-3 text-xs text-muted-foreground">
                  {shortenText(log.userAgent)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
