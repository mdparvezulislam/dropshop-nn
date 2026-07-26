export default function ProductDetailLoading() {
  return (
    <div className="min-h-screen bg-[hsl(0_0%_98%)] py-6" aria-busy="true" aria-label="লোড হচ্ছে">
      <div className="mx-auto max-w-(--content-max) px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="h-4 w-64 bg-slate-200 rounded animate-pulse" />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          {/* Gallery skeleton */}
          <div className="space-y-3">
            <div className="aspect-square rounded-3xl bg-slate-200 animate-pulse" />
            <div className="hidden md:flex gap-2.5">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-16 w-16 rounded-2xl bg-slate-200 animate-pulse" />
              ))}
            </div>
          </div>

          {/* Info skeleton */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 space-y-5">
            <div className="flex gap-2">
              <div className="h-6 w-20 bg-slate-100 rounded-md animate-pulse" />
              <div className="h-6 w-24 bg-slate-100 rounded-md animate-pulse" />
            </div>
            <div className="h-8 w-4/5 bg-slate-200 rounded-lg animate-pulse" />
            <div className="h-4 w-3/5 bg-slate-100 rounded animate-pulse" />
            <div className="h-10 w-40 bg-slate-200 rounded-lg animate-pulse" />
            <div className="h-24 bg-slate-50 rounded-2xl border border-slate-100 animate-pulse" />
            <div className="flex gap-3">
              <div className="h-12 flex-1 bg-slate-200 rounded-xl animate-pulse" />
              <div className="h-12 flex-1 bg-slate-100 rounded-xl animate-pulse" />
            </div>
            <div className="h-28 bg-slate-50 rounded-2xl border border-slate-100 animate-pulse" />
          </div>
        </div>

        <div className="h-64 bg-white rounded-3xl border border-slate-200 animate-pulse" />
      </div>
    </div>
  );
}
