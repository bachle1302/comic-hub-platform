/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { HistoryItem } from "../api/histories.schema";

type HistoryListProps = {
  histories: HistoryItem[];
  onDelete?: (id: number) => Promise<void> | void;
};

export function HistoryList({ histories, onDelete }: HistoryListProps) {
  if (histories.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
        Ban chua co lich su doc.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {histories.map((history) => (
        <div
          key={history.id}
          className="grid gap-3 rounded-lg border p-3 sm:grid-cols-[72px_1fr_auto]"
        >
          <Link
            href={`/truyen/${history.comic.slug}`}
            className="aspect-[2/3] overflow-hidden rounded-md bg-muted"
          >
            {history.comic.thumbnail ? (
              <img
                src={history.comic.thumbnail}
                alt={history.comic.name}
                className="h-full w-full object-cover"
              />
            ) : null}
          </Link>
          <div className="min-w-0 space-y-1">
            <Link
              href={`/truyen/${history.comic.slug}`}
              className="font-semibold hover:text-primary"
            >
              {history.comic.name}
            </Link>
            <p className="text-sm text-muted-foreground">
              Chapter {history.chapter.chapterNumber}: {history.chapter.name}
            </p>
            <p className="text-sm">
              Tien do {Math.round(history.progress * 100)}% · Anh{" "}
              {history.imageIndex + 1}
            </p>
            <p className="text-xs text-muted-foreground">
              Cap nhat{" "}
              {new Date(history.updatedAt).toLocaleString("vi-VN", {
                dateStyle: "short",
                timeStyle: "short",
              })}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:flex-col sm:items-end">
            <Button asChild size="sm">
              <Link
                href={`/truyen/${history.comic.slug}/chapter/${history.chapter.chapterNumber}?continue=1`}
              >
                Doc tiep
              </Link>
            </Button>
            {onDelete ? (
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => void onDelete(history.id)}
              >
                Xoa
              </Button>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  );
}
