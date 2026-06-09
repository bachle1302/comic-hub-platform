import Image from "next/image";
import Link from "next/link";
import { BookOpen, Eye, Heart, Lock, Flame, UserRound } from "lucide-react";
import { formatCompactNumber } from "@/shared/utils/format";
import type { Comic, ComicStatus } from "../api/comics.schema";

type ComicPosterCardProps = {
  comic: Comic;
  priority?: boolean;
  variant?: "compact" | "default";
};

const statusLabels: Record<ComicStatus, string> = {
  CANCELLED: "Đã hủy",
  COMPLETED: "Hoàn thành",
  HIATUS: "Tạm dừng",
  ONGOING: "Đang ra",
};

const statusClassNames: Record<ComicStatus, string> = {
  CANCELLED: "border border-zinc-500/20 bg-zinc-500/10 text-zinc-400",
  COMPLETED: "border border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
  HIATUS: "border border-amber-500/20 bg-amber-500/10 text-amber-400",
  ONGOING: "border border-blue-500/20 bg-blue-500/10 text-blue-400",
};

function getLatestChapter(comic: Comic) {
  return comic.chapters?.[0] ?? null;
}

function hasPaidChapter(comic: Comic): boolean {
  return Boolean(comic.chapters?.some((chapter) => chapter.price > 0));
}

export function ComicPosterCard({
  comic,
  priority = false,
  variant = "default",
}: ComicPosterCardProps) {
  const latestChapter = getLatestChapter(comic);
  const isCompact = variant === "compact";
  const isHot = comic.viewTotal >= 5000 || comic.likeCount >= 1000;

  return (
    <article className="group overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-[0_4px_20px_rgba(0,0,0,0.15)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.5)] transition-all duration-300 hover:-translate-y-1 hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
      <Link href={`/truyen/${comic.slug}`} prefetch={false} className="block">
        <div className="relative aspect-[2/3] overflow-hidden bg-background">
          {comic.thumbnail ? (
            <Image
              src={comic.thumbnail}
              alt={comic.name}
              fill
              priority={priority}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
              unoptimized
              className="object-cover transition duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-[radial-gradient(circle_at_top,var(--muted),var(--background))] px-3 text-center text-xs text-muted-foreground">
              Chưa có ảnh
            </div>
          )}

          <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-2">
            <span
              className={`rounded-full px-2 py-0.5 text-[9px] font-extrabold uppercase shadow-sm ${statusClassNames[comic.status]}`}
            >
              {statusLabels[comic.status]}
            </span>
            <div className="flex flex-col gap-1 items-end">
              {hasPaidChapter(comic) ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-black/80 px-2 py-0.5 text-[9px] font-medium text-zinc-100 backdrop-blur">
                  <Lock className="size-3 text-[#E53935]" />
                  Khóa
                </span>
              ) : null}
              {isHot ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-black/80 px-2 py-0.5 text-[9px] font-medium text-zinc-100 backdrop-blur">
                  <Flame className="size-3 text-[#E53935]" />
                  HOT
                </span>
              ) : null}
            </div>
          </div>

          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/45 to-transparent p-2">
            <p className="line-clamp-1 text-[11px] font-medium text-zinc-100">
              {latestChapter
                ? `Chapter ${latestChapter.chapterNumber}`
                : "Chưa có chapter"}
            </p>
          </div>
        </div>
      </Link>

      <div className={isCompact ? "space-y-1.5 p-2.5" : "space-y-2 p-3"}>
        <Link
          href={`/truyen/${comic.slug}`}
          prefetch={false}
          className="line-clamp-2 min-h-10 text-sm font-bold leading-5 text-foreground hover:text-zinc-600 dark:hover:text-white transition-colors duration-200"
        >
          {comic.name}
        </Link>

        <p className="flex items-center gap-1 truncate text-xs text-muted-foreground">
          <UserRound className="size-3.5 shrink-0" />
          {comic.author?.name ?? "Đang cập nhật"}
        </p>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Eye className="size-3.5 text-muted-foreground" />
            {formatCompactNumber(comic.viewTotal)}
          </span>
          <span className="inline-flex items-center gap-1">
            <BookOpen className="size-3.5 text-muted-foreground" />
            {formatCompactNumber(comic.followCount)}
          </span>
          <span className="inline-flex items-center gap-1">
            <Heart className="size-3.5 text-muted-foreground" />
            {formatCompactNumber(comic.likeCount)}
          </span>
        </div>
      </div>
    </article>
  );
}
