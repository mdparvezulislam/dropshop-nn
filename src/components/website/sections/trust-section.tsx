import { ShieldCheck, TrendingUp, Truck, CreditCard, Headset } from "lucide-react";

const TRUST_ITEMS = [
  {
    icon: ShieldCheck,
    label: "অরিজিনাল প্রোডাক্ট",
    description: "১০০% অরিজিনাল প্রোডাক্ট",
  },
  {
    icon: TrendingUp,
    label: "সহজ ড্রপশিপিং",
    description: "স্টক ছাড়াই ব্যবসা শুরু করুন",
  },
  {
    icon: Truck,
    label: "সারাদেশে ডেলিভারি",
    description: "৬৪ জেলায় ডেলিভারি",
  },
  {
    icon: CreditCard,
    label: "সিকিউর পেমেন্ট",
    description: "বিকাশ, নগদ ও ক্যাশ অন ডেলিভারি",
  },
  {
    icon: Headset,
    label: "কাস্টমার সাপোর্ট",
    description: "প্রয়োজনে সহায়তা পান",
  },
] as const;

export function TrustSection(): React.ReactElement {
  return (
    <section
      className="w-full py-6 lg:py-8 bg-white border-y border-slate-200"
      aria-label="Trust Bar"
    >
      <div className="mx-auto max-w-(--content-max) px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 lg:gap-4">
          {TRUST_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className="flex items-center gap-3 p-3.5 rounded-2xl bg-white border border-slate-300 hover:border-amber-400 hover:shadow-xs transition-all duration-300 group"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-50 text-amber-600 shrink-0 group-hover:scale-110 transition-transform">
                  <Icon className="h-5 w-5" aria-hidden />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-black text-slate-900 leading-snug">
                    {item.label}
                  </h3>
                  <p className="text-[11px] font-bold text-slate-600 leading-tight mt-0.5">
                    {item.description}
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
