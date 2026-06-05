export default function ReaderLoading() {
  return (
    <div className="space-y-5">
      <div className="mx-auto max-w-3xl space-y-3 text-center">
        <div className="mx-auto h-7 w-2/3 animate-pulse rounded bg-muted" />
        <div className="mx-auto h-4 w-1/3 animate-pulse rounded bg-muted" />
        <div className="mx-auto h-10 w-full max-w-md animate-pulse rounded bg-muted" />
      </div>
      <div className="mx-auto h-[70vh] max-w-5xl animate-pulse rounded-lg bg-muted" />
    </div>
  );
}
