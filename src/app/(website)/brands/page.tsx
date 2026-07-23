import Link from "next/link";
import { getPublicBrandsAction } from "@/features/catalog/actions/public-actions";
import { Award, ArrowRight, CheckCircle2 } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "অফিসিয়াল ব্র্যান্ড পার্টনার - DropshopNN Bangladesh",
  description: "ইউগ্রিন, বেসাস, অ্যাঙ্কার, ওরাইমো, লজিটেক এবং শাওমি এর অফিসিয়াল ব্র্যান্ড গ্যাজেট সমূহ।",
};

export default async function BrandsPage() {
  const brandsRes = await getPublicBrandsAction();
  const brands = brandsRes.data;

  return (
    <div className="min-h-screen bg-[hsl(0_0%_98%)] text-slate-900 py-8">
      <div className="mx-auto max-w-(--content-max) px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10 text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-300 text-amber-900 text-xs font-black">
            <Award className="w-3.5 h-3.5 text-amber-600" /> অথরাইজড ইম্পোর্টার & ব্র্যান্ড পার্টনার
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            অফিসিয়াল ব্র্যান্ড পার্টনারসমূহ
          </h1>
          <p className="text-xs sm:text-sm font-bold text-slate-600">
            ১০০% অরিজিনাল ব্র্যান্ডের অফিশিয়াল গ্যারান্টি সহ সোর্স করুন সেরা দামে।
          </p>
        </div>

        {/* Brands Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {brands.map((brand) => (
            <Link
              key={brand.id}
              href={`/brands/${brand.slug}`}
              className="bg-white border border-slate-300 rounded-2xl p-6 hover:border-amber-400 hover:shadow-md transition-all duration-300 group flex flex-col justify-between"
            >
              <div>
                <div className="h-16 w-full flex items-center justify-center bg-slate-100 rounded-xl border border-slate-200 mb-4 p-3 group-hover:scale-105 transition-transform overflow-hidden">
                  {brand.logo ? (
                    <img src={brand.logo} alt={brand.name} className="max-h-full object-contain" />
                  ) : (
                    <span className="text-lg font-black text-amber-600">{brand.name}</span>
                  )}
                </div>
                <h2 className="text-lg font-black text-slate-900 group-hover:text-amber-600 transition-colors mb-1 flex items-center gap-1.5">
                  {brand.name} <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                </h2>
                <p className="text-xs font-bold text-slate-600 line-clamp-2 leading-relaxed mb-4">
                  {brand.description || `বাংলাদেশে অরিজিনাল ${brand.name} গ্যাজেট ও চার্জিং এক্সেসরিজ।`}
                </p>
              </div>

              <div className="inline-flex items-center justify-between text-xs font-extrabold text-amber-600 pt-3 border-t border-slate-200">
                <span>প্রোডাক্ট দেখুন</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
