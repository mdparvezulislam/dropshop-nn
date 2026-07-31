import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Shapes } from "lucide-react";
import type { PublicCategoryInfo } from "@/features/catalog/domain/public-catalog-types";

interface CategoryShowcaseProps {
  categories: PublicCategoryInfo[];
}

const BANGLA_DIGITS = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"] as const;

function toBanglaDigits(value: number): string {
  return String(value)
    .split("")
    .map((ch) => (/[0-9]/.test(ch) ? BANGLA_DIGITS[Number(ch)] : ch))
    .join("");
}

/**
 * Real top-level categories with their real product counts. Empty taxonomy
 * renders nothing — never a hardcoded substitute.
 */
export function CategoryShowcase({ categories }: CategoryShowcaseProps): React.ReactElement | null {
  const topLevel = categories.filter((c) => c.parentCategoryId === null).slice(0, 8);
  if (topLevel.length === 0) return null;

  return (
    <section
      className="py-6 sm:py-10 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100"
      aria-labelledby="category-showcase-heading"
    >
      <div className="mx-auto max-w-(--content-max) px-3 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-5 sm:mb-6">
          <div>
            <h2
              id="category-showcase-heading"
              className="text-xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight"
            >
              জনপ্রিয় ক্যাটাগরি
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-bold mt-0.5">
              আপনার পছন্দের প্রোডাক্ট খুঁজে নিন
            </p>
          </div>

          <Link
            href="/categories"
            className="inline-flex items-center gap-1.5 text-xs font-extrabold text-amber-600 dark:text-amber-400 hover:text-amber-700 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500 rounded"
          >
            সব দেখুন
            <ArrowRight className="h-3.5 w-3.5" aria-hidden />
          </Link>
        </div>

        <div className="flex sm:grid sm:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-3.5 overflow-x-auto snap-x snap-mandatory scroll-smooth no-scrollbar pb-2 -mx-3 px-3 sm:mx-0 sm:px-0">
          {topLevel.map((category) => (
            <Link
              key={category.id}
              href={`/category/${category.slug}`}
              className="group flex flex-col items-center text-center p-3 sm:p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-amber-400 dark:hover:border-amber-500 hover:shadow-md transition-all duration-200 shrink-0 w-28 sm:w-auto snap-start focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500 active:scale-95 touch-manipulation"
            >
              <div className="relative w-14 h-14 rounded-xl bg-slate-100 dark:bg-slate-800 group-hover:bg-amber-50 dark:group-hover:bg-amber-950/40 flex items-center justify-center mb-2 overflow-hidden transition-colors">
                {category.image ? (
                  <Image src={category.image} alt="" fill className="object-cover" sizes="56px" />
                ) : (
                  <Shapes
                    className="h-6 w-6 text-slate-700 dark:text-slate-300 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors"
                    aria-hidden
                  />
                )}
              </div>
              <h3 className="text-xs font-black text-slate-900 dark:text-slate-100 leading-snug line-clamp-1 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                {category.name}
              </h3>
              <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mt-0.5">
                {toBanglaDigits(category.productCount)} প্রোডাক্ট
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export default CategoryShowcase;
