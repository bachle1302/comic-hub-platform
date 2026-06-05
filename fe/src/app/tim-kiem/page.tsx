import type { Metadata } from "next";
import { ComicGrid, type ComicStatus } from "@/features/comics";
import {
  searchComics,
  type ComicSort,
  type SearchComicsQuery,
} from "@/features/search";
import { PageContainer, SectionHeader } from "@/shared/ui";

type SearchPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const metadata: Metadata = {
  title: "Tìm kiếm truyện - Đọc truyện tranh online",
  description: "Tìm kiếm truyện tranh theo tên, thể loại và trạng thái.",
};

export const revalidate = 30;
export const dynamic = "force-dynamic";

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function toNumber(value: string | undefined): number | undefined {
  if (!value) {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const keyword = firstParam(params.q);
  const query: SearchComicsQuery = {
    q: keyword,
    category: firstParam(params.category),
    status: firstParam(params.status) as ComicStatus | undefined,
    sort: firstParam(params.sort) as ComicSort | undefined,
    page: toNumber(firstParam(params.page)),
    limit: toNumber(firstParam(params.limit)),
  };
  const result = await searchComics(query);

  return (
    <PageContainer>
      <SectionHeader
        title="Tim kiem"
        description={
          keyword
            ? `${result.meta.total.toLocaleString("vi-VN")} ket qua cho "${keyword}"`
            : `${result.meta.total.toLocaleString("vi-VN")} ket qua`
        }
      />
      <ComicGrid comics={result.items} />
      <p className="rounded-lg border bg-muted/20 p-3 text-sm text-muted-foreground">
        Trang {result.meta.page} / {result.meta.totalPages || 1}
      </p>
    </PageContainer>
  );
}
