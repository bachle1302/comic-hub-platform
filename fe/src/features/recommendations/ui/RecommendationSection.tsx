import { SectionTitle } from "@/shared/ui";
import type { RecommendationItem } from "../api/recommendations.schema";
import { RecommendationCard } from "./RecommendationCard";

type RecommendationSectionProps = {
  title?: string;
  description?: string;
  items: RecommendationItem[];
};

/**
 * Server-rendered section that displays a grid of recommendation cards.
 * Used for:
 * - Homepage home fallback (SSR / ISR)
 * - Comic detail page similar comics
 */
export function RecommendationSection({
  title = "Gợi ý dành cho bạn",
  description,
  items,
}: RecommendationSectionProps) {
  if (items.length === 0) return null;

  return (
    <section className="space-y-5">
      <SectionTitle title={title} description={description} />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 xl:grid-cols-6">
        {items.map((item, index) => (
          <RecommendationCard key={item.id} item={item} priority={index < 2} />
        ))}
      </div>
    </section>
  );
}
