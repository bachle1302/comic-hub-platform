type SkeletonCardProps = {
  compact?: boolean;
};

export function SkeletonCard({ compact = false }: SkeletonCardProps) {
  return (
    <div className="overflow-hidden rounded-lg border bg-card">
      <div className="aspect-[2/3] animate-pulse bg-muted" />
      <div className={compact ? "space-y-2 p-2" : "space-y-3 p-3"}>
        <div className="h-4 w-full animate-pulse rounded bg-muted" />
        <div className="h-3 w-2/3 animate-pulse rounded bg-muted" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
      </div>
    </div>
  );
}
