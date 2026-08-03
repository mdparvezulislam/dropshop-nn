import { ShieldCheck, Truck, Banknote, Wallet } from "lucide-react";

const TRUST_ITEMS = [
  {
    icon: ShieldCheck,
    title: "১০০% অরিজিনাল প্রোডাক্ট",
    sub: "গ্যারান্টিযুক্ত সঠিক পণ্য",
  },
  {
    icon: Truck,
    title: "৬৪ জেলায় ডেলিভারি",
    sub: "দ্রুততম সময়ে হোম ডেলিভারি",
  },
  {
    icon: Banknote,
    title: "ক্যাশ অন ডেলিভারি",
    sub: "পণ্য দেখে বুঝে পেমেন্ট",
  },
  {
    icon: Wallet,
    title: "bKash / Nagad পেমেন্ট",
    sub: "সহজ ও নিরাপদ পেমেন্ট",
  },
] as const;

export function TrustSection(): React.ReactElement {
  return (
    <section
      className="w-full py-4 lg:py-6 bg-slate-50/80 dark:bg-slate-900/60 border-b border-slate-200/80 dark:border-slate-800/80"
      aria-label="ট্রাস্ট ব্যাজ"
    >
      <div className="mx-auto max-w-(--content-max) px-3 sm:px-6 lg:px-8">
        {/* Desktop 4 Columns | Mobile 2x2 Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
          {TRUST_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="flex items-center gap-3 p-3 sm:p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-2xs hover:border-amber-400 dark:hover:border-amber-500/50 hover:shadow-xs transition-all duration-200 group"
              >
                <div className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0 group-hover:scale-105 group-hover:bg-amber-500 group-hover:text-slate-950 transition-all duration-200">
                  <Icon className="h-5 w-5 sm:h-5 sm:w-5" aria-hidden />
                </div>
                <div className="flex flex-col min-w-0">
                  <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-slate-100 tracking-tight leading-snug truncate">
                    {item.title}
                  </h3>
                  <p className="text-[10px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400 leading-tight mt-0.5 truncate">
                    {item.sub}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default TrustSection;
