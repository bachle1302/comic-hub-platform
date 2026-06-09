"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { clientApiGet } from "@/shared/api/client-api";
import { SectionTitle } from "@/shared/ui";
import { comicListSchema, type Comic } from "../api/comics.schema";
import { ComicPosterCard } from "./ComicPosterCard";

export function CompletedComicsSection() {
  const [comics, setComics] = useState<Comic[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    clientApiGet("/comics", comicListSchema)
      .then((data) => {
        if (!active) return;
        const completed = data
          .filter((comic) => comic.status === "COMPLETED")
          .slice(0, 6);
        setComics(completed);
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

  if (comics.length === 0) return null;

  return (
    <section className="space-y-5">
      <SectionTitle
        title="Truyện đã hoàn thành"
        description="Đọc liền mạch các bộ đã kết thúc."
        action={
          <Link
            href="/truyen?status=COMPLETED"
            prefetch={false}
            className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-sm font-semibold text-muted-foreground transition hover:border-zinc-300 dark:hover:border-zinc-700 hover:text-foreground"
          >
            Xem thêm
            <ArrowRight className="size-4" />
          </Link>
        }
      />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 xl:grid-cols-6">
        {comics.map((comic, index) => (
          <ComicPosterCard
            key={comic.id}
            comic={comic}
            priority={index < 2}
            variant="compact"
          />
        ))}
      </div>
    </section>
  );
}
