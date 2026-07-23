import { cn } from "@/lib/utils/cn";
import type { ProductCardData } from "./product-card";
import { ProductCard } from "./product-card";

export interface ProductGridProps {
  products: ProductCardData[];
  columns?: 2 | 3 | 4;
  className?: string;
}

export function ProductGrid({ products, columns = 4, className }: ProductGridProps) {
  const gridCols = {
    2: "grid-cols-2",
    3: "grid-cols-2 md:grid-cols-3",
    4: "grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
  };

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="rounded-full bg-muted/60 p-4 mb-4">
          <div className="h-8 w-8 text-foreground/20" />
        </div>
        <p className="text-sm text-foreground/50">No products found</p>
      </div>
    );
  }

  return (
    <div className={cn("grid gap-4 sm:gap-5", gridCols[columns], className)}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
