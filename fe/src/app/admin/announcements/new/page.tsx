"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  AdminAnnouncementForm,
  createAdminAnnouncement,
  type AnnouncementInput,
} from "@/features/announcements";
import { AdminLink } from "@/shared/ui/AdminLink";

export default function NewAdminAnnouncementPage() {
  const router = useRouter();

  async function handleSubmit(input: AnnouncementInput) {
    await createAdminAnnouncement(input);
    router.push("/admin/announcements");
  }

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Tạo thông báo</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Tạo banner/thông báo hiển thị trên trang công khai.
          </p>
        </div>
        <Button asChild>
          <AdminLink href="/admin/announcements">Quay lại</AdminLink>
        </Button>
      </div>

      <AdminAnnouncementForm
        submitLabel="Tạo thông báo"
        onSubmit={handleSubmit}
      />
    </section>
  );
}
