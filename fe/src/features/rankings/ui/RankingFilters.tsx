"use client";

import { useRouter, useSearchParams } from "next/navigation";
import type { RankingPeriod, RankingType } from "../api/rankings.schema";

type RankingFiltersProps = {
  type: RankingType;
  period: RankingPeriod;
};

const rankingTypeOptions: Array<{ label: string; value: RankingType }> = [
  { label: "Hot", value: "hot" },
  { label: "Lượt xem", value: "views" },
  { label: "Lượt thích", value: "likes" },
  { label: "Theo dõi", value: "follows" },
  { label: "Mới cập nhật", value: "latest" },
];

const rankingPeriodOptions: Array<{ label: string; value: RankingPeriod }> = [
  { label: "Tất cả", value: "all" },
  { label: "Ngày", value: "day" },
  { label: "Tuần", value: "week" },
  { label: "Tháng", value: "month" },
];

export function RankingFilters({ period, type }: RankingFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function updateQuery(next: {
    period?: RankingPeriod;
    type?: RankingType;
  }) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("type", next.type ?? type);
    params.set("period", next.period ?? period);
    params.delete("page");
    router.push(`/bang-xep-hang?${params.toString()}`);
  }

  return (
    <div className="space-y-4 rounded-lg border bg-card p-4">
      <div className="space-y-2">
        <p className="text-sm font-medium">Sắp xếp</p>
        <div className="flex flex-wrap gap-2">
          {rankingTypeOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => updateQuery({ type: option.value })}
              className={
                option.value === type
                  ? "rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground"
                  : "rounded-md border px-3 py-1.5 text-sm hover:bg-muted"
              }
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium">Thời gian</p>
        <div className="flex flex-wrap gap-2">
          {rankingPeriodOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => updateQuery({ period: option.value })}
              className={
                option.value === period
                  ? "rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground"
                  : "rounded-md border px-3 py-1.5 text-sm hover:bg-muted"
              }
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
