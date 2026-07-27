import Link from "next/link";
import { ArrowRight, Flame } from "lucide-react";
import { ProductCard } from "../product-card";
import type { PublicProductCard } from "@/features/catalog/domain/public-catalog-types";

interface TrendingProductsSectionProps {
  products: PublicProductCard[];
  title?: string;
  description?: string;
}

/** Real trending-badged products only. Empty data renders nothing. */
export function TrendingProductsSection({
  products,
  title = "ট্রেন্ডিং প্রোডাক্ট",
  description = "এই মুহূর্তে আলোচিত প্রোডাক্টসমূহ",
}: TrendingProductsSectionProps): React.ReactElement | null {
  if (products.length === 0) return null;

  return (
    <section
      className="py-8 sm:py-12 lg:py-16 bg-white border-b border-slate-200"
      aria-labelledby="trending-products-heading"
    >
      <div className="mx-auto max-w-(--content-max) px-3 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="flex items-center gap-2">
              <Flame className="h-5 w-5 text-amber-500" aria-hidden />
              <h2
                id="trending-products-heading"
                className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900"
              >
                {title}
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 font-bold mt-1">{description}</p>
          </div>

          <Link
            href="/products?badge=trending"
            className="inline-flex items-center gap-1.5 text-xs font-extrabold text-amber-600 hover:text-amber-700 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500 rounded"
          >
            সব দেখুন
            <ArrowRight className="h-3.5 w-3.5" aria-hidden />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.slice(0, 8).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default TrendingProductsSection;
