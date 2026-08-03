import type { ReactElement } from "react";

export function ProductSkeletonCard(): ReactElement {
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 sm:p-4 space-y-3 animate-pulse">
      {/* Aspect Square Image Placeholder */}
      <div className="w-full aspect-square bg-slate-200 dark:bg-slate-800 rounded-xl" />

      {/* Brand & Title Lines */}
      <div className="space-y-2 pt-1">
        <div className="h-3 w-1/3 bg-slate-200 dark:bg-slate-800 rounded" />
        <div className="h-4 w-full bg-slate-200 dark:bg-slate-800 rounded" />
        <div className="h-4 w-2/3 bg-slate-200 dark:bg-slate-800 rounded" />
      </div>

      {/* Price & Rating */}
      <div className="flex items-center justify-between pt-1">
        <div className="h-5 w-1/2 bg-slate-200 dark:bg-slate-800 rounded" />
        <div className="h-4 w-1/4 bg-slate-200 dark:bg-slate-800 rounded" />
      </div>

      {/* Dual CTA Button Placeholders */}
      <div className="grid grid-cols-2 gap-2 pt-2">
        <div className="h-9 w-full bg-slate-200 dark:bg-slate-800 rounded-xl" />
        <div className="h-9 w-full bg-slate-200 dark:bg-slate-800 rounded-xl" />
      </div>
    </div>
  );
}

export function ProductSkeletonGrid({ count = 8 }: { count?: number }): ReactElement {
  return (
    <div className="grid grid-cols-2 gap-2.5 sm:gap-4 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <ProductSkeletonCard key={i} />
      ))}
    </div>
  );
}
