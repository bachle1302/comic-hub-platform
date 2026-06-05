import type { Metadata } from "next";
import { CommentSection } from "@/features/comments";
import { ReaderClientSection, ReaderNavigation, getChapter } from "@/features/reader";
import { absoluteUrl, createOpenGraphImages } from "@/shared/seo/metadata";

type ReaderPageProps = {
  params: Promise<{
    chapterNumber: string;
    slug: string;
  }>;
  searchParams?: Promise<{
    continue?: string | string[];
  }>;
};

export const revalidate = 120;
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: ReaderPageProps): Promise<Metadata> {
  try {
    const { chapterNumber, slug } = await params;
    const reader = await getChapter(slug, chapterNumber);
    const resolvedChapterNumber =
      reader.chapter?.chapterNumber ??
      reader.chapterNumber ??
      Number(chapterNumber);
    const chapterName =
      reader.chapter?.name ?? reader.name ?? `Chapter ${chapterNumber}`;
    const title = `${reader.comic.name} - Chapter ${resolvedChapterNumber}: ${chapterName}`;
    const description = `Đọc ${reader.comic.name} chapter ${resolvedChapterNumber} online.`;
    const url = absoluteUrl(
      `/truyen/${reader.comic.slug}/chapter/${resolvedChapterNumber}`,
    );
    const images = createOpenGraphImages(reader.comic.thumbnail);

    return {
      title,
      description,
      alternates: {
        canonical: `/truyen/${slug}/chapter/${chapterNumber}`,
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
      title: "Đọc chapter - Đọc truyện tranh online",
      description: "Đọc chapter truyện tranh online.",
    };
  }
}

export default async function ReaderPage({ params, searchParams }: ReaderPageProps) {
  const { chapterNumber, slug } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const continueParam = resolvedSearchParams.continue;
  const shouldResumeFromHistory = Array.isArray(continueParam)
    ? continueParam.includes("1")
    : continueParam === "1";
  const reader = await getChapter(slug, chapterNumber);
  const chapterName =
    reader.chapter?.name ?? reader.name ?? `Chapter ${chapterNumber}`;
  const resolvedChapterNumber =
    reader.chapter?.chapterNumber ?? reader.chapterNumber ?? Number(chapterNumber);
  const chapterPrice = reader.chapter?.price ?? reader.price ?? 0;
  const chapterId = reader.chapter?.id ?? reader.id ?? null;

  return (
    <div className="space-y-6">
      <header className="mx-auto max-w-5xl space-y-4 rounded-xl border bg-card p-4 text-center shadow-sm">
        <div>
          <h1 className="text-xl font-bold md:text-2xl">
            {reader.comic.name}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Chapter {resolvedChapterNumber}: {chapterName}
          </p>
        </div>

        <div className="flex justify-center">
          <span
            className={
              chapterPrice > 0
                ? "rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-700 dark:text-amber-300"
                : "rounded-full border border-green-600/40 bg-green-600/10 px-3 py-1 text-xs font-medium text-green-700 dark:text-green-300"
            }
          >
            {chapterPrice > 0 ? `${chapterPrice} coin` : "Mien phi"}
          </span>
        </div>

        <ReaderNavigation
          comicSlug={reader.comic.slug}
          nextChapter={reader.navigation.nextChapter}
          previousChapter={reader.navigation.previousChapter}
        />
      </header>

      <ReaderClientSection
        chapterNumber={chapterNumber}
        initialReader={reader}
        shouldResumeFromHistory={shouldResumeFromHistory}
        slug={slug}
      />

      <div className="mx-auto max-w-5xl rounded-xl border bg-card p-4 shadow-sm">
        <ReaderNavigation
          comicSlug={reader.comic.slug}
          nextChapter={reader.navigation.nextChapter}
          previousChapter={reader.navigation.previousChapter}
        />
      </div>

      {chapterId ? <CommentSection targetId={chapterId} targetType="chapter" /> : null}
    </div>
  );
}
