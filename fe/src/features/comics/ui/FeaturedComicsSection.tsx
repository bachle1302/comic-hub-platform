"use client";

import { useEffect, useState } from "react";
import { clientApiGet } from "@/shared/api/client-api";
import { comicListSchema, type Comic } from "../api/comics.schema";
import { ComicSection } from "./ComicSection";

function uniqueComics(comics: Comic[]): Comic[] {
  const map = new Map<number, Comic>();
  for (const comic of comics) {
    map.set(comic.id, comic);
  }
  return Array.from(map.values());
}

export function FeaturedComicsSection() {
  const [comics, setComics] = useState<Comic[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    Promise.all([
      clientApiGet("/comics/hot", comicListSchema).catch(() => []),
      clientApiGet("/comics", comicListSchema).catch(() => []),
    ]).then(([hotComics, allComics]) => {
      if (!active) return;
      const featured = uniqueComics([...hotComics, ...allComics]).slice(0, 6);
      setComics(featured);
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
      title="Truyện đề cử"
      description="Các bộ truyện nổi bật đang được nhiều độc giả quan tâm."
      href="/truyen"
      comics={comics}
    />
  );
}
