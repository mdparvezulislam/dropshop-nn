import type { ReactElement } from "react";
import { cn } from "@/lib/utils/cn";

/** Single shimmer block on the light theme (slate-200 on white). */
function Bone({ className }: { className?: string }): ReactElement {
  return <div className={cn("rounded-lg bg-slate-200", className)} />;
}

export function ProductCardSkeleton({ className }: { className?: string }): ReactElement {
  return (
    <div className={cn("space-y-3 rounded-2xl border border-slate-200 bg-white p-3", className)}>
      <Bone className="aspect-square rounded-xl" />
      <Bone className="h-3 w-1/3" />
      <Bone className="h-4 w-3/4" />
      <Bone className="h-4 w-1/2" />
      <Bone className="h-9 w-full rounded-xl" />
    </div>
  );
}

export function CatalogToolbarSkeleton(): ReactElement {
  return (
    <div className="mb-6 flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-xs">
      <Bone className="h-4 w-40" />
      <div className="flex items-center gap-3">
        <Bone className="hidden h-9 w-44 rounded-xl sm:block" />
        <Bone className="h-9 w-36 rounded-xl" />
        <Bone className="hidden h-9 w-24 rounded-xl sm:block" />
      </div>
    </div>
  );
}

export function CatalogSidebarSkeleton(): ReactElement {
  return (
    <div className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
      <Bone className="h-4 w-28" />
      <div className="space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Bone key={i} className="h-7 w-full" />
        ))}
      </div>
      <Bone className="h-4 w-24" />
      <div className="grid grid-cols-2 gap-2">
        <Bone className="h-9 rounded-xl" />
        <Bone className="h-9 rounded-xl" />
      </div>
      <div className="space-y-2">
        <Bone className="h-5 w-full" />
        <Bone className="h-5 w-full" />
      </div>
    </div>
  );
}

export function CatalogGridSkeleton({
  count = 12,
  className,
}: {
  count?: number;
  className?: string;
}): ReactElement {
  return (
    <div className={cn("grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

/** Full /products page skeleton: header, toolbar, sidebar and card grid. */
export function CatalogPageSkeleton(): ReactElement {
  return (
    <div
      role="status"
      aria-label="প্রোডাক্ট লোড হচ্ছে"
      className="min-h-screen bg-[hsl(0_0%_98%)] py-8"
    >
      <div className="mx-auto max-w-(--content-max) animate-pulse space-y-6 px-4 sm:px-6 lg:px-8">
        <div className="space-y-2">
          <Bone className="h-3 w-32" />
          <Bone className="h-8 w-72 max-w-full" />
          <Bone className="h-3 w-96 max-w-full" />
        </div>
        <div>
          <CatalogToolbarSkeleton />
          <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-4">
            <div className="hidden lg:block">
              <CatalogSidebarSkeleton />
            </div>
            <div className="lg:col-span-3">
              <CatalogGridSkeleton count={12} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Full /search page skeleton: search bar, heading and card grid. */
export function SearchPageSkeleton(): ReactElement {
  return (
    <div
      role="status"
      aria-label="সার্চ ফলাফল লোড হচ্ছে"
      className="min-h-screen bg-[hsl(0_0%_98%)] py-8"
    >
      <div className="mx-auto max-w-(--content-max) animate-pulse space-y-6 px-4 sm:px-6 lg:px-8">
        <div className="space-y-4">
          <Bone className="h-4 w-24" />
          <Bone className="h-10 w-full max-w-xl rounded-xl" />
          <Bone className="h-7 w-80 max-w-full" />
        </div>
        <div>
          <CatalogToolbarSkeleton />
          <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-4">
            <div className="hidden lg:block">
              <CatalogSidebarSkeleton />
            </div>
            <div className="lg:col-span-3">
              <CatalogGridSkeleton count={12} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function PageSkeleton({ className }: { className?: string }): ReactElement {
  return (
    <div className={cn("animate-pulse space-y-6", className)}>
      <Bone className="h-8 w-48" />
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <Bone className="aspect-square rounded-xl" />
            <Bone className="h-4 w-3/4" />
            <Bone className="h-3 w-1/2" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function ProductDetailSkeleton({ className }: { className?: string }): ReactElement {
  return (
    <div className={cn("grid animate-pulse grid-cols-1 gap-8 md:grid-cols-2", className)}>
      <Bone className="aspect-square rounded-xl" />
      <div className="space-y-4">
        <Bone className="h-6 w-3/4" />
        <Bone className="h-4 w-1/3" />
        <Bone className="h-8 w-1/4" />
        <Bone className="h-24 w-full" />
        <Bone className="h-10 w-full" />
      </div>
    </div>
  );
}
