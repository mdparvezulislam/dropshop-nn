import Link from "next/link";
import { CheckCircle2, Store, Building2, Truck, TrendingUp, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Business-program banners. No coupon or discount claims — a real campaign
 * engine drives those in a later phase.
 */
export function CampaignBannerSection(): React.ReactElement {
  return (
    <section
      className="py-6 sm:py-10 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800"
      aria-label="Business Opportunity Banners"
    >
      <div className="mx-auto max-w-(--content-max) px-3 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left — Reseller program banner */}
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950 text-white p-6 sm:p-8 border border-slate-800 shadow-xl flex flex-col justify-between">
            <div className="space-y-4 relative z-10">
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white leading-snug">
                রিসেলার হয়ে শুরু করুন <br />
                <span className="text-amber-400">আপনার নিজের অনলাইন ব্যবসা</span>
              </h2>

              <div className="grid grid-cols-2 gap-2.5 text-xs text-slate-200 font-semibold pt-1">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-amber-400 shrink-0" aria-hidden />
                  <span>জিরো ইনভেস্টমেন্ট</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-amber-400 shrink-0" aria-hidden />
                  <span>স্টক ছাড়াই ব্যবসা</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-amber-400 shrink-0" aria-hidden />
                  <span>ফ্রি মার্কেটিং সাপোর্ট</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-amber-400 shrink-0" aria-hidden />
                  <span>ডেলিভারি আমরা সামলাই</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-6 relative z-10">
              <Link href="/become-reseller">
                <Button
                  size="sm"
                  className="h-10 px-5 text-xs font-extrabold bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-md"
                >
                  <Store className="h-3.5 w-3.5 mr-1.5" aria-hidden />
                  রিসেলার রেজিস্ট্রেশন
                </Button>
              </Link>
              <Link href="/become-reseller">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-10 px-5 text-xs bg-white font-bold border-white/30 text-black hover:bg-orange-500 hover:border-white"
                >
                  বিস্তারিত জানুন
                </Button>
              </Link>
            </div>
          </div>

          {/* Right — Wholesale program banner */}
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-stone-950 via-slate-900 to-amber-950 text-white p-6 sm:p-8 border border-slate-800 shadow-xl flex flex-col justify-between">
            <div className="space-y-4 relative z-10">
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white leading-snug">
                হোলসেল পার্টনার হন <br />
                <span className="text-amber-400">বাল্ক অর্ডারে পাইকারি দাম</span>
              </h2>
            </div>

            <div className="space-y-4 pt-4 relative z-10">
              <div className="flex flex-wrap items-center gap-3">
                <Link href="/become-wholesale-partner">
                  <Button
                    size="sm"
                    className="h-10 px-5 text-xs font-extrabold bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-md"
                  >
                    <Building2 className="h-3.5 w-3.5 mr-1.5" aria-hidden />
                    হোলসেল পার্টনার হন
                  </Button>
                </Link>
                <Link href="/become-wholesale-partner">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-10 px-5 text-xs font-bold border-white/30 text-white bg-black hover:bg-white/10 hover:border-white"
                  >
                    বিস্তারিত জানুন
                  </Button>
                </Link>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-white/10 text-[11px] font-semibold text-slate-300">
                <div className="flex items-center gap-1">
                  <TrendingUp className="h-3.5 w-3.5 text-amber-400" aria-hidden />
                  <span>পাইকারি রেট</span>
                </div>
                <div className="flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-amber-400" aria-hidden />
                  <span>নিয়মিত স্টক আপডেট</span>
                </div>
                <div className="flex items-center gap-1">
                  <Truck className="h-3.5 w-3.5 text-amber-400" aria-hidden />
                  <span>ডেলিভারি সাপোর্ট</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default CampaignBannerSection;
