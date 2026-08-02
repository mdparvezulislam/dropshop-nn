import { ShieldCheck, Truck, Lock, Headset, Award } from "lucide-react";
import { BRAND } from "@/config/brand";

const WHY_NN_ITEMS = [
  {
    icon: ShieldCheck,
    title: "১০০% অরিজিনাল প্রোডাক্ট",
    description: "যাচাইকৃত সোর্স ও অরিজিনাল কোয়ালিটি",
  },
  {
    icon: Award,
    title: "ব্র্যান্ড ওয়ারেন্টি",
    description: "অফিসিয়াল ও জেনুইন পার্টস ওয়ারেন্টি",
  },
  {
    icon: Truck,
    title: "৬৪ জেলায় দ্রুত ডেলিভারি",
    description: "পাথাও ও স্টিডফাস্ট কুরিয়ার ইন্টিগ্রেশন",
  },
  {
    icon: Lock,
    title: "নিরাপদ পেমেন্ট ও ক্যাশ অন ডেলিভারি",
    description: "bKash, Nagad ও কার্ড পেআউট সাপোর্ট",
  },
  {
    icon: Headset,
    title: "২৪/৭ বিজনেস সাপোর্ট",
    description: "ডেডিকেটেড হেল্পডেস্ক ও অ্যাকাউন্ট ম্যানেজার",
  },
];

export function WhyChooseUsSection(): React.ReactElement {
  return (
    <section
      className="py-6 sm:py-10 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100"
      aria-label="Why NN Enterprise"
    >
      <div className="mx-auto max-w-(--content-max) px-3 sm:px-6 lg:px-8">
        <div className="text-center mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-slate-100">
            কেন <span className="text-amber-500">{BRAND.publicName}</span> ভরসার প্রতীক?
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-bold mt-0.5">
            আমাদের সেবা ও প্ল্যাটফর্মের বিশেষ সুবিধাসমূহ
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-4">
          {WHY_NN_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="flex flex-col items-center text-center p-3.5 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-amber-400 dark:hover:border-amber-500 hover:shadow-md transition-all duration-300 group"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform border border-amber-200 dark:border-amber-800">
                  <Icon className="h-5 w-5" aria-hidden />
                </div>
                <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-slate-100 leading-snug">
                  {item.title}
                </h3>
                <p className="text-[10px] sm:text-[11px] font-bold text-slate-500 dark:text-slate-400 leading-tight mt-0.5">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default WhyChooseUsSection;
