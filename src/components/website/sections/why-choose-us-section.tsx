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
      className="py-8 sm:py-12 lg:py-16 bg-white border-b border-slate-200"
      aria-label="Why Choose Us"
    >
      <div className="mx-auto max-w-(--content-max) px-3 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
            কেন <span className="text-amber-500">{BRAND.publicName}</span> সেরা?
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 font-bold mt-1">
            আমাদের সাথে ব্যবসা করার সুবিধাসমূহ
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {WHY_CHOOSE_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="flex flex-col items-center text-center p-5 rounded-2xl bg-white border border-slate-300 hover:border-amber-400 hover:shadow-md transition-all duration-300 group"
              >
                <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-xs sm:text-sm font-black text-slate-900 leading-snug">
                  {item.title}
                </h3>
                <p className="text-[11px] font-bold text-slate-600 leading-tight mt-1">
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
