import { Skeleton } from "@/components/ui/skeleton";

export default function ShipmentsLoading() {
  return (
    <div className="space-y-6 p-4 sm:p-6" aria-busy="true" aria-label="Loading shipments">
      <Skeleton className="h-8 w-64 rounded-lg" />
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-96 w-full rounded-xl" />
    </div>
  );
}
