import type { Metadata } from "next";
import Link from "next/link";
import { getCategories } from "@/features/categories";
import { ComicGrid, getHotComics, getLatestComics } from "@/features/comics";

export const metadata: Metadata = {
  title: "Đọc truyện tranh online - Truyện mới cập nhật",
  description:
    "Khám phá truyện tranh mới cập nhật, truyện hot và nhiều thể loại hấp dẫn.",
};

export const revalidate = 60;
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [latestComics, hotComics, categoriesData] = await Promise.all([
    getLatestComics(),
    getHotComics(),
    getCategories(),
  ]);

  return (
    <div className="space-y-10">
      <section className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            Truyện mới cập nhật
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Các bộ truyện vừa có chapter mới.
          </p>
        </div>
        <ComicGrid comics={latestComics} />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Truyện hot</h2>
        <ComicGrid comics={hotComics} />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Thể loại</h2>
        {categoriesData.categories.length === 0 ? (
          <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
            Chưa có thể loại.
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {categoriesData.categories.map((category) => (
              <Link
                key={category.id}
                href={`/the-loai/${category.slug}`}
                className="rounded-full border px-3 py-1.5 text-sm hover:bg-muted"
              >
                {category.name}
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
