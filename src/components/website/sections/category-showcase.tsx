import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Smartphone,
  Tv,
  Watch,
  Shirt,
  Sparkles,
  Utensils,
  Laptop,
  Dumbbell,
  Baby,
  Package,
} from "lucide-react";
import type { PublicCategoryInfo } from "@/features/catalog/domain/public-catalog-types";

interface CategoryShowcaseProps {
  categories: PublicCategoryInfo[];
}

const DEFAULT_CATEGORIES = [
  {
    id: "cat-gadgets",
    name: "গ্যাজেট ও ইলেকট্রনিক্স",
    slug: "electronics",
    icon: Smartphone,
    color: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  },
  {
    id: "cat-appliances",
    name: "হোম অ্যাপ্লায়েন্স",
    slug: "home-appliances",
    icon: Tv,
    color: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  },
  {
    id: "cat-smartwatches",
    name: "স্মার্টওয়াচ ও ব্যান্ড",
    slug: "smartwatches",
    icon: Watch,
    color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  },
  {
    id: "cat-fashion",
    name: "ফ্যাশন ও লাইফস্টাইল",
    slug: "fashion",
    icon: Shirt,
    color: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
  },
  {
    id: "cat-beauty",
    name: "বিউটি ও কেয়ার",
    slug: "beauty",
    icon: Sparkles,
    color: "bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20",
  },
  {
    id: "cat-kitchen",
    name: "কচিন ও ডাইনিং",
    slug: "kitchen",
    icon: Utensils,
    color: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
  },
  {
    id: "cat-computers",
    name: "কম্পিউটার ও আইটি",
    slug: "computers",
    icon: Laptop,
    color: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
  },
  {
    id: "cat-fitness",
    name: "স্পোর্টস ও ফিটনেস",
    slug: "fitness",
    icon: Dumbbell,
    color: "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20",
  },
  {
    id: "cat-baby",
    name: "বেবি ও কিডস",
    slug: "baby",
    icon: Baby,
    color: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
  },
];

export function CategoryShowcase({ categories }: CategoryShowcaseProps): React.ReactElement {
  // Combine real DB top-level categories
  const realTopLevel = categories.filter((c) => c.parentCategoryId === null);
  
  // Fill remaining slots with default categories up to 10 if fewer DB categories exist
  const displayItems = [...realTopLevel];
  
  DEFAULT_CATEGORIES.forEach((defCat) => {
    if (displayItems.length < 10) {
      const exists = displayItems.some(
        (c) => c.slug === defCat.slug || c.name.toLowerCase() === defCat.name.toLowerCase()
      );
      if (!exists) {
        displayItems.push({
          id: defCat.id,
          name: defCat.name,
          slug: defCat.slug,
          description: "",
          image: undefined,
          parentCategoryId: null,
          productCount: 15,
        });
      }
    }
  });

  return (
    <section
      className="py-6 sm:py-10 bg-slate-50/60 dark:bg-slate-900/40 border-b border-slate-200/80 dark:border-slate-800/80 text-slate-900 dark:text-slate-100"
      aria-labelledby="category-showcase-heading"
    >
      <div className="mx-auto max-w-(--content-max) px-3 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex items-end justify-between mb-5 sm:mb-6">
          <div>
            <h2
              id="category-showcase-heading"
              className="text-xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2"
            >
              <span>পপুলার ক্যাটাগরি</span>
              <span className="hidden sm:inline-flex px-2 py-0.5 text-xs font-extrabold rounded-md bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                Daraz/Chaldal প্যাটার্ন
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
              আপনার পছন্দের ক্যাটাগরি থেকে সহজে কেনাকাটা করুন
            </p>
          </div>

          <Link
            href="/categories"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400 hover:text-amber-700 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500 rounded"
          >
            সব ক্যাটাগরি
            <ArrowRight className="h-3.5 w-3.5" aria-hidden />
          </Link>
        </div>

        {/* Categories Grid (Mobile: Horizontal Scroll with Snap | Desktop: 6-8 Column Grid) */}
        <div className="flex sm:grid sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 sm:gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth ws-scroll pb-3 -mx-3 px-3 sm:mx-0 sm:px-0">
          {displayItems.map((category, idx) => {
            const defaultItem = DEFAULT_CATEGORIES[idx % DEFAULT_CATEGORIES.length];
            const Icon = defaultItem.icon;
            const categoryHref = `/category/${category.slug}`;

            return (
              <Link
                key={category.id}
                href={categoryHref}
                className="group flex flex-col items-center text-center p-3 sm:p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 hover:border-amber-400 dark:hover:border-amber-500/60 hover:shadow-md transition-all duration-200 shrink-0 w-28 sm:w-auto snap-start focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500 active:scale-95 touch-manipulation"
              >
                {/* Round / Square Thumbnail Image / Icon */}
                <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 group-hover:bg-amber-500/10 flex items-center justify-center mb-2 overflow-hidden transition-all duration-200 border border-slate-200/60 dark:border-slate-700/60 group-hover:scale-105">
                  {category.image ? (
                    <Image src={category.image} alt={category.name} fill className="object-cover" sizes="64px" />
                  ) : (
                    <div className="flex items-center justify-center text-amber-600 dark:text-amber-400">
                      <Icon className="h-6 w-6 sm:h-7 sm:w-7 group-hover:scale-110 transition-transform" />
                    </div>
                  )}
                </div>

                <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-snug line-clamp-2 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                  {category.name}
                </h3>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default CategoryShowcase;
