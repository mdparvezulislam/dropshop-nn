import { cn } from "@/lib/utils/cn";

export function PageSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("animate-pulse space-y-6", className)}>
      <div className="h-8 w-48 rounded-lg bg-muted" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <div className="aspect-square rounded-xl bg-muted" />
            <div className="h-4 w-3/4 rounded bg-muted" />
            <div className="h-3 w-1/2 rounded bg-muted" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function ProductDetailSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("animate-pulse grid grid-cols-1 md:grid-cols-2 gap-8", className)}>
      <div className="aspect-square rounded-xl bg-muted" />
      <div className="space-y-4">
        <div className="h-6 w-3/4 rounded-lg bg-muted" />
        <div className="h-4 w-1/3 rounded bg-muted" />
        <div className="h-8 w-1/4 rounded-lg bg-muted" />
        <div className="h-24 w-full rounded-lg bg-muted" />
        <div className="h-10 w-full rounded-lg bg-muted" />
      </div>
    </div>
  );
}
