export default function SkeletonCard() {
  return (
    <div className="rounded-xl border border-border-default bg-card p-4 animate-pulse">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-12 h-12 rounded-full bg-bar" />
        <div className="flex-1 space-y-2">
          <div className="h-3 bg-bar rounded w-24" />
          <div className="h-2 bg-bar rounded w-16" />
        </div>
        <div className="space-y-2 text-right">
          <div className="h-4 bg-bar rounded w-20" />
          <div className="h-2 bg-bar rounded w-12 ml-auto" />
        </div>
      </div>
      <div className="flex gap-1 justify-center">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="w-8 h-8 rounded bg-bar" />
        ))}
      </div>
    </div>
  );
}
