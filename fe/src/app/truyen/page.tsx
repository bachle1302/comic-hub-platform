import type { Metadata } from "next";
import Link from "next/link";
import { getComicRankings } from "@/features/rankings";
import { ComicGrid, type Comic } from "@/features/comics";
import { PageContainer, SectionHeader } from "@/shared/ui";

export const metadata: Metadata = {
  title: "Truyện cập nhật mới nhất - Đọc truyện tranh online",
  description:
    "Danh sách truyện tranh mới nhất, hot nhất và được cập nhật liên tục.",
};

export const revalidate = 60;

type ComicsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function toPositiveNumber(value: string | undefined, fallback: number): number {
  if (!value) {
    return fallback;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : fallback;
}

function comicsHref(page: number) {
  return `/truyen?page=${page}`;
}

export default async function ComicsPage({ searchParams }: ComicsPageProps) {
  const params = await searchParams;
  const page = toPositiveNumber(firstParam(params.page), 1);
  const result = await getComicRankings({
    type: "latest",
    page,
    limit: 18,
  });

  return (
    <PageContainer>
      <SectionHeader
        title="Truyện cập nhật mới nhất"
        description="Danh sách truyện tranh cập nhật chương mới liên tục trên hệ thống."
      />

      <ComicGrid comics={result.items as unknown as Comic[]} />

      {/* Pagination Footer */}
      <div className="mt-8 flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-muted/20 p-3 text-sm">
        <span className="text-muted-foreground">
          Trang {result.meta.page} / {result.meta.totalPages || 1}
        </span>
        <div className="flex gap-2">
          {result.meta.hasPreviousPage ? (
            <Link
              href={comicsHref(Math.max(1, result.meta.page - 1))}
              className="rounded-md border px-3 py-1.5 hover:bg-muted"
            >
              Trang trước
            </Link>
          ) : (
            <span className="rounded-md border px-3 py-1.5 text-muted-foreground opacity-50">
              Trang trước
            </span>
          )}
          {result.meta.hasNextPage ? (
            <Link
              href={comicsHref(result.meta.page + 1)}
              className="rounded-md border px-3 py-1.5 hover:bg-muted"
            >
              Trang sau
            </Link>
          ) : (
            <span className="rounded-md border px-3 py-1.5 text-muted-foreground opacity-50">
              Trang sau
            </span>
          )}
        </div>
      </div>
    </PageContainer>
  );
}
