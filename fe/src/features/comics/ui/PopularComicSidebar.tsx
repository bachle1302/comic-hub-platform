import Link from "next/link";
import { Heart } from "lucide-react";
import { formatCompactNumber } from "@/shared/utils/format";

type PopularComicSidebarProps = {
  comics: Array<{
    id: number;
    name: string;
    slug: string;
    likeCount?: number;
    viewTotal?: number;
  }>;
};

function getRankClassName(index: number): string {
  if (index === 0) return "bg-primary text-primary-foreground";
  if (index === 1) return "bg-amber-600 text-white";
  if (index === 2) return "bg-teal-600 text-white";
  return "bg-zinc-800 text-zinc-400";
}

export function PopularComicSidebar({ comics }: PopularComicSidebarProps) {
  const items = comics.slice(0, 6);

  return (
    <aside className="rounded-2xl border border-border bg-card p-4">
      <div className="mb-4 flex items-center gap-2">
        <span className="grid size-9 place-items-center rounded-full bg-primary/15 text-primary">
          <Heart className="size-4 fill-primary text-primary" />
        </span>
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wide text-foreground">
            Truyện được yêu thích
          </h2>
          <p className="text-xs text-muted-foreground">
            Xếp theo lượt yêu thích từ độc giả
          </p>
        </div>
      </div>

      {items.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">
          Chưa có dữ liệu.
        </p>
      ) : (
        <ol className="space-y-3">
          {items.map((comic, index) => (
            <li key={comic.id}>
              <Link
                href={`/truyen/${comic.slug}`}
                prefetch={false}
                className="grid grid-cols-[32px_1fr] gap-3 rounded-xl p-2 transition hover:bg-zinc-100 dark:hover:bg-zinc-800/40"
              >
                <span
                  className={`grid size-8 place-items-center rounded-lg text-xs font-black ${getRankClassName(index)}`}
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="min-w-0 animate-fade-in">
                  <span className="line-clamp-2 text-sm font-semibold text-foreground">
                    {comic.name}
                  </span>
                  <span className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                    <Heart className="size-3.5 text-red-500 fill-red-500" />
                    {formatCompactNumber(comic.likeCount ?? 0)} lượt thích
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ol>
      )}
    </aside>
  );
}

