import Link from "next/link";
import { Sparkles, ArrowRight, TrendingUp, Flame, Star, Award, Zap } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "প্রোডাক্ট কালেকশনস - DropshopNN Bangladesh",
  description: "বাংলাদেশের সেরা ড্রপশিপিং ও হোলসেল প্রোডাক্ট কালেকশনস দেখুন।",
};

const COLLECTIONS = [
  {
    slug: "trending-now",
    title: "ট্রেন্ডিং সোর্সিং কালেকশন 2026",
    description:
      "বাংলাদেশে বর্তমানে সবচেয়ে বেশি সেল হওয়া ফাস্ট চার্জার, TWS এয়ারবাডস এবং স্মার্ট ওয়াচ সমূহ।",
    icon: TrendingUp,
    badge: "হট চয়েস",
    color: "from-amber-100/80 to-orange-50",
  },
  {
    slug: "editors-choice",
    title: "এডিটরস চয়েস অ্যাওয়ার্ডস",
    description:
      "প্রিমিয়াম বিল্ড কোয়ালিটি এবং সাউন্ড পারফরম্যান্স সম্বলিত বাছাইকৃত ইলেকট্রনিক্স গ্যাজেট।",
    icon: Star,
    badge: "টপ রেটেড",
    color: "from-purple-100/80 to-slate-50",
  },
  {
    slug: "fast-charging-hub",
    title: "ফাস্ট চার্জিং হাব",
    description: "৬৫W+ GaN চার্জার, ১০০W টাইপ-সি ক্যাবল এবং মেগা পাওয়ার ব্যাংক কালেকশন।",
    icon: Flame,
    badge: "এসেনশিয়াল",
    color: "from-amber-100/80 to-amber-50",
  },
  {
    slug: "wholesale-bulk-deals",
    title: "B2B হোলসেল অফার",
    description:
      "ইলেকট্রনিক্স শপ ওনার এবং রিসেলারদের জন্য বিশেষ পাইকারি ক্যাটালগ ও বাল্ক ডিসকাউন্ট।",
    icon: Award,
    badge: "পাইকারি অফার",
    color: "from-emerald-100/80 to-emerald-50",
  },
];

export default function CollectionsPage() {
  return (
    <div className="min-h-screen bg-[hsl(0_0%_98%)] text-foreground py-8">
      <div className="mx-auto max-w-(--content-max) px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold">
            <Sparkles className="h-3.5 w-3.5" /> সোর্সিং কালেকশন হাব
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-foreground tracking-tight">
            বাছাইকৃত প্রোডাক্ট কালেকশনস
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground font-medium">
            খুচরা ক্রেতা, রিসেলার এবং হোলসেল ব্যবসায়ীদের জন্য তৈরি বিশেষ ক্যাটালগ কলেকশনস।
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {COLLECTIONS.map((col) => {
            const Icon = col.icon;
            return (
              <Link
                key={col.slug}
                href={`/collections/${col.slug}`}
                className={`bg-gradient-to-br ${col.color} border border-border/80 rounded-3xl p-8 shadow-xs hover:shadow-lg hover:border-amber-400/80 transition-all duration-300 group flex flex-col justify-between`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-white border border-border/80 flex items-center justify-center text-amber-600 shadow-2xs group-hover:scale-110 transition-transform">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-extrabold text-amber-800 bg-white border border-amber-200 px-3 py-1 rounded-full shadow-2xs">
                      {col.badge}
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-foreground group-hover:text-amber-600 transition-colors mb-2">
                    {col.title}
                  </h2>
                  <p className="text-xs text-muted-foreground leading-relaxed font-medium mb-6">
                    {col.description}
                  </p>
                </div>

                <div className="inline-flex items-center justify-between text-xs font-extrabold text-amber-700 pt-4 border-t border-border/60">
                  <span>কালেকশন এক্সপ্লোর করুন</span>
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
