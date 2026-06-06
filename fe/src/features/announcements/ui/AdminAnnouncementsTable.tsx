"use client";

import { Button } from "@/components/ui/button";
import { AdminLink } from "@/shared/ui/AdminLink";
import type { Announcement } from "../api/announcements.schema";

type AdminAnnouncementsTableProps = {
  announcements: Announcement[];
  broadcastingId?: number | null;
  deletingId?: number | null;
  onBroadcast: (id: number) => Promise<void> | void;
  onDelete: (id: number) => Promise<void> | void;
};

function formatDate(value?: string | null): string {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

export function AdminAnnouncementsTable({
  announcements,
  broadcastingId,
  deletingId,
  onBroadcast,
  onDelete,
}: AdminAnnouncementsTableProps) {
  if (announcements.length === 0) {
    return (
      <div className="rounded-lg border p-6 text-sm text-muted-foreground">
        Chua co thong bao he thong.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1120px] text-sm">
          <thead className="bg-muted/60 text-left">
            <tr>
              <th className="px-4 py-3 font-medium">Title</th>
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium">Target</th>
              <th className="px-4 py-3 font-medium">Priority</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Thoi gian</th>
              <th className="px-4 py-3 text-right font-medium">Thao tac</th>
            </tr>
          </thead>
          <tbody>
            {announcements.map((announcement) => (
              <tr key={announcement.id} className="border-t align-top">
                <td className="max-w-md px-4 py-3">
                  <p className="font-medium">{announcement.title}</p>
                  <p className="mt-1 line-clamp-2 text-muted-foreground">
                    {announcement.message}
                  </p>
                  {announcement.linkUrl ? (
                    <p className="mt-1 text-xs text-muted-foreground">
                      Link: {announcement.linkUrl}
                    </p>
                  ) : null}
                </td>
                <td className="px-4 py-3">{announcement.type}</td>
                <td className="px-4 py-3">{announcement.target}</td>
                <td className="px-4 py-3">{announcement.priority}</td>
                <td className="px-4 py-3">
                  <span
                    className={
                      announcement.isActive
                        ? "rounded-full bg-emerald-500/10 px-2 py-1 text-xs font-medium text-emerald-700"
                        : "rounded-full bg-muted px-2 py-1 text-xs font-medium text-muted-foreground"
                    }
                  >
                    {announcement.isActive ? "Active" : "Disabled"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <p>Start: {formatDate(announcement.startsAt)}</p>
                  <p className="mt-1">End: {formatDate(announcement.endsAt)}</p>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap justify-end gap-2">
                    <Button asChild size="sm" variant="outline">
                      <AdminLink href={`/admin/announcements/${announcement.id}`}>
                        Sua
                      </AdminLink>
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={broadcastingId === announcement.id}
                      onClick={() => {
                        if (
                          window.confirm(
                            "Gui announcement nay thanh notification?",
                          )
                        ) {
                          void onBroadcast(announcement.id);
                        }
                      }}
                    >
                      {broadcastingId === announcement.id
                        ? "Dang gui..."
                        : "Gui notification"}
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      disabled={!announcement.isActive || deletingId === announcement.id}
                      onClick={() => {
                        if (
                          window.confirm(
                            "Thong bao se bi disable, khong xoa vinh vien. Tiep tuc?",
                          )
                        ) {
                          void onDelete(announcement.id);
                        }
                      }}
                    >
                      {!announcement.isActive
                        ? "Da disable"
                        : deletingId === announcement.id
                          ? "Dang disable..."
                          : "Disable"}
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
