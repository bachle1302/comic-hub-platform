/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { formatCompactNumber } from "@/shared/utils/format";
import type { Comic, ComicStatus } from "../api/comics.schema";

type ComicCardProps = {
  comic: Comic;
};

const statusLabels: Record<ComicStatus, string> = {
  CANCELLED: "Da huy",
  COMPLETED: "Hoan thanh",
  HIATUS: "Tam dung",
  ONGOING: "Dang ra",
};

export function ComicCard({ comic }: ComicCardProps) {
  const latestChapter = comic.chapters?.[0];

  return (
    <article className="group overflow-hidden rounded-lg border bg-card text-card-foreground shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg">
      <Link href={`/truyen/${comic.slug}`} className="block">
        <div className="relative aspect-[2/3] overflow-hidden bg-muted">
          {comic.thumbnail ? (
            <img
              src={comic.thumbnail}
              alt={comic.name}
              loading="lazy"
              className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-muted to-muted/50 px-3 text-center text-xs text-muted-foreground">
              Chua co anh
            </div>
          )}
          <span className="absolute left-2 top-2 rounded-full bg-background/90 px-2 py-0.5 text-[11px] font-medium shadow-sm">
            {statusLabels[comic.status]}
          </span>
        </div>
      </Link>

      <div className="space-y-2 p-3">
        <Link
          href={`/truyen/${comic.slug}`}
          className="line-clamp-2 min-h-10 text-sm font-semibold leading-5 hover:text-primary"
        >
          {comic.name}
        </Link>

        <p className="truncate text-xs text-muted-foreground">
          {comic.author?.name ?? "Dang cap nhat"}
        </p>

        <div className="flex items-center justify-between gap-2 text-xs">
          <span className="truncate font-medium text-primary">
            {latestChapter
              ? `Chapter ${latestChapter.chapterNumber}`
              : "Chua co chapter"}
          </span>
          <span className="shrink-0 text-muted-foreground">
            {formatCompactNumber(comic.viewTotal)} view
          </span>
        </div>

        <div className="flex items-center justify-between gap-2 text-[11px] text-muted-foreground">
          <span>{formatCompactNumber(comic.followCount)} theo doi</span>
          <span>{formatCompactNumber(comic.likeCount)} thich</span>
        </div>
      </div>
    </article>
  );
}
