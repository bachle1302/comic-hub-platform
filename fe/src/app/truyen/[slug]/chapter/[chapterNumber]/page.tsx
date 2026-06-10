import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, Info } from "lucide-react";
import { CommentSection } from "@/features/comments";
import { ReaderClientSection, ReaderNavigation, getChapter } from "@/features/reader";
import { getAllComics, getComicDetail } from "@/features/comics";
import { absoluteUrl, createOpenGraphImages } from "@/shared/seo/metadata";
import { formatDate } from "@/shared/utils/format";

type ReaderPageProps = {
  params: Promise<{
    chapterNumber: string;
    slug: string;
  }>;
};

export const revalidate = 120;

export async function generateStaticParams() {
  try {
    const comics = await getAllComics();
    const results = await Promise.allSettled(
      comics.map((comic) => getComicDetail(comic.slug)),
    );

    const params: Array<{ slug: string; chapterNumber: string }> = [];

    for (const result of results) {
      if (result.status === "fulfilled") {
        const comicDetail = result.value;
        for (const chapter of comicDetail.chapters) {
          params.push({
            slug: comicDetail.slug,
            chapterNumber: String(chapter.chapterNumber),
          });
        }
      }
    }

    return params;
  } catch (error) {
    console.error("Failed to generate static params for reader pages:", error);
    return [];
  }
}

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

export default async function ReaderPage({ params }: ReaderPageProps) {
  const { chapterNumber, slug } = await params;
  const reader = await getChapter(slug, chapterNumber);
  const chapterName =
    reader.chapter?.name ?? reader.name ?? `Chapter ${chapterNumber}`;
  const resolvedChapterNumber =
    reader.chapter?.chapterNumber ?? reader.chapterNumber ?? Number(chapterNumber);
  const chapterId = reader.chapter?.id ?? reader.id ?? null;

  const updatedAtString = reader.chapter?.updatedAt ?? reader.updatedAt ?? reader.chapter?.createdAt ?? reader.createdAt ?? "";
  const formattedDate = updatedAtString ? formatDate(updatedAtString) : "";

  return (
    <div className="space-y-6">
      <header className="mx-auto max-w-5xl space-y-5 rounded-xl border border-border bg-card p-6 shadow-sm">
        {/* Breadcrumbs */}
        <nav className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
          <Link href="/" prefetch={false} className="hover:text-foreground transition-colors">
            Trang Chủ
          </Link>
          <span>/</span>
          <Link href={`/truyen/${reader.comic.slug}`} prefetch={false} className="hover:text-foreground transition-colors">
            {reader.comic.name}
          </Link>
          <span>/</span>
          <span className="font-semibold text-foreground">{chapterName}</span>
        </nav>

        {/* Title and Updated Time */}
        <div className="space-y-1 text-left">
          <h1 className="text-xl font-extrabold tracking-tight text-foreground md:text-2xl">
            {reader.comic.name} - Chapter {resolvedChapterNumber}
          </h1>
          {formattedDate ? (
            <p className="text-xs text-muted-foreground">
              (Cập nhật lúc: {formattedDate})
            </p>
          ) : null}
        </div>

        {/* Action Button: Báo Lỗi Chương */}
        <div className="flex justify-center pt-2">
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-full bg-[#F5C451] hover:bg-[#E2B340] px-5 py-2 text-xs font-bold text-zinc-950 shadow transition-colors"
          >
            <AlertTriangle className="size-3.5 fill-current" />
            Báo Lỗi Chương
          </button>
        </div>

        {/* Inform Box */}
        <div className="flex items-center justify-center gap-2 rounded-lg border border-blue-500/20 bg-blue-500/5 px-4 py-2.5 text-xs italic text-blue-500 dark:text-blue-400">
          <Info className="size-3.5 shrink-0" />
          <span>Sử dụng mũi tên trái (←) hoặc phải (→) để chuyển chapter</span>
        </div>

        <ReaderNavigation
          comicSlug={reader.comic.slug}
          nextChapter={reader.navigation.nextChapter}
          previousChapter={reader.navigation.previousChapter}
        />
      </header>

      <Suspense fallback={<p className="text-center text-sm text-muted-foreground my-8">Đang tải nội dung chương...</p>}>
        <ReaderClientSection
          chapterNumber={chapterNumber}
          initialReader={reader}
          slug={slug}
        />
      </Suspense>

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
