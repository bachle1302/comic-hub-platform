type RecommendationReasonBadgesProps = {
  reasons: string[];
};

/**
 * Displays up to 2 reason badges under a recommendation card.
 * Neutral styling: bg-white/5 text-gray-300 border border-white/10.
 * Only the "HOT" badge uses a warm accent color.
 */
export function RecommendationReasonBadges({
  reasons,
}: RecommendationReasonBadgesProps) {
  if (reasons.length === 0) return null;

  const displayed = reasons.slice(0, 2);

  return (
    <div className="flex flex-wrap gap-1 pt-1">
      {displayed.map((reason) => {
        const isHot =
          reason.toLowerCase().includes("hot") ||
          reason.includes("phổ biến") ||
          reason.includes("theo dõi nhiều");

        return (
          <span
            key={reason}
            className={
              isHot
                ? "inline-flex items-center rounded-full border border-orange-500/30 bg-orange-500/10 px-2 py-0.5 text-[10px] font-medium text-orange-400"
                : "inline-flex items-center rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-medium text-gray-400 dark:text-gray-300"
            }
          >
            {reason}
          </span>
        );
      })}
    </div>
  );
}
