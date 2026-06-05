"use client";

import Link from "next/link";
import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Announcement } from "../api/announcements.schema";

type AnnouncementBannerProps = {
  announcement: Announcement;
};

const typeClasses: Record<Announcement["type"], string> = {
  INFO: "border-sky-200 bg-sky-50 text-sky-950",
  SUCCESS: "border-emerald-200 bg-emerald-50 text-emerald-950",
  WARNING: "border-amber-200 bg-amber-50 text-amber-950",
  DANGER: "border-red-200 bg-red-50 text-red-950",
  PROMOTION: "border-fuchsia-200 bg-fuchsia-50 text-fuchsia-950",
};

const typeLabels: Record<Announcement["type"], string> = {
  INFO: "Thong tin",
  SUCCESS: "Thanh cong",
  WARNING: "Can chu y",
  DANGER: "Quan trong",
  PROMOTION: "Uu dai",
};

export function AnnouncementBanner({ announcement }: AnnouncementBannerProps) {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) {
    return null;
  }

  return (
    <article
      className={`rounded-lg border px-4 py-3 shadow-sm ${typeClasses[announcement.type]}`}
    >
      <div className="flex gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-background/70 px-2 py-0.5 text-xs font-semibold">
              {typeLabels[announcement.type]}
            </span>
            <h2 className="text-sm font-semibold sm:text-base">
              {announcement.title}
            </h2>
          </div>
          <p className="mt-1 text-sm leading-6 opacity-90">
            {announcement.message}
          </p>
          {announcement.linkUrl ? (
            <Button
              asChild
              size="sm"
              variant="outline"
              className="mt-3 bg-background/80"
            >
              <Link href={announcement.linkUrl}>
                {announcement.linkLabel?.trim() || "Xem chi tiet"}
              </Link>
            </Button>
          ) : null}
        </div>

        <button
          type="button"
          aria-label="Dong thong bao"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md hover:bg-background/60"
          onClick={() => setIsVisible(false)}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </article>
  );
}
