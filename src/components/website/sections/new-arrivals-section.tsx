import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ProductCard } from "../product-card";
import type { PublicProductCard } from "@/features/catalog/domain/public-catalog-types";

interface NewArrivalsSectionProps {
  products: PublicProductCard[];
  /** True when this is the first product section on the page — its first row preloads. */
  priorityFirstRow?: boolean;
}

/**
 * Real new-arrival products only. Empty data renders nothing — never a mock
 * substitute.
 */
export function NewArrivalsSection({
  products,
  priorityFirstRow = false,
}: NewArrivalsSectionProps): React.ReactElement | null {
  if (products.length === 0) return null;

  const displayProducts = products.slice(0, 12);

  return (
    <section
      className="py-6 sm:py-10 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100"
      aria-labelledby="new-arrivals-heading"
    >
      <div className="mx-auto max-w-(--content-max) px-3 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-5 sm:mb-6">
          <div>
            <h2
              id="new-arrivals-heading"
              className="text-xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-slate-100"
            >
              নতুন অ্যারাইভাল (New Arrivals)
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-bold mt-0.5">
              সদ্য যুক্ত হওয়া প্রোডাক্টসমূহ
            </p>
          </div>

          <Link
            href="/products?sort=newest"
            className="inline-flex items-center gap-1.5 text-xs font-extrabold text-amber-600 dark:text-amber-400 hover:text-amber-700 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500 rounded"
          >
            সব দেখুন
            <ArrowRight className="h-3.5 w-3.5" aria-hidden />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-4">
          {displayProducts.map((product, index) => (
            <ProductCard
              key={product.id}
              product={product}
              priority={priorityFirstRow && index < 4}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default NewArrivalsSection;
