import Link from "next/link";
import { Tags } from "lucide-react";
import type { CategoryListItem } from "../api/categories.schema";

type CategoryCloudProps = {
  categories: CategoryListItem[];
  limit?: number;
};

export function CategoryCloud({ categories, limit = 18 }: CategoryCloudProps) {
  const items = categories.slice(0, limit);

  return (
    <section className="rounded-2xl border border-border bg-card p-4 animate-fade-in">
      <div className="mb-4 flex items-center gap-2">
        <span className="grid size-9 place-items-center rounded-full bg-secondary text-foreground">
          <Tags className="size-4" />
        </span>
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wide text-foreground">
            Khám phá theo danh mục
          </h2>
          <p className="text-xs text-muted-foreground">
            Chọn thể loại bạn muốn đọc
          </p>
        </div>
      </div>

      {items.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">
          Chưa có thể loại.
        </p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {items.map((category) => (
            <Link
              key={category.id}
              href={`/the-loai/${category.slug}`}
              prefetch={false}
              className="rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:border-zinc-300 hover:bg-zinc-50 hover:text-foreground dark:hover:border-zinc-700 dark:hover:bg-zinc-800"
            >
              {category.name}
              {category._count?.comics !== undefined ? (
                <span className="ml-1 text-muted-foreground/70">
                  ({category._count.comics})
                </span>
              ) : null}
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
