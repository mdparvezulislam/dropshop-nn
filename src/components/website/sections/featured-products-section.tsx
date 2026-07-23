import Link from "next/link";
import { ArrowRight, Star } from "lucide-react";
import { ProductGrid } from "../product-grid";
import type { ProductCardData } from "../product-card";

interface FeaturedProductsSectionProps {
  products: ProductCardData[];
  title?: string;
  description?: string;
}

export function FeaturedProductsSection({
  products,
  title = "Featured Collection",
  description = "Handpicked premium products curated for quality and value",
}: FeaturedProductsSectionProps) {
  if (products.length === 0) return null;

  return (
    <section className="py-20 lg:py-28 bg-gradient-to-b from-white to-[hsl(0_0%_96%)]">
      <div className="mx-auto max-w-(--content-max) px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-12">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="inline-flex items-center justify-center h-10 w-10 rounded-lg bg-primary/10 text-primary">
                <Star className="h-5 w-5" />
              </div>
              <span className="text-xs font-bold uppercase tracking-widest text-primary/60">Featured</span>
            </div>
            <h2 className="text-5xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[hsl(222_47%_11%)]">
              {title}
            </h2>
            <p className="text-lg text-[hsl(215_16%_47%)] max-w-2xl mt-3">{description}</p>
          </div>
          <Link
            href="/products?filter=featured"
            className="hidden sm:inline-flex items-center gap-2 text-sm font-bold text-primary hover:text-primary/80 transition-colors"
          >
            View All
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <ProductGrid products={products} />

        <div className="mt-12 text-center sm:hidden">
          <Link
            href="/products?filter=featured"
            className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:text-primary/80 transition-colors"
          >
            View All Featured Products
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
