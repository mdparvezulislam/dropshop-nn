import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";
import { ProductGrid } from "../product-grid";
import type { ProductCardData } from "../product-card";

interface NewArrivalsSectionProps {
  products: ProductCardData[];
  title?: string;
  description?: string;
}

export function NewArrivalsSection({
  products,
  title = "New Arrivals",
  description = "Fresh additions to our catalog",
}: NewArrivalsSectionProps) {
  if (products.length === 0) return null;

  return (
    <section className="py-16 lg:py-24 bg-muted/30">
      <div className="mx-auto max-w-(--content-max) px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-5 w-5 text-primary" />
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                {title}
              </h2>
            </div>
            <p className="text-foreground/50">{description}</p>
          </div>
          <Link
            href="/new-arrivals"
            className="hidden sm:inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
          >
            View All
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <ProductGrid products={products} />

        <div className="mt-8 text-center sm:hidden">
          <Link
            href="/new-arrivals"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
          >
            View All New Arrivals
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
