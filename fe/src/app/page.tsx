import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CategoryCloud, getCategories } from "@/features/categories";
import {
  ComicPosterCard,
  ComicSection,
  HeroImageCarousel,
  PopularComicSidebar,
  getAllComics,
  getHotComics,
  getLatestComics,
  type Comic,
} from "@/features/comics";
import { getComicRankings } from "@/features/rankings";
import { SectionTitle } from "@/shared/ui";

export const metadata: Metadata = {
  title: "Đọc truyện tranh online - Truyện mới cập nhật",
  description:
    "Khám phá truyện tranh mới cập nhật, truyện hot và nhiều thể loại hấp dẫn.",
};

export const revalidate = 60;
export const dynamic = "force-dynamic";

async function safeLoad<T>(task: Promise<T>, fallback: T): Promise<T> {
  try {
    return await task;
  } catch {
    return fallback;
  }
}

function uniqueComics(comics: Comic[]): Comic[] {
  const map = new Map<number, Comic>();

  for (const comic of comics) {
    map.set(comic.id, comic);
  }

  return Array.from(map.values());
}

export default async function HomePage() {
  const [latestComics, hotComics, allComics, categoriesData, likedComicsData] =
    await Promise.all([
      safeLoad(getLatestComics(), []),
      safeLoad(getHotComics(), []),
      safeLoad(getAllComics(), []),
      safeLoad(getCategories(), { categories: [] }),
      safeLoad(getComicRankings({ type: "likes", limit: 6 }), {
        items: [],
        meta: { page: 1, limit: 6, total: 0, totalPages: 0, hasNextPage: false, hasPreviousPage: false },
      }),
    ]);

  const heroComics = uniqueComics([...hotComics, ...latestComics]).slice(0, 8);
  const featuredComics = uniqueComics([...hotComics, ...allComics]).slice(0, 6);
  const completedComics = allComics
    .filter((comic) => comic.status === "COMPLETED")
    .slice(0, 6);

  return (
    <div className="-mx-4 -my-6 bg-background px-4 py-6 text-foreground">
      <div className="mx-auto max-w-7xl space-y-10">
        {/* Banner Carousel */}
        <HeroImageCarousel comics={heroComics} />

        {/* Categories Strip */}
        <section className="space-y-5">
          <div className="flex flex-wrap gap-2">
            {categoriesData.categories.slice(0, 12).map((category) => (
              <Link
                key={category.id}
                href={`/the-loai/${category.slug}`}
                prefetch={false}
                className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold text-muted-foreground transition hover:border-zinc-300 dark:hover:border-zinc-700 hover:text-foreground"
              >
                {category.name}
              </Link>
            ))}
          </div>
        </section>

        {/* Recommended Comics */}
        <ComicSection
          title="Truyện đề cử"
          description="Các bộ truyện nổi bật đang được nhiều độc giả quan tâm."
          href="/truyen"
          comics={featuredComics}
        />

        {/* Two Column Layout (Content & Sidebar) */}
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-10">
            <ComicSection
              title="Cập nhật mới nhất"
              description="Những chapter vừa lên sóng, sắp xếp theo dữ liệu từ hệ thống."
              href="/truyen"
              comics={latestComics.slice(0, 18)}
            />

            {completedComics.length > 0 ? (
              <section className="space-y-5">
                <SectionTitle
                  title="Truyện đã hoàn thành"
                  description="Đọc liền mạch các bộ đã kết thúc."
                  action={
                    <Link
                      href="/truyen?status=COMPLETED"
                      prefetch={false}
                      className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-sm font-semibold text-muted-foreground transition hover:border-zinc-300 dark:hover:border-zinc-700 hover:text-foreground"
                    >
                      Xem thêm
                      <ArrowRight className="size-4" />
                    </Link>
                  }
                />
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 xl:grid-cols-6">
                  {completedComics.map((comic, index) => (
                    <ComicPosterCard
                      key={comic.id}
                      comic={comic}
                      priority={index < 2}
                      variant="compact"
                    />
                  ))}
                </div>
              </section>
            ) : null}
          </div>

          {/* Sidebar Area */}
          <div className="space-y-5 lg:sticky lg:top-24 lg:self-start">
            <PopularComicSidebar comics={likedComicsData.items} />
            <CategoryCloud categories={categoriesData.categories} />
          </div>
        </div>
      </div>
    </div>
  );
}
