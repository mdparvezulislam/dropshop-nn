import type { ReactElement } from "react";

export default function CategoryLoading(): ReactElement {
  return (
    <div className="min-h-screen bg-[hsl(0_0%_98%)] py-8">
      <div
        className="mx-auto max-w-(--content-max) space-y-6 px-4 sm:px-6 lg:px-8"
        aria-busy="true"
        aria-label="লোড হচ্ছে"
      >
        <div className="space-y-3">
          <div className="h-4 w-56 animate-pulse rounded-full bg-slate-200" />
          <div className="h-9 w-72 max-w-full animate-pulse rounded-xl bg-slate-200" />
        </div>
        <div className="h-14 animate-pulse rounded-2xl border border-slate-200 bg-white" />
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }, (_, index) => (
            <div key={index} className="space-y-3 rounded-2xl border border-slate-200 bg-white p-3">
              <div className="aspect-square animate-pulse rounded-xl bg-slate-100" />
              <div className="h-4 w-3/4 animate-pulse rounded bg-slate-100" />
              <div className="h-4 w-1/3 animate-pulse rounded bg-slate-100" />
              <div className="h-9 animate-pulse rounded-xl bg-slate-100" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
