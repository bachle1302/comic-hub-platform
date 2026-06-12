import type { Metadata } from "next";
import Link from "next/link";
import { CategoryCloud, getCategories } from "@/features/categories";
import {
  FeaturedComicsSection,
  LatestComicsSection,
  CompletedComicsSection,
  PopularComicsSidebarSection,
  HeroImageCarousel,
  getHotComics,
  getLatestComics,
  type Comic,
} from "@/features/comics";
import { PersonalizedRecommendationSection } from "@/features/recommendations";
import { LazyLoad } from "@/shared/ui";

export const metadata: Metadata = {
  title: "Đọc truyện tranh online - Truyện mới cập nhật",
  description:
    "Khám phá truyện tranh mới cập nhật, truyện hot và nhiều thể loại hấp dẫn.",
};

export const revalidate = 60;

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
  const [
    latestComics,
    hotComics,
    categoriesData,
  ] = await Promise.all([
    safeLoad(getLatestComics(), []),
    safeLoad(getHotComics(), []),
    safeLoad(getCategories(), { categories: [] }),
  ]);

  const heroComics = uniqueComics([...hotComics, ...latestComics]).slice(0, 8);

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

        {/* Personalized / Fallback Recommendations */}
          <FeaturedComicsSection />
          <PersonalizedRecommendationSection limit={12} />

        {/* Recommended Comics */}

        {/* Two Column Layout (Content & Sidebar) */}
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-10">
              <LatestComicsSection />

              {/* <CompletedComicsSection /> */}
          </div>

          {/* Sidebar Area */}
          <div className="space-y-5 lg:sticky lg:top-24 lg:self-start">
              <PopularComicsSidebarSection />
            <CategoryCloud categories={categoriesData.categories} />
          </div>
        </div>
      </div>
    </div>
  );
}
