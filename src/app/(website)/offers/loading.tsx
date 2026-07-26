export default function OffersLoading(): React.ReactElement {
  return (
    <div className="min-h-screen bg-[hsl(0_0%_98%)] py-8" aria-busy="true" aria-label="লোড হচ্ছে">
      <div className="mx-auto max-w-(--content-max) px-4 sm:px-6 lg:px-8">
        {/* Hero skeleton */}
        <div className="rounded-3xl bg-slate-200 animate-pulse h-64 sm:h-72 mb-12" />

        {/* Section heading skeleton */}
        <div className="space-y-3 mb-8 border-b border-slate-200 pb-4">
          <div className="h-7 w-56 rounded-lg bg-slate-200 animate-pulse" />
          <div className="h-3.5 w-40 rounded bg-slate-200 animate-pulse" />
        </div>

        {/* Product grid skeleton */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-16">
          {Array.from({ length: 8 }, (_, i) => (
            <div key={i} className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
              <div className="aspect-square bg-slate-200 animate-pulse" />
              <div className="p-3.5 space-y-2.5">
                <div className="h-3 w-3/4 rounded bg-slate-200 animate-pulse" />
                <div className="h-3 w-1/2 rounded bg-slate-200 animate-pulse" />
                <div className="h-8 rounded-xl bg-slate-200 animate-pulse" />
              </div>
            </div>
          ))}
        </div>

        {/* Second section heading skeleton */}
        <div className="space-y-3 mb-8 border-b border-slate-200 pb-4">
          <div className="h-7 w-64 rounded-lg bg-slate-200 animate-pulse" />
          <div className="h-3.5 w-44 rounded bg-slate-200 animate-pulse" />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
              <div className="aspect-square bg-slate-200 animate-pulse" />
              <div className="p-3.5 space-y-2.5">
                <div className="h-3 w-3/4 rounded bg-slate-200 animate-pulse" />
                <div className="h-3 w-1/2 rounded bg-slate-200 animate-pulse" />
                <div className="h-8 rounded-xl bg-slate-200 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
