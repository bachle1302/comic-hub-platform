"use client";

import { useEffect, useState } from "react";
import { hasAccessToken } from "@/shared/auth/token-storage";
import type { RecommendationItem } from "../api/recommendations.schema";
import { getMyRecommendations } from "../api/recommendations.api";
import { RecommendationSection } from "./RecommendationSection";

import { clientApiGet } from "@/shared/api/client-api";
import { recommendationsResultSchema } from "../api/recommendations.schema";

type PersonalizedRecommendationSectionProps = {
  limit?: number;
};

export function PersonalizedRecommendationSection({
  limit = 12,
}: PersonalizedRecommendationSectionProps) {
  const [items, setItems] = useState<RecommendationItem[]>([]);
  const [isPersonalized, setIsPersonalized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const fetchRecommendations = async () => {
      try {
        if (hasAccessToken()) {
          const result = await getMyRecommendations(limit);
          if (!cancelled) {
            setItems(result.items);
            setIsPersonalized(true);
            setIsLoading(false);
          }
        } else {
          const result = await clientApiGet(
            `/recommendations/home?limit=${limit}`,
            recommendationsResultSchema
          );
          if (!cancelled) {
            setItems(result.items);
            setIsPersonalized(false);
            setIsLoading(false);
          }
        }
      } catch {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void fetchRecommendations();

    return () => {
      cancelled = true;
    };
  }, [limit]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-6 w-48 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 xl:grid-cols-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="aspect-[3/4] animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-800" />
          ))}
        </div>
      </div>
    );
  }

  if (items.length === 0) return null;

  return (
    <RecommendationSection
      title="Gợi ý dành cho bạn"
      description={
        isPersonalized
          ? "Dựa trên lịch sử đọc và sở thích của bạn."
          : "Những bộ truyện đang được nhiều độc giả yêu thích."
      }
      items={items}
    />
  );
}
