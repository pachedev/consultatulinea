export function SkeletonCard() {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-line bg-surface p-4">
      <div className="size-10 shrink-0 animate-pulse rounded-full bg-line" />
      <div className="flex-1 space-y-2">
        <div className="h-3.5 w-32 animate-pulse rounded bg-line" />
        <div className="h-3 w-24 animate-pulse rounded bg-line" />
      </div>
    </div>
  );
}
