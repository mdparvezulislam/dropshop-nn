import Link from "next/link";
import { ArrowRight, Store, ShoppingCart, Building2, Headset, CheckCircle2 } from "lucide-react";
import { BRAND } from "@/config/brand";

interface SolutionItem {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ElementType;
  href: string;
  ctaText: string;
  badge: string;
  features: string[];
}

const BUSINESS_SOLUTIONS: SolutionItem[] = [
  {
    id: "shopping",
    title: "শপিং ক্যাটালগ",
    subtitle: "অরিজিনাল গ্যাজেট ও শপিং",
    description: "আপনার পছন্দের সেরা প্রোডাক্ট বেছে নিন। অরিজিনাল ব্র্যান্ড ওয়ারেন্টি ও দ্রুত ডেলিভারি সুবিধা।",
    icon: ShoppingCart,
    href: "/products",
    ctaText: "ক্যাটালগ দেখুন",
    badge: "স্মার্ট শপিং",
    features: [
      "১০০% অরিজিনাল ও ওয়ারেন্টি প্রোডাক্ট",
      "দ্রুত ডেলিভারি ও সহজ রিটার্ন",
      "নমনীয় পেমেন্ট ও ক্যাশ অন ডেলিভারি",
      "নিয়মিত নতুন ক্যাটালগ আপডেট",
    ],
  },
  {
    id: "reseller",
    title: "রিসেলার চ্যানেল",
    subtitle: "ইনভেন্টরি ঝুঁকি ছাড়া ই-কমার্স",
    description: "আপনার ফেসবুক পেজ, ওয়েবসাইট বা সোশ্যাল মিডিয়ায় ১০,০০০+ প্রোডাক্ট লিস্ট করে নিজের ব্যবসা পরিচালনা করুন।",
    icon: Store,
    href: "/become-reseller",
    ctaText: "রিসেলার হিসেবে যুক্ত হন",
    badge: "জনপ্রিয় ট্রাক",
    features: [
      "জিরো ইনভেস্টমেন্ট প্রোডাক্ট সোর্সিং",
      "১-ক্লিক ক্যাটালগ ও মার্কেটিং কিট",
      "সারা বাংলাদেশে ক্যাশ অন ডেলিভারি",
      "সহজ প্রফিট উইথড্রয়াল সিস্টেম",
    ],
  },
  {
    id: "wholesale",
    title: "হোলসেল চ্যানেল",
    subtitle: "ফ্যাক্টরি ডিরেক্ট বাল্ক সোর্সিং",
    description: "বড় আকারের ব্যবসা ও পাইকারি ক্রেতাদের জন্য সরাসরি ইম্পোর্টার ও ফ্যাক্টরি রেটে প্রোডাক্ট সরবরাহ।",
    icon: Building2,
    href: "/become-wholesale-partner",
    ctaText: "হোলসেল পোর্টাল খুলুন",
    badge: "বাল্ক সেভিংস",
    features: [
      "স্পেশাল টিয়ারড ডিসকাউন্ট রেশিও",
      "ফ্লেক্সিবল ন্যূনতম অর্ডার পরিমাণ (MOQ)",
      "ডেডিকেটেড কী-অ্যাকাউন্ট ম্যানেজার",
      "কাস্টম ব্র্যান্ডিং ও প্যাকেজিং",
    ],
  },
  {
    id: "support",
    title: "হেল্পডেস্ক ও সাপোর্ট",
    subtitle: "২৪/৭ কাস্টমার ও বিজনেস কেয়ার",
    description: "যেকোনো সাহায্য, অর্ডার ট্র্যাকিং ও প্রোডাক্ট সাপোর্ট সংক্রান্ত সহযোগিতার জন্য আমাদের ডেডিকেটেড টিম।",
    icon: Headset,
    href: "/support",
    ctaText: "সাপোর্ট টিম কানেক্ট করুন",
    badge: "২৪/৭ সার্ভিস",
    features: [
      "২৪/৭ ডেডিকেটেড কাস্টমার হেল্পডেস্ক",
      "অর্ডার ট্র্যাকিং ও ডেলিভারি আপডেট",
      "ইনস্ট্যান্ট চ্যাট ও ফোন সাপোর্ট",
      "সহজ রিটার্ন ও রিপ্লেসমেন্ট সহায়তা",
    ],
  },
];

export function BusinessSolutionsSection(): React.ReactElement {
  return (
    <section
      className="py-10 sm:py-16 bg-slate-50/80 dark:bg-slate-900/60 border-b border-slate-200/80 dark:border-slate-800/80 text-slate-900 dark:text-slate-100"
      aria-labelledby="business-solutions-heading"
    >
      <div className="mx-auto max-w-(--content-max) px-3 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-12 max-w-2xl mx-auto space-y-2">
          <span className="text-[11px] font-black uppercase tracking-widest text-amber-700 dark:text-amber-400 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30">
            চ্যানেল সলিউশনস
          </span>
          <h2
            id="business-solutions-heading"
            className="text-2xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-slate-100"
          >
            আপনার পছন্দের চ্যানেল বেছে নিন — <span className="text-amber-500">{BRAND.publicName}</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-semibold">
            রিটেইল শপিং, রিসেলিং বা বাল্ক ইম্পোর্ট — আপনার সকল বিজনেসের বিশ্বস্ত প্ল্যাটফর্ম
          </p>
        </div>

        {/* 2x2 Grid on Mobile | 4 Columns on Desktop with Lift Effect */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {BUSINESS_SOLUTIONS.map((solution) => {
            const Icon = solution.icon;
            return (
              <div
                key={solution.id}
                className="group relative rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-6 flex flex-col justify-between hover:border-amber-400 dark:hover:border-amber-500 hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 active:scale-[0.99] touch-manipulation"
              >
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-500/20 group-hover:scale-110 transition-transform">
                      <Icon className="h-6 w-6" aria-hidden />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 dark:text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-md border border-amber-500/20">
                      {solution.badge}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-black text-slate-900 dark:text-slate-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                      {solution.title}
                    </h3>
                    <p className="text-xs font-bold text-amber-600 dark:text-amber-400 mt-0.5">
                      {solution.subtitle}
                    </p>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                    {solution.description}
                  </p>

                  <ul className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800" aria-label={`${solution.title} সুবিধাসমূহ`}>
                    {solution.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" aria-hidden />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-5 mt-5 border-t border-slate-100 dark:border-slate-800">
                  <Link
                    href={solution.href}
                    className="inline-flex items-center justify-center gap-2 w-full h-11 rounded-xl bg-slate-900 dark:bg-slate-100 hover:bg-amber-500 dark:hover:bg-amber-500 text-white dark:text-slate-950 hover:text-slate-950 dark:hover:text-slate-950 font-black text-xs transition-all shadow-xs active:scale-95"
                  >
                    <span>{solution.ctaText}</span>
                    <ArrowRight className="h-4 w-4 shrink-0" aria-hidden />
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

export default BusinessSolutionsSection;
