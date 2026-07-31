import { UserCheck, RefreshCw, RotateCcw, Image, ShieldCheck } from "lucide-react";
import { BRAND } from "@/config/brand";

const WHY_CHOOSE_ITEMS = [
  {
    icon: UserCheck,
    title: "ফ্রি রেজিস্ট্রেশন",
    description: "একদম ফ্রি মেম্বারশিপ",
  },
  {
    icon: RefreshCw,
    title: "নিয়মিত প্রোডাক্ট আপডেট",
    description: "নতুন নতুন প্রোডাক্ট যুক্ত হয়",
  },
  {
    icon: RotateCcw,
    title: "সহজ রিটার্ন পলিসি",
    description: "নির্দিষ্ট সময়ের মধ্যে রিটার্ন",
  },
  {
    icon: Image,
    title: "মার্কেটিং সাপোর্ট",
    description: "পোস্টার, ছবি, ভিডিও ফ্রি",
  },
  {
    icon: ShieldCheck,
    title: "নিরাপদ পেমেন্ট সিস্টেম",
    description: "নিরাপদ ও দ্রুত পেমেন্ট",
  },
];

export function WhyChooseUsSection(): React.ReactElement {
  return (
    <section
      className="py-6 sm:py-10 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100"
      aria-label="Why Choose Us"
    >
      <div className="mx-auto max-w-(--content-max) px-3 sm:px-6 lg:px-8">
        <div className="text-center mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-slate-100">
            কেন <span className="text-amber-500">{BRAND.publicName}</span> সেরা?
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-bold mt-0.5">
            আমাদের সাথে ব্যবসা করার সুবিধাসমূহ
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-4">
          {WHY_CHOOSE_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="flex flex-col items-center text-center p-3.5 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-amber-400 dark:hover:border-amber-500 hover:shadow-md transition-all duration-300 group"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform">
                  <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
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
