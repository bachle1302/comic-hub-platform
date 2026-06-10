"use client";

import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  AdminAnnouncementForm,
  broadcastAdminAnnouncement,
  getAdminAnnouncement,
  type Announcement,
  type AnnouncementInput,
  updateAdminAnnouncement,
} from "@/features/announcements";
import { AdminLink } from "@/shared/ui/AdminLink";

export default function EditAdminAnnouncementPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const announcementId = Number(params.id);
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const loadAnnouncement = useCallback(async () => {
    if (!Number.isFinite(announcementId) || announcementId <= 0) {
      setErrorMessage("ID thông báo không hợp lệ");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      setAnnouncement(await getAdminAnnouncement(announcementId));
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Không tải được thông báo",
      );
    } finally {
      setIsLoading(false);
    }
  }, [announcementId]);

  useEffect(() => {
    const task = window.setTimeout(() => {
      void loadAnnouncement();
    }, 0);

    return () => window.clearTimeout(task);
  }, [loadAnnouncement]);

  async function handleSubmit(input: AnnouncementInput) {
    await updateAdminAnnouncement(announcementId, input);
    router.push("/admin/announcements");
  }

  async function handleBroadcast() {
    if (!window.confirm("Gửi thông báo này thành thông báo đẩy?")) {
      return;
    }

    setIsBroadcasting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const result = await broadcastAdminAnnouncement(announcementId);
      setSuccessMessage(`Đã gửi ${result.createdCount} thông báo.`);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Gửi thông báo thất bại",
      );
    } finally {
      setIsBroadcasting(false);
    }
  }

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Sửa thông báo</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Cập nhật nội dung, thời gian và trạng thái thông báo.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={isBroadcasting || !announcement}
            onClick={() => void handleBroadcast()}
          >
            {isBroadcasting ? "Đang gửi..." : "Gửi thông báo"}
          </Button>
          <Button asChild variant="outline">
            <AdminLink href="/admin/announcements">Quay lại</AdminLink>
          </Button>
        </div>
      </div>

      {successMessage ? (
        <div className="rounded-md border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-700">
          {successMessage}
        </div>
      ) : null}

      {errorMessage ? (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          {errorMessage}
        </div>
      ) : null}

      {isLoading ? (
        <div className="rounded-lg border p-6 text-sm text-muted-foreground">
          Đang tải thông báo...
        </div>
      ) : announcement ? (
        <AdminAnnouncementForm
          initialAnnouncement={announcement}
          submitLabel="Lưu thay đổi"
          onSubmit={handleSubmit}
        />
      ) : null}
    </section>
  );
}
