"use client";

export function Loader({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center py-20 ${className}`}>
      <div className="relative flex h-12 w-12 items-center justify-center">
        <div className="absolute h-full w-full animate-spin rounded-full border-2 border-transparent border-t-accent" />
        <div className="absolute h-3/4 w-3/4 animate-spin rounded-full border-2 border-transparent border-b-accent/60" style={{ animationDirection: "reverse", animationDuration: "0.8s" }} />
        <div className="h-2 w-2 rounded-full bg-accent" />
      </div>
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-3xl border border-white/[0.06] bg-white/[0.02] p-5">
      <div className="flex items-start gap-4">
        <div className="h-14 w-14 rounded-2xl bg-white/5" />
        <div className="flex-1 space-y-3">
          <div className="h-4 w-24 rounded-lg bg-white/5" />
          <div className="h-3 w-32 rounded-lg bg-white/5" />
          <div className="h-3 w-full rounded-lg bg-white/5" />
        </div>
      </div>
      <div className="mt-4 flex gap-2">
        <div className="h-8 flex-1 rounded-xl bg-white/5" />
        <div className="h-8 w-20 rounded-xl bg-white/5" />
      </div>
    </div>
  );
}

export function SkeletonList({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
