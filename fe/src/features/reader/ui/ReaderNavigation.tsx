import Link from "next/link";
import type { ChapterNavigationItem } from "../api/reader.schema";

type ReaderNavigationProps = {
  comicSlug: string;
  nextChapter: ChapterNavigationItem | null;
  previousChapter: ChapterNavigationItem | null;
};

function DisabledButton({ children }: { children: string }) {
  return (
    <span className="inline-flex min-h-10 items-center rounded-md border px-3 py-2 text-sm text-muted-foreground opacity-60">
      {children}
    </span>
  );
}

export function ReaderNavigation({
  comicSlug,
  nextChapter,
  previousChapter,
}: ReaderNavigationProps) {
  return (
    <nav className="flex flex-wrap items-center justify-center gap-2">
      <Link
        href={`/truyen/${comicSlug}`}
        className="inline-flex min-h-10 items-center rounded-md bg-background px-3 py-2 text-sm font-medium shadow-sm hover:bg-muted"
      >
        Ve truyen
      </Link>

      {previousChapter ? (
        <Link
          href={`/truyen/${comicSlug}/chapter/${previousChapter.chapterNumber}`}
          className="inline-flex min-h-10 items-center rounded-md border bg-background px-3 py-2 text-sm font-medium hover:bg-muted"
        >
          Chuong truoc
        </Link>
      ) : (
        <DisabledButton>Chuong truoc</DisabledButton>
      )}

      {nextChapter ? (
        <Link
          href={`/truyen/${comicSlug}/chapter/${nextChapter.chapterNumber}`}
          className="inline-flex min-h-10 items-center rounded-md border bg-background px-3 py-2 text-sm font-medium hover:bg-muted"
        >
          Chuong sau
        </Link>
      ) : (
        <DisabledButton>Chuong sau</DisabledButton>
      )}
    </nav>
  );
}
