import { cn } from "@/lib/utils/cn";
import type { PublicProductCard } from "@/features/catalog/domain/public-catalog-types";
import { ProductCard } from "./product-card";

export interface ProductGridProps {
  products: PublicProductCard[];
  columns?: 2 | 3 | 4;
  className?: string;
  /** Preload the first row's images (above-the-fold grids). */
  priorityCount?: number;
}

export function ProductGrid({
  products,
  columns = 4,
  className,
  priorityCount = 0,
}: ProductGridProps) {
  const gridCols = {
    2: "grid-cols-2",
    3: "grid-cols-2 md:grid-cols-3",
    4: "grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
  };

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-sm font-bold text-slate-500">কোনো প্রোডাক্ট পাওয়া যায়নি</p>
      </div>
    );
  }

  return (
    <div className={cn("grid gap-4 sm:gap-5", gridCols[columns], className)}>
      {products.map((product, index) => (
        <ProductCard key={product.id} product={product} priority={index < priorityCount} />
      ))}
    </div>
  );
}
