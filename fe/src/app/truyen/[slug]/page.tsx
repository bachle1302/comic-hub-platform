/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import Link from "next/link";
import { CommentSection } from "@/features/comments";
import { ChapterList, ComicLikeButton, getComicDetail, getAllComics } from "@/features/comics";
import { FollowButton } from "@/features/follows";
import { ContinueReadingButton } from "@/features/histories";
import {
  RecommendationSection,
  getSimilarComics,
} from "@/features/recommendations";
import { PageContainer, SectionHeader } from "@/shared/ui";
import { formatCompactNumber } from "@/shared/utils/format";
import {
  absoluteUrl,
  createOpenGraphImages,
  createPageTitle,
} from "@/shared/seo/metadata";
import { ComicDescription } from "./ComicDescription";

type ComicDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export const revalidate = 60;

export async function generateStaticParams() {
  try {
    const comics = await getAllComics();
    return comics.map((comic) => ({
      slug: comic.slug,
    }));
  } catch (error) {
    console.error("Failed to generate static params for comics:", error);
    return [];
  }
}

export async function generateMetadata({
  params,
}: ComicDetailPageProps): Promise<Metadata> {
  try {
    const { slug } = await params;
    const comic = await getComicDetail(slug);
    const title = comic.seoTitle ?? createPageTitle(comic.name);
    const description =
      comic.seoDescription ??
      comic.description ??
      `Đọc ${comic.name} online, cập nhật nhanh các chapter mới nhất.`;
    const url = absoluteUrl(`/truyen/${comic.slug}`);
    const images = createOpenGraphImages(comic.thumbnail);

    return {
      title,
      description,
      alternates: {
        canonical: `/truyen/${comic.slug}`,
      },
      openGraph: {
        title,
        description,
        url,
        images,
        type: "article",
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images,
      },
    };
  } catch {
    return {
      title: "Truyện tranh - Đọc truyện tranh online",
      description: "Đọc truyện tranh online, cập nhật nhanh các chapter mới.",
    };
  }
}

const statusLabels: Record<string, string> = {
  CANCELLED: "Đã hủy",
  COMPLETED: "Hoàn thành",
  HIATUS: "Tạm dừng",
  ONGOING: "Đang ra",
};

export default async function ComicDetailPage({ params }: ComicDetailPageProps) {
  const { slug } = await params;
  const [comic, similarComicsResult] = await Promise.all([
    getComicDetail(slug),
    getSimilarComics(slug, 6).catch(() => ({ items: [], meta: { total: 0, limit: 6 } })),
  ]);
  const sortedChapters = [...comic.chapters].sort(
    (left, right) => right.chapterNumber - left.chapterNumber,
  );
  const firstChapter = sortedChapters.at(-1) ?? null;
  const latestChapter = sortedChapters.at(0) ?? null;

  return (
    <div className="-mx-4 -my-6 min-h-screen bg-background px-4 py-6 text-foreground">
      <PageContainer className="mx-auto max-w-7xl">
        <div className="grid gap-6 rounded-xl border bg-card p-4 shadow-sm md:grid-cols-[260px_1fr] md:p-5">
          <div className="aspect-[2/3] overflow-hidden rounded-lg border bg-muted shadow-sm">
            {comic.thumbnail ? (
              <img
                src={comic.thumbnail}
                alt={comic.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex  h-full items-center justify-center bg-gradient-to-br from-muted to-muted/50 text-sm text-muted-foreground">
                Chưa có ảnh
              </div>
            )}
          </div>

          <div className="space-y-5">
            <div>
              <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
                {comic.name}
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Tác giả: {comic.author?.name ?? "Đang cập nhật"}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {comic.categories?.map((item) => (
                <Link
                  key={item.category.id}
                  href={`/the-loai/${item.category.slug}`}
                  className="rounded-full border px-3 py-1 text-xs hover:bg-muted"
                >
                  {item.category.name}
                </Link>
              ))}
            </div>

            <dl className="grid grid-cols-2 gap-3 text-sm md:grid-cols-5">
              <div className="rounded-lg border p-3">
                <dt className="text-muted-foreground">Trạng thái</dt>
                <dd className="font-medium">{statusLabels[comic.status] ?? comic.status}</dd>
              </div>
              <div className="rounded-lg border p-3">
                <dt className="text-muted-foreground">Tổng lượt xem</dt>
                <dd className="font-medium">{formatCompactNumber(comic.viewTotal)}</dd>
              </div>
              <div className="rounded-lg border p-3">
                <dt className="text-muted-foreground">Chương</dt>
                <dd className="font-medium">{comic.chapters.length}</dd>
              </div>
              <div className="rounded-lg border p-3">
                <dt className="text-muted-foreground">Theo dõi</dt>
                <dd className="font-medium">
                  {formatCompactNumber(comic.followCount)}
                </dd>
              </div>
              <div className="rounded-lg border p-3">
                <dt className="text-muted-foreground">Lượt thích</dt>
                <dd className="font-medium">
                  {formatCompactNumber(comic.likeCount)}
                </dd>
              </div>
            </dl>

            {comic.chapters.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                <ContinueReadingButton comicId={comic.id} comicSlug={comic.slug} />
                {firstChapter ? (
                  <Link
                    href={`/truyen/${comic.slug}/chapter/${firstChapter.chapterNumber}`}
                    className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                  >
                    Đọc từ đầu
                  </Link>
                ) : null}
                {latestChapter ? (
                  <Link
                    href={`/truyen/${comic.slug}/chapter/${latestChapter.chapterNumber}`}
                    className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted"
                  >
                    Đọc mới nhất
                  </Link>
                ) : null}
              </div>
            ) : null}

            <div className="flex flex-wrap gap-2">
              <FollowButton comicId={comic.id} />
              <ComicLikeButton
                comicId={comic.id}
                initialLikeCount={comic.likeCount}
              />
            </div>

            <div className="rounded-lg bg-muted/30 p-4">
              <ComicDescription description={comic.description} />
            </div>
          </div>
        </div>

        <section className="space-y-3">
          <SectionHeader title="Danh sách chương" />
          <ChapterList chapters={sortedChapters} comicSlug={comic.slug} />
        </section>

        <CommentSection targetId={comic.id} targetType="comic" />

        {/* Similar Comics */}
        {similarComicsResult.items.length > 0 ? (
          <RecommendationSection
            title="Truyện tương tự"
            description="Có thể bạn cũng sẽ thích những bộ truyện này."
            items={similarComicsResult.items}
          />
        ) : null}
      </PageContainer>
    </div>
  );
}
