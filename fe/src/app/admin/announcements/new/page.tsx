"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  AdminAnnouncementForm,
  createAdminAnnouncement,
  type AnnouncementInput,
} from "@/features/announcements";

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
          <h1 className="text-2xl font-bold">Tao thong bao</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Tao banner/thong bao hien thi tren public site.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/admin/announcements">Quay lai</Link>
        </Button>
      </div>

      <AdminAnnouncementForm
        submitLabel="Tao thong bao"
        onSubmit={handleSubmit}
      />
    </section>
  );
}
