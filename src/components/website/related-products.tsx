import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ProductGrid } from "@/components/website/product-grid";
import type { ProductCardData } from "@/components/website/product-card";

interface RelatedProductsProps {
  products: ProductCardData[];
  title?: string;
}

export function RelatedProducts({ products, title = "Related Products" }: RelatedProductsProps) {
  if (products.length === 0) return null;

  return (
    <section className="py-8 border-t border-border/40">
      <div className="flex items-end justify-between mb-6">
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        <Link
          href="/products"
          className="hidden sm:inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
        >
          View All
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      <ProductGrid products={products} />
    </section>
  );
}
