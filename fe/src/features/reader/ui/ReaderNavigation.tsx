import Link from "next/link";
import type { ChapterNavigationItem } from "../api/reader.schema";

type ReaderNavigationProps = {
  comicSlug: string;
  nextChapter: ChapterNavigationItem | null;
  previousChapter: ChapterNavigationItem | null;
};

export function ReaderNavigation({
  comicSlug,
  nextChapter,
  previousChapter,
}: ReaderNavigationProps) {
  return (
    <nav className="flex items-center justify-center gap-4">
      {previousChapter ? (
        <Link
          href={`/truyen/${comicSlug}/chapter/${previousChapter.chapterNumber}`}
          prefetch={false}
          className="inline-flex items-center justify-center rounded-full bg-[#3B82F6] hover:bg-[#2563EB] px-6 py-2 text-xs font-semibold text-white shadow transition-colors"
        >
          ← Chap trước
        </Link>
      ) : (
        <span className="inline-flex items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800 px-6 py-2 text-xs font-semibold text-zinc-400 dark:text-zinc-500 cursor-not-allowed opacity-60">
          ← Chap trước
        </span>
      )}

      {nextChapter ? (
        <Link
          href={`/truyen/${comicSlug}/chapter/${nextChapter.chapterNumber}`}
          prefetch={false}
          className="inline-flex items-center justify-center rounded-full bg-[#3B82F6] hover:bg-[#2563EB] px-6 py-2 text-xs font-semibold text-white shadow transition-colors"
        >
          Chap sau →
        </Link>
      ) : (
        <span className="inline-flex items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800 px-6 py-2 text-xs font-semibold text-zinc-400 dark:text-zinc-500 cursor-not-allowed opacity-60">
          Chap sau →
        </span>
      )}
    </nav>
  );
}
