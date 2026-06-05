/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import type { FollowedComic } from "../api/follows.schema";

type FollowedComicsListProps = {
  follows: FollowedComic[];
};

export function FollowedComicsList({ follows }: FollowedComicsListProps) {
  if (follows.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
        Ban chua theo doi truyen nao.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {follows.map((follow) => {
        const latestChapter = follow.comic.chapters?.[0] ?? null;

        return (
          <Link
            key={follow.id}
            href={`/truyen/${follow.comic.slug}`}
            className="grid gap-3 rounded-lg border p-3 hover:bg-muted/60 sm:grid-cols-[72px_1fr]"
          >
            <div className="aspect-[2/3] overflow-hidden rounded-md bg-muted">
              {follow.comic.thumbnail ? (
                <img
                  src={follow.comic.thumbnail}
                  alt={follow.comic.name}
                  className="h-full w-full object-cover"
                />
              ) : null}
            </div>
            <div className="min-w-0 space-y-1">
              <h2 className="truncate font-semibold">{follow.comic.name}</h2>
              <p className="text-sm text-muted-foreground">
                {follow.comic.author?.name ?? "Dang cap nhat"} ·{" "}
                {follow.comic.status}
              </p>
              {latestChapter ? (
                <p className="text-sm">
                  Moi nhat: Chapter {latestChapter.chapterNumber} -{" "}
                  {latestChapter.name}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">Chua co chuong</p>
              )}
              <p className="text-xs text-muted-foreground">
                Theo doi luc{" "}
                {new Date(follow.createdAt).toLocaleDateString("vi-VN")}
              </p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
