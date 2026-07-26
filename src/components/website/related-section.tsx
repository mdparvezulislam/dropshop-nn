import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getPublicRelatedProductsAction } from "@/features/catalog/actions/public-actions";
import { ProductGrid } from "@/components/website/product-grid";

interface RelatedSectionProps {
  slug: string;
  categoryName?: string;
  categorySlug?: string;
  brandName?: string;
  brandSlug?: string;
}

/**
 * Server component streamed behind Suspense — the PDP shell renders first,
 * these rails arrive when their queries finish.
 */
export async function RelatedSection({
  slug,
  categoryName,
  categorySlug,
  brandName,
  brandSlug,
}: RelatedSectionProps) {
  const result = await getPublicRelatedProductsAction(slug);
  if (!result.success || !result.data) return null;

  const { sameCategory, sameBrand, recommended } = result.data;
  if (sameCategory.length === 0 && sameBrand.length === 0 && recommended.length === 0) {
    return null;
  }

  return (
    <div className="space-y-10">
      {sameCategory.length > 0 && (
        <section
          aria-labelledby="related-category-heading"
          className="pt-8 border-t border-slate-200"
        >
          <div className="flex items-end justify-between mb-5">
            <h2 id="related-category-heading" className="text-lg font-black text-slate-900">
              {categoryName ? `${categoryName} — আরও প্রোডাক্ট` : "সম্পর্কিত প্রোডাক্ট"}
            </h2>
            {categorySlug && (
              <Link
                href={`/category/${categorySlug}`}
                className="hidden sm:inline-flex items-center gap-1 text-xs font-extrabold text-amber-700 hover:text-amber-800 transition-colors focus-visible:outline-2 focus-visible:outline-amber-500"
              >
                সবগুলো দেখুন
                <ArrowRight className="h-3.5 w-3.5" aria-hidden />
              </Link>
            )}
          </div>
          <ProductGrid products={sameCategory.slice(0, 4)} />
        </section>
      )}

      {sameBrand.length > 0 && (
        <section aria-labelledby="related-brand-heading" className="pt-8 border-t border-slate-200">
          <div className="flex items-end justify-between mb-5">
            <h2 id="related-brand-heading" className="text-lg font-black text-slate-900">
              {brandName ? `${brandName} ব্র্যান্ডের আরও` : "একই ব্র্যান্ডের প্রোডাক্ট"}
            </h2>
            {brandSlug && (
              <Link
                href={`/brands/${brandSlug}`}
                className="hidden sm:inline-flex items-center gap-1 text-xs font-extrabold text-amber-700 hover:text-amber-800 transition-colors focus-visible:outline-2 focus-visible:outline-amber-500"
              >
                সবগুলো দেখুন
                <ArrowRight className="h-3.5 w-3.5" aria-hidden />
              </Link>
            )}
          </div>
          <ProductGrid products={sameBrand.slice(0, 4)} />
        </section>
      )}

      {recommended.length > 0 && (
        <section aria-labelledby="recommended-heading" className="pt-8 border-t border-slate-200">
          <div className="flex items-end justify-between mb-5">
            <h2 id="recommended-heading" className="text-lg font-black text-slate-900">
              আপনার জন্য বাছাই করা
            </h2>
            <Link
              href="/products"
              className="hidden sm:inline-flex items-center gap-1 text-xs font-extrabold text-amber-700 hover:text-amber-800 transition-colors focus-visible:outline-2 focus-visible:outline-amber-500"
            >
              সবগুলো দেখুন
              <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
          </div>
          <ProductGrid products={recommended.slice(0, 4)} />
        </section>
      )}
    </div>
  );
}

export function RelatedSectionSkeleton() {
  return (
    <div className="pt-8 border-t border-slate-200" aria-hidden>
      <div className="h-6 w-56 bg-slate-200 rounded-lg mb-5 animate-pulse" />
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
            <div className="aspect-square bg-slate-100 animate-pulse" />
            <div className="p-3.5 space-y-2">
              <div className="h-3 w-3/4 bg-slate-100 rounded animate-pulse" />
              <div className="h-4 w-1/2 bg-slate-100 rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
