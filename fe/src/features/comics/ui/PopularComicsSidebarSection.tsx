"use client";

import { useEffect, useState } from "react";
import { clientApiGet } from "@/shared/api/client-api";
import { rankingsPaginatedSchema, type RankingComic } from "@/features/rankings/api/rankings.schema";
import { PopularComicSidebar } from "./PopularComicSidebar";

export function PopularComicsSidebarSection() {
  const [comics, setComics] = useState<RankingComic[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    clientApiGet("/comics/ranking?type=likes&limit=6", rankingsPaginatedSchema)
      .then((data) => {
        if (!active) return;
        setComics(data.items);
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
        <div className="h-6 w-32 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
        <div className="space-y-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-800" />
          ))}
        </div>
      </div>
    );
  }

  return <PopularComicSidebar comics={comics} />;
}
