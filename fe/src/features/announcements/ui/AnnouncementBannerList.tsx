"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { getActiveAnnouncements } from "../api/announcements.api";
import type { Announcement } from "../api/announcements.schema";
import { AnnouncementBanner } from "./AnnouncementBanner";

export function AnnouncementBannerList() {
  const pathname = usePathname();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  useEffect(() => {
    let isMounted = true;

    if (pathname.startsWith("/admin")) {
      return undefined;
    }

    getActiveAnnouncements({
      limit: 3,
    })
      .then((items) => {
        if (isMounted) {
          setAnnouncements(items.slice(0, 3));
        }
      })
      .catch(() => {
        if (isMounted) {
          setAnnouncements([]);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [pathname]);

  if (pathname.startsWith("/admin")) {
    return null;
  }

  if (announcements.length === 0) {
    return null;
  }

  return (
    <div className="border-b bg-background">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-4 py-3">
        {announcements.map((announcement) => (
          <AnnouncementBanner
            key={announcement.id}
            announcement={announcement}
          />
        ))}
      </div>
    </div>
  );
}
