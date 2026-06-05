import type { Metadata } from "next";
import { ComicGrid, type ComicStatus } from "@/features/comics";
import {
  getCategoryComics,
  type CategoryComicsQuery,
} from "@/features/categories";
import type { ComicSort } from "@/features/search";
import { PageContainer, SectionHeader } from "@/shared/ui";

type CategoryPageProps = {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const revalidate = 60;
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

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;

  return {
    title: `Thể loại ${slug} - Đọc truyện tranh online`,
    description: `Danh sách truyện thuộc thể loại ${slug}.`,
    alternates: {
      canonical: `/the-loai/${slug}`,
    },
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: CategoryPageProps) {
  const [{ slug }, rawSearchParams] = await Promise.all([params, searchParams]);
  const query: CategoryComicsQuery = {
    status: firstParam(rawSearchParams.status) as ComicStatus | undefined,
    sort: firstParam(rawSearchParams.sort) as ComicSort | undefined,
    page: toNumber(firstParam(rawSearchParams.page)),
    limit: toNumber(firstParam(rawSearchParams.limit)),
  };
  const result = await getCategoryComics(slug, query);

  return (
    <PageContainer>
      <SectionHeader
        title={`The loai ${slug}`}
        description={`${result.meta.total.toLocaleString("vi-VN")} truyen`}
      />
      <ComicGrid comics={result.items} />
    </PageContainer>
  );
}
