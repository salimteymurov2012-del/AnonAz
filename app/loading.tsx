export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="animate-pulse rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
        <div className="h-6 w-40 rounded-lg bg-white/10" />
        <div className="mt-4 h-4 w-72 rounded-lg bg-white/10" />
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <div className="h-12 w-12 rounded-2xl bg-white/10" />
              <div className="mt-4 h-4 w-28 rounded-lg bg-white/10" />
              <div className="mt-2 h-3 w-20 rounded-lg bg-white/10" />
              <div className="mt-4 h-3 w-full rounded-lg bg-white/10" />
              <div className="mt-2 h-3 w-4/5 rounded-lg bg-white/10" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
