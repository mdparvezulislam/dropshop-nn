import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { ProductGrid } from "../product-grid";
import type { ProductCardData } from "../product-card";

interface FeaturedProductsSectionProps {
  products: ProductCardData[];
  title?: string;
  description?: string;
}

export function FeaturedProductsSection({
  products,
  title = "Featured Products",
  description = "Handpicked favorites just for you",
}: FeaturedProductsSectionProps) {
  if (products.length === 0) return null;

  return (
    <section className="py-16 lg:py-24 bg-muted/30">
      <div className="mx-auto max-w-(--content-max) px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                {title}
              </h2>
            </div>
            <p className="text-foreground/50">{description}</p>
          </div>
          <Link
            href="/products?filter=featured"
            className="hidden sm:inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
          >
            View All
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <ProductGrid products={products} />

        <div className="mt-8 text-center sm:hidden">
          <Link
            href="/products?filter=featured"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
          >
            View All Featured Products
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
