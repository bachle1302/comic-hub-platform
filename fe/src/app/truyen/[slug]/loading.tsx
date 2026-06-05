export default function ComicDetailLoading() {
  return (
    <div className="grid gap-6 md:grid-cols-[240px_1fr]">
      <div className="aspect-[2/3] animate-pulse rounded-lg bg-muted" />
      <div className="space-y-4">
        <div className="h-8 w-2/3 animate-pulse rounded bg-muted" />
        <div className="h-4 w-1/3 animate-pulse rounded bg-muted" />
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-16 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
        <div className="h-28 animate-pulse rounded-lg bg-muted" />
      </div>
    </div>
  );
}
