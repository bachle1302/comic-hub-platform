/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { formatCompactNumber } from "@/shared/utils/format";
import type { RecommendationItem } from "../api/recommendations.schema";
import { RecommendationReasonBadges } from "./RecommendationReasonBadges";

type RecommendationCardProps = {
  item: RecommendationItem;
  priority?: boolean;
};

export function RecommendationCard({
  item,
  priority = false,
}: RecommendationCardProps) {
  return (
    <article className="group overflow-hidden rounded-lg border border-border bg-card text-card-foreground shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg">
      {/* Thumbnail */}
      <Link href={`/truyen/${item.slug}`} className="block">
        <div className="relative aspect-[2/3] overflow-hidden bg-muted">
          {item.thumbnail ? (
            <img
              src={item.thumbnail}
              alt={item.title}
              loading={priority ? "eager" : "lazy"}
              className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-muted to-muted/50 px-3 text-center text-xs text-muted-foreground">
              Chưa có ảnh
            </div>
          )}
          {item.status ? (
            <span className="absolute left-2 top-2 rounded-full bg-background/90 px-2 py-0.5 text-[11px] font-medium shadow-sm">
              {item.status === "ONGOING"
                ? "Đang ra"
                : item.status === "COMPLETED"
                  ? "Hoàn thành"
                  : item.status === "HIATUS"
                    ? "Tạm dừng"
                    : item.status}
            </span>
          ) : null}
        </div>
      </Link>

      {/* Info */}
      <div className="space-y-1.5 p-3">
        <Link
          href={`/truyen/${item.slug}`}
          className="line-clamp-2 min-h-10 text-sm font-semibold leading-5 hover:text-primary"
        >
          {item.title}
        </Link>

        {/* Author */}
        <p className="truncate text-xs text-muted-foreground">
          {item.authorName ?? "Đang cập nhật"}
        </p>

        {/* Chapter + view */}
        <div className="flex items-center justify-between gap-2 text-xs">
          <span className="truncate font-medium text-primary">
            {item.latestChapterNumber != null
              ? `Chapter ${item.latestChapterNumber}`
              : "Chưa có chapter"}
          </span>
          <span className="shrink-0 text-muted-foreground">
            {formatCompactNumber(item.viewTotal ?? 0)} view
          </span>
        </div>

        {/* Follow + like */}
        <div className="flex items-center justify-between gap-2 text-[11px] text-muted-foreground">
          <span>{formatCompactNumber(item.followCount ?? 0)} theo dõi</span>
          <span>{formatCompactNumber(item.likeCount ?? 0)} thích</span>
        </div>

        {/* Reason badges */}
        <RecommendationReasonBadges reasons={item.reasons} />
      </div>
    </article>
  );
}
