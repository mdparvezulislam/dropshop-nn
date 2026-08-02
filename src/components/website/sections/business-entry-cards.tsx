import Link from "next/link";
import { Store, ShoppingCart, Building2, Headset, ArrowRight } from "lucide-react";

interface BusinessCard {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ElementType;
  href: string;
  ctaText: string;
  badge?: string;
  highlightColor: string;
}

const BUSINESS_CARDS: BusinessCard[] = [
  {
    id: "shopping",
    title: "অনলাইন শপিং",
    subtitle: "১০০% অরিজিনাল গ্যাজেট ও প্রোডাক্ট",
    description: "আপনার প্রয়োজনীয় গ্যাজেট, ইয়ারফোন ও লাইফস্টাইল প্রোডাক্ট সরাসরি সেরা দামে কেনাকাটা করুন।",
    icon: ShoppingCart,
    href: "/products",
    ctaText: "প্রোডাক্ট দেখুন",
    badge: "হট কালেকশন",
    highlightColor: "from-amber-500/10 to-orange-500/5 text-amber-600 border-amber-500/30",
  },
  {
    id: "reseller",
    title: "রিসেলার হন",
    subtitle: "স্টক ছাড়াই ব্যবসা শুরু করুন",
    description: "১০,০০০+ প্রোডাক্ট নিয়ে আপনার পেজ বা ওয়েবসাইটে বিক্রি শুরু করুন। ইনভেস্টমেন্ট ছাড়াই লাভ করুন।",
    icon: Store,
    href: "/become-reseller",
    ctaText: "রিসেলিং শুরু করুন",
    badge: "জনপ্রিয়",
    highlightColor: "from-blue-500/10 to-indigo-500/5 text-blue-600 border-blue-500/30",
  },
  {
    id: "wholesale",
    title: "হোলসেল সাপ্লাই",
    subtitle: "কারখানার সরাসরি দাম",
    description: "বাল্ক বা বড় অর্ডারে স্পেশাল ডিসকাউন্ট ও ফ্যাক্টরি ডিরেক্ট সোর্সিং সুবিধা গ্রহণ করুন।",
    icon: Building2,
    href: "/become-wholesale-partner",
    ctaText: "পাইকারি দাম দেখুন",
    badge: "বাল্ক সেভিংস",
    highlightColor: "from-emerald-500/10 to-teal-500/5 text-emerald-600 border-emerald-500/30",
  },
  {
    id: "support",
    title: "বিজনেস সাপোর্ট",
    subtitle: "২৪/৭ ডেডিকেটেড হেল্পডেস্ক",
    description: "মার্কেটিং সহায়তায় পোস্টার, ভিডিও কন্টেন্ট এবং সরাসরি কাস্টমার সার্ভিস কেয়ার।",
    icon: Headset,
    href: "/support",
    ctaText: "সাপোর্ট পান",
    highlightColor: "from-purple-500/10 to-pink-500/5 text-purple-600 border-purple-500/30",
  },
];

export function BusinessEntryCards(): React.ReactElement {
  return (
    <section
      className="py-6 sm:py-10 bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200/80 dark:border-slate-800"
      aria-label="Business Entry Points"
    >
      <div className="mx-auto max-w-(--content-max) px-3 sm:px-6 lg:px-8">
        <div className="text-center mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            আপনার পছন্দের <span className="text-amber-500">বিজনেস ও শপিং চ্যানেল</span> বেছে নিন
          </h2>
          <p className="text-xs sm:text-sm font-bold text-slate-500 dark:text-slate-400 mt-1">
            ব্যবসায়িক চাহিদা ও শপিংয়ের জন্য কাস্টমাইজড সলিউশন ও সাপোর্ট
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-5">
          {BUSINESS_CARDS.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.id}
                className="group relative rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-5 flex flex-col justify-between hover:border-amber-400 dark:hover:border-amber-500 hover:shadow-xl transition-all duration-300 active:scale-[0.99] touch-manipulation"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div
                      className={`w-11 h-11 rounded-xl bg-gradient-to-br ${card.highlightColor} flex items-center justify-center border shadow-2xs group-hover:scale-110 transition-transform`}
                    >
                      <Icon className="h-5 w-5" aria-hidden />
                    </div>
                    {card.badge && (
                      <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800 shadow-2xs">
                        {card.badge}
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                      {card.title}
                    </h3>
                    <p className="text-xs font-bold text-amber-600 dark:text-amber-400 mt-0.5">
                      {card.subtitle}
                    </p>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {card.description}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
                  <Link
                    href={card.href}
                    className="inline-flex items-center justify-between w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-amber-500 hover:text-slate-950 dark:hover:bg-amber-500 dark:hover:text-slate-950 text-slate-900 dark:text-slate-100 text-xs font-black transition-all shadow-2xs group-hover:shadow-md"
                  >
                    <span>{card.ctaText}</span>
                    <ArrowRight className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-1" aria-hidden />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default BusinessEntryCards;
