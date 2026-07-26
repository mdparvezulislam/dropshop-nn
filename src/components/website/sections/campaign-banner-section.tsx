"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  ArrowRight,
  Store,
  Building2,
  Tag,
  Truck,
  TrendingUp,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export function CampaignBannerSection(): React.ReactElement {
  return (
    <section
      className="py-12 lg:py-16 bg-white border-b border-border/50"
      aria-label="Business Opportunity Banners"
    >
      <div className="mx-auto max-w-(--content-max) px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Box - Reseller Dropshipping Banner matching reference image */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35 }}
            className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950 text-white p-6 sm:p-8 border border-slate-800 shadow-xl flex flex-col justify-between"
          >
            <div className="space-y-4 relative z-10">
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white leading-snug">
                রিসেলার হয়ে শুরু করুন <br />
                <span className="text-amber-400">আপনার নিজের অনলাইন ব্যবসা</span>
              </h2>

              <div className="grid grid-cols-2 gap-2.5 text-xs text-slate-200 font-semibold pt-1">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-amber-400 shrink-0" />
                  <span>জিরো ইনভেস্টমেন্ট</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-amber-400 shrink-0" />
                  <span>বেশি লাভ</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-amber-400 shrink-0" />
                  <span>ফ্রি মার্কেটিং সাপোর্ট</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-amber-400 shrink-0" />
                  <span>স্টক ছাড়াই ব্যবসা</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-6 relative z-10">
              <Link href="/become-reseller">
                <Button
                  size="sm"
                  className="h-10 px-5 text-xs font-extrabold bg-amber-500 hover:bg-amber-600 text-white shadow-md"
                >
                  <Store className="h-3.5 w-3.5 mr-1.5" />
                  রিসেলার রেজিস্ট্রেশন
                </Button>
              </Link>
              <Link href="/become-reseller">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-10 px-5 text-xs font-bold border-white/30 text-white hover:bg-white/10 hover:border-white"
                >
                  বিস্তারিত জানুন
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Right Box - Wholesale Bulk Order Banner matching reference image */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35, delay: 0.1 }}
            className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-stone-950 via-slate-900 to-amber-950 text-white p-6 sm:p-8 border border-slate-800 shadow-xl flex flex-col justify-between"
          >
            <div className="space-y-4 relative z-10">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white leading-snug">
                  হোলসেল করুন, বেশি লাভ করুন <br />
                  <span className="text-amber-400">বাল্ক অর্ডারে বিশেষ ডিসকাউন্ট</span>
                </h2>
              </div>

              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-amber-500/20 border border-amber-500/40 text-xs font-bold text-amber-300">
                <Tag className="h-3.5 w-3.5" />
                <span>কুপন: 10% বাল্ক অফার</span>
              </div>
            </div>

            <div className="space-y-4 pt-4 relative z-10">
              <div className="flex flex-wrap items-center gap-3">
                <Link href="/become-wholesale-partner">
                  <Button
                    size="sm"
                    className="h-10 px-5 text-xs font-extrabold bg-amber-500 hover:bg-amber-600 text-white shadow-md"
                  >
                    <Building2 className="h-3.5 w-3.5 mr-1.5" />
                    প্রোডাক্ট ক্যাটালগ
                  </Button>
                </Link>
                <Link href="/become-wholesale-partner">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-10 px-5 text-xs font-bold border-white/30 text-white hover:bg-white/10 hover:border-white"
                  >
                    বিস্তারিত জানুন
                  </Button>
                </Link>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-white/10 text-[11px] font-semibold text-slate-300">
                <div className="flex items-center gap-1">
                  <TrendingUp className="h-3.5 w-3.5 text-amber-400" />
                  <span>সেরা পাইকারি দাম</span>
                </div>
                <div className="flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-amber-400" />
                  <span>নিয়মিত স্টক আপডেট</span>
                </div>
                <div className="flex items-center gap-1">
                  <Truck className="h-3.5 w-3.5 text-amber-400" />
                  <span>দ্রুত ডেলিভারি সাপোর্ট</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default CampaignBannerSection;
