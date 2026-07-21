import Link from "next/link";
import { Sparkles, ArrowRight, TrendingUp, Flame, Star, Award } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Curated Collections - DropshopNN Bangladesh",
  description: "Explore curated tech product collections including Seasonal Hot Sellers, Trending Accessories, Editor's Choice, and Bulk Wholesale Deals.",
};

const COLLECTIONS = [
  {
    slug: "trending-now",
    title: "Trending Gadgets 2026",
    description: "The most popular fast chargers, TWS earbuds, and smart bands across Bangladesh this month.",
    icon: TrendingUp,
    badge: "Hot Choice",
    color: "from-amber-500/20 to-orange-500/10",
  },
  {
    slug: "editors-choice",
    title: "Editor's Choice Awards",
    description: "Handpicked premium tech gear tested for exceptional build quality, sound acoustics, and durability.",
    icon: Star,
    badge: "Top Rated",
    color: "from-purple-500/20 to-indigo-500/10",
  },
  {
    slug: "fast-charging-hub",
    title: "Fast Charging Hub",
    description: "65W+ GaN chargers, 100W PD Type-C cables, and high capacity power banks for MacBook & flagship phones.",
    icon: Flame,
    badge: "Essential",
    color: "from-red-500/20 to-amber-500/10",
  },
  {
    slug: "wholesale-bulk-deals",
    title: "B2B Wholesale Specials",
    description: "Discounted bulk MOQ lots designed for verified electronics shop owners and reseller entrepreneurs.",
    icon: Award,
    badge: "B2B Volume",
    color: "from-emerald-500/20 to-teal-500/10",
  },
];

export default function CollectionsPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="mb-10 text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-amber-400 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" /> Curated Catalog Hub
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-heading tracking-tight mb-3">
            Featured Collections
          </h1>
          <p className="text-sm text-slate-400">
            Explore curated groups of electronics tailored for retail buyers, resellers, and wholesale traders.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {COLLECTIONS.map((col) => {
            const Icon = col.icon;
            return (
              <Link
                key={col.slug}
                href={`/collections/${col.slug}`}
                className={`bg-gradient-to-br ${col.color} border border-slate-800 rounded-3xl p-8 backdrop-blur-md hover:border-amber-500/40 transition-all duration-300 group flex flex-col justify-between`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-bold text-amber-300 bg-slate-950/80 border border-amber-500/20 px-3 py-1 rounded-full">
                      {col.badge}
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold text-white font-heading group-hover:text-amber-400 transition-colors mb-2">
                    {col.title}
                  </h2>
                  <p className="text-xs text-slate-400 leading-relaxed mb-6">
                    {col.description}
                  </p>
                </div>

                <div className="inline-flex items-center justify-between text-xs font-semibold text-amber-400 pt-4 border-t border-slate-800/80">
                  <span>Explore Collection</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
