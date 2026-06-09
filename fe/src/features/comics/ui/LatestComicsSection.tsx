"use client";

import { useEffect, useState } from "react";
import { clientApiGet } from "@/shared/api/client-api";
import { comicListSchema, type Comic } from "../api/comics.schema";
import { ComicSection } from "./ComicSection";

export function LatestComicsSection() {
  const [comics, setComics] = useState<Comic[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    clientApiGet("/comics/latest", comicListSchema)
      .then((data) => {
        if (!active) return;
        setComics(data.slice(0, 18));
        setIsLoading(false);
      })
      .catch(() => {
        if (!active) return;
        setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-6 w-48 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 xl:grid-cols-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="aspect-[3/4] animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-800" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <ComicSection
      title="Cập nhật mới nhất"
      description="Những chapter vừa lên sóng, sắp xếp theo dữ liệu từ hệ thống."
      href="/truyen"
      comics={comics}
    />
  );
}
