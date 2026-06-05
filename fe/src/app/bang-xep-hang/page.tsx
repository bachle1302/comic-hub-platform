import type { Metadata } from "next";
import Link from "next/link";
import {
  getComicRankings,
  RankingComicList,
  RankingFilters,
  rankingPeriodSchema,
  rankingTypeSchema,
  type RankingPeriod,
  type RankingType,
} from "@/features/rankings";
import { PageContainer, SectionHeader } from "@/shared/ui";

type RankingPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const DEFAULT_TYPE: RankingType = "hot";
const DEFAULT_PERIOD: RankingPeriod = "all";
const DEFAULT_LIMIT = 20;

export const metadata: Metadata = {
  title: "Bang xep hang truyen - Doc truyen tranh online",
  description:
    "Xem truyen hot, truyen nhieu luot xem, nhieu luot thich va duoc theo doi nhieu nhat.",
};

export const revalidate = 60;
export const dynamic = "force-dynamic";

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

function parseRankingType(value: string | undefined): RankingType {
  const parsed = rankingTypeSchema.safeParse(value);
  return parsed.success ? parsed.data : DEFAULT_TYPE;
}

function parseRankingPeriod(value: string | undefined): RankingPeriod {
  const parsed = rankingPeriodSchema.safeParse(value);
  return parsed.success ? parsed.data : DEFAULT_PERIOD;
}

function rankingHref(input: {
  page: number;
  period: RankingPeriod;
  type: RankingType;
}) {
  const params = new URLSearchParams({
    type: input.type,
    period: input.period,
    page: String(input.page),
  });

  return `/bang-xep-hang?${params.toString()}`;
}

export default async function RankingPage({ searchParams }: RankingPageProps) {
  const params = await searchParams;
  const type = parseRankingType(firstParam(params.type));
  const period = parseRankingPeriod(firstParam(params.period));
  const page = toPositiveNumber(firstParam(params.page), 1);
  const result = await getComicRankings({
    type,
    period,
    page,
    limit: DEFAULT_LIMIT,
  });
  const startRank = (result.meta.page - 1) * result.meta.limit + 1;

  return (
    <PageContainer>
      <SectionHeader
        title="Bang xep hang truyen"
        description="Theo doi nhung truyen dang noi bat theo luot xem, luot thich, theo doi va cap nhat moi."
      />

      <RankingFilters period={period} type={type} />

      <RankingComicList
        comics={result.items}
        period={period}
        startRank={startRank}
        type={type}
      />

      <p className="rounded-lg border bg-muted/20 p-3 text-sm text-muted-foreground">
        Du lieu co the duoc cache trong vai phut.
      </p>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-muted/20 p-3 text-sm">
        <span className="text-muted-foreground">
          Trang {result.meta.page} / {result.meta.totalPages || 1}
        </span>
        <div className="flex gap-2">
          {result.meta.hasPreviousPage ? (
            <Link
              href={rankingHref({
                type,
                period,
                page: Math.max(1, result.meta.page - 1),
              })}
              className="rounded-md border px-3 py-1.5 hover:bg-muted"
            >
              Trang truoc
            </Link>
          ) : (
            <span className="rounded-md border px-3 py-1.5 text-muted-foreground">
              Trang truoc
            </span>
          )}
          {result.meta.hasNextPage ? (
            <Link
              href={rankingHref({
                type,
                period,
                page: result.meta.page + 1,
              })}
              className="rounded-md border px-3 py-1.5 hover:bg-muted"
            >
              Trang sau
            </Link>
          ) : (
            <span className="rounded-md border px-3 py-1.5 text-muted-foreground">
              Trang sau
            </span>
          )}
        </div>
      </div>
    </PageContainer>
  );
}
