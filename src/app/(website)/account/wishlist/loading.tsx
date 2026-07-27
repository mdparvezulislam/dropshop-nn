import type { ReactElement } from "react";
import { ProductCardSkeleton } from "@/components/website/loading";

export default function WishlistLoading(): ReactElement {
  return (
    <div className="space-y-5" aria-busy="true" aria-live="polite">
      <span className="sr-only">উইশলিস্ট লোড হচ্ছে…</span>
      <div className="space-y-2">
        <div className="h-6 w-40 rounded-lg bg-slate-200" />
        <div className="h-3 w-28 rounded-lg bg-slate-200" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <ProductCardSkeleton key={index} />
        ))}
      </div>
    </div>
  );
}
