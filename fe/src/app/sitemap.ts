import type { MetadataRoute } from "next";
import { getCategories } from "@/features/categories";
import { getAllComics, getComicDetail, type Comic } from "@/features/comics";
import { SITE_URL } from "@/shared/config/env";

type SitemapEntry = MetadataRoute.Sitemap[number];

function absoluteUrl(path: string): string {
  return `${SITE_URL}${path}`;
}

function staticRoutes(): MetadataRoute.Sitemap {
  const now = new Date();

  return [
    {
      url: absoluteUrl("/"),
      lastModified: now,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: absoluteUrl("/truyen"),
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: absoluteUrl("/bang-xep-hang"),
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: absoluteUrl("/tim-kiem"),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.6,
    },
    {
      url: absoluteUrl("/dieu-khoan"),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: absoluteUrl("/chinh-sach-bao-mat"),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: absoluteUrl("/chinh-sach-thanh-toan"),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: absoluteUrl("/lien-he"),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.4,
    },
  ];
}

function comicLastModified(comic: Comic): Date {
  return new Date(comic.updatedAt ?? comic.lastChapterAt ?? comic.createdAt);
}

function dateFromOptionalString(value?: string): Date {
  return value ? new Date(value) : new Date();
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const routes = staticRoutes();

  try {
    const [categoriesData, comics] = await Promise.all([
      getCategories(),
      getAllComics(),
    ]);

    const categoryRoutes: SitemapEntry[] = categoriesData.categories.map(
      (category) => ({
        url: absoluteUrl(`/the-loai/${category.slug}`),
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.7,
      }),
    );

    const comicRoutes: SitemapEntry[] = comics.map((comic) => ({
      url: absoluteUrl(`/truyen/${comic.slug}`),
      lastModified: comicLastModified(comic),
      changeFrequency: "daily",
      priority: 0.8,
    }));

    const detailResults = await Promise.allSettled(
      comics.map((comic) => getComicDetail(comic.slug)),
    );
    const chapterRoutes: SitemapEntry[] = detailResults.flatMap((result) => {
      if (result.status !== "fulfilled") {
        return [];
      }

      return result.value.chapters.map((chapter) => ({
        url: absoluteUrl(
          `/truyen/${result.value.slug}/chapter/${chapter.chapterNumber}`,
        ),
        lastModified: dateFromOptionalString(chapter.updatedAt ?? chapter.createdAt),
        changeFrequency: "weekly" as const,
        priority: 0.6,
      }));
    });

    return [...routes, ...categoryRoutes, ...comicRoutes, ...chapterRoutes];
  } catch {
    return routes;
  }
}
