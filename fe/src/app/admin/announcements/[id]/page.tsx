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
      setErrorMessage("Announcement ID khong hop le");
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
          : "Khong tai duoc announcement",
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
    if (!window.confirm("Gui announcement nay thanh notification?")) {
      return;
    }

    setIsBroadcasting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const result = await broadcastAdminAnnouncement(announcementId);
      setSuccessMessage(`Da gui ${result.createdCount} notification.`);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Gui notification that bai",
      );
    } finally {
      setIsBroadcasting(false);
    }
  }

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Sua thong bao</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Cap nhat noi dung, thoi gian va trang thai announcement.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={isBroadcasting || !announcement}
            onClick={() => void handleBroadcast()}
          >
            {isBroadcasting ? "Dang gui..." : "Gui notification"}
          </Button>
          <Button asChild variant="outline">
            <AdminLink href="/admin/announcements">Quay lai</AdminLink>
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
          Dang tai thong bao...
        </div>
      ) : announcement ? (
        <AdminAnnouncementForm
          initialAnnouncement={announcement}
          submitLabel="Luu thay doi"
          onSubmit={handleSubmit}
        />
      ) : null}
    </section>
  );
}
