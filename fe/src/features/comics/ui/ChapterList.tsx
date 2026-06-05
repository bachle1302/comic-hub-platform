import Link from "next/link";
import { EmptyState } from "@/shared/ui";
import { formatDate } from "@/shared/utils/format";
import type { ChapterSummary } from "../api/comics.schema";

type ChapterListProps = {
  chapters: ChapterSummary[];
  comicSlug: string;
};

export function ChapterList({ chapters, comicSlug }: ChapterListProps) {
  if (chapters.length === 0) {
    return (
      <EmptyState
        title="Truyen chua co chuong"
        description="Theo doi truyen de quay lai khi co chapter moi."
      />
    );
  }

  const sortedChapters = [...chapters].sort(
    (left, right) => right.chapterNumber - left.chapterNumber,
  );

  return (
    <div className="max-h-[520px] overflow-hidden rounded-lg border bg-card">
      <div className="max-h-[520px] divide-y overflow-y-auto">
        {sortedChapters.map((chapter, index) => (
          <Link
            key={chapter.id}
            href={`/truyen/${comicSlug}/chapter/${chapter.chapterNumber}`}
            className={
              index === 0
                ? "flex flex-col gap-2 bg-primary/5 px-4 py-3 text-sm transition hover:bg-primary/10 sm:flex-row sm:items-center sm:justify-between"
                : "flex flex-col gap-2 px-4 py-3 text-sm transition hover:bg-muted sm:flex-row sm:items-center sm:justify-between"
            }
          >
            <span className="min-w-0">
              <span className="font-semibold">Chapter {chapter.chapterNumber}</span>
              <span className="ml-2 text-muted-foreground">
                {chapter.name || `Chapter ${chapter.chapterNumber}`}
              </span>
              {chapter.createdAt ? (
                <span className="mt-1 block text-xs text-muted-foreground">
                  {formatDate(chapter.createdAt)}
                </span>
              ) : null}
            </span>

            <span className="flex shrink-0 items-center gap-2">
              {index === 0 ? (
                <span className="rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                  Moi nhat
                </span>
              ) : null}
              <span
                className={
                  chapter.price > 0
                    ? "rounded-full border border-amber-500/40 bg-amber-500/10 px-2 py-0.5 text-xs text-amber-700 dark:text-amber-300"
                    : "rounded-full border border-green-600/40 bg-green-600/10 px-2 py-0.5 text-xs text-green-700 dark:text-green-300"
                }
              >
                {chapter.price > 0 ? `${chapter.price} coin` : "Mien phi"}
              </span>
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
