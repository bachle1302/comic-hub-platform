/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { EmptyState } from "@/shared/ui";
import { formatCompactNumber, formatDate } from "@/shared/utils/format";
import type { ComicStatus } from "@/features/comics";
import type {
  RankingComic,
  RankingPeriod,
  RankingType,
} from "../api/rankings.schema";

type RankingComicListProps = {
  comics: RankingComic[];
  period: RankingPeriod;
  type: RankingType;
  startRank?: number;
};

const statusLabels: Record<ComicStatus, string> = {
  CANCELLED: "Da huy",
  COMPLETED: "Hoan thanh",
  HIATUS: "Tam dung",
  ONGOING: "Dang ra",
};

function rankClassName(rank: number): string {
  if (rank === 1) {
    return "border-primary/40 bg-primary/5";
  }

  if (rank === 2 || rank === 3) {
    return "border-muted-foreground/30 bg-muted/30";
  }

  return "bg-card";
}

function viewMetricName(period: RankingPeriod): string {
  if (period === "day") {
    return "luot xem hom nay";
  }

  if (period === "week") {
    return "luot xem tuan nay";
  }

  if (period === "month") {
    return "luot xem thang nay";
  }

  return "luot xem";
}

function metricLabel(
  type: RankingType,
  period: RankingPeriod,
  comic: RankingComic,
): string {
  if (type === "likes") {
    return `${formatCompactNumber(comic.likeCount)} luot thich`;
  }

  if (type === "follows") {
    return `${formatCompactNumber(comic.followCount)} theo doi`;
  }

  if (type === "latest") {
    return comic.lastChapterAt
      ? `Cap nhat ${formatDate(comic.lastChapterAt)}`
      : "Chua co ngay cap nhat";
  }

  return `${formatCompactNumber(comic.viewTotal)} ${viewMetricName(period)}`;
}

function latestUpdatedLabel(comic: RankingComic): string {
  const value = comic.lastChapterAt ?? comic.updatedAt ?? comic.createdAt;
  return value ? formatDate(value) : "Dang cap nhat";
}

export function RankingComicList({
  comics,
  period,
  startRank = 1,
  type,
}: RankingComicListProps) {
  if (comics.length === 0) {
    return (
      <EmptyState
        title="Chua co truyen trong bang xep hang"
        description="Hay thu doi bo loc hoac quay lai sau."
      />
    );
  }

  return (
    <div className="space-y-3">
      {comics.map((comic, index) => {
        const rank = startRank + index;

        return (
          <article
            key={comic.id}
            className={`grid gap-3 rounded-lg border p-3 shadow-sm md:grid-cols-[72px_96px_1fr] md:items-center ${rankClassName(rank)}`}
          >
            <div className="flex items-center gap-3 md:justify-center">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full border bg-background text-sm font-bold">
                #{rank}
              </span>
              <span className="text-sm font-medium text-primary md:hidden">
                {metricLabel(type, period, comic)}
              </span>
            </div>

            <Link
              href={`/truyen/${comic.slug}`}
              className="block aspect-[2/3] w-24 overflow-hidden rounded-md border bg-muted md:w-full"
            >
              {comic.thumbnail ? (
                <img
                  src={comic.thumbnail}
                  alt={comic.name}
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center px-2 text-center text-xs text-muted-foreground">
                  Chua co anh
                </div>
              )}
            </Link>

            <div className="min-w-0 space-y-3">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <Link
                    href={`/truyen/${comic.slug}`}
                    className="line-clamp-2 text-base font-semibold hover:text-primary"
                  >
                    {comic.name}
                  </Link>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Tac gia: {comic.author?.name ?? "Dang cap nhat"}
                  </p>
                </div>
                <span className="hidden rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary md:inline-flex">
                  {metricLabel(type, period, comic)}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground md:grid-cols-6">
                <span>{statusLabels[comic.status]}</span>
                <span>{formatCompactNumber(comic.viewTotal)} view</span>
                <span>{formatCompactNumber(comic.likeCount)} thich</span>
                <span>{formatCompactNumber(comic.followCount)} follow</span>
                <span>{comic.chapterCount} chuong</span>
                <span>Cap nhat {latestUpdatedLabel(comic)}</span>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
