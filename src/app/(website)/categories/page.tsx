import Link from "next/link";
import { getPublicCategoriesAction } from "@/features/catalog/actions/public-actions";
import { FolderTree, ArrowRight, Layers } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "সকল ক্যাটাগরি - DropshopNN Bangladesh",
  description: "ড্রপশিপিং ও পাইকারি বিক্রির জন্য সকল প্রোডাক্ট ক্যাটাগরি ব্রাউজ করুন।",
};

export default async function CategoriesPage() {
  const categoriesRes = await getPublicCategoriesAction();
  const categories = categoriesRes.data;

  return (
    <div className="min-h-screen bg-[hsl(0_0%_98%)] text-slate-900 py-8">
      <div className="mx-auto max-w-(--content-max) px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb & Header */}
        <div className="mb-10 text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-300 text-amber-900 text-xs font-black">
            <FolderTree className="w-3.5 h-3.5 text-amber-600" /> সম্পূর্ণ প্রোডাক্ট ডিরেক্টরি
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            সকল ক্যাটাগরি ব্রাউজ করুন
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 font-bold">
            অরিজিনাল গ্যাজেট, অডিও অ্যাক্সেসরিজ এবং ইলেকট্রনিক্স আইটেম ক্যাটাগরি অনুযায়ী বেছে নিন।
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <div
              key={category.id}
              className="bg-white border border-slate-300 rounded-2xl p-6 hover:border-amber-400 hover:shadow-md transition-all duration-300 group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 group-hover:scale-110 transition-transform">
                    <Layers className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-black text-slate-600 bg-slate-100 border border-slate-300 px-2.5 py-1 rounded-full">
                    ক্যাটাগরি
                  </span>
                </div>
                <h2 className="text-xl font-black text-slate-900 group-hover:text-amber-600 transition-colors mb-2">
                  {category.name}
                </h2>
                <p className="text-xs font-bold text-slate-600 line-clamp-2 leading-relaxed mb-4">
                  {category.description || `অরিজিনাল ${category.name} প্রোডাক্টসমূহ সারা বাংলাদেশে ফাস্ট শিপিং সহ কিনুন।`}
                </p>
              </div>

              <div>
                <Link
                  href={`/category/${category.slug}`}
                  className="w-full inline-flex items-center justify-between bg-slate-900 hover:bg-slate-800 text-white text-xs font-extrabold px-4 py-2.5 rounded-xl transition-colors group/btn"
                >
                  <span>প্রোডাক্ট দেখুন</span>
                  <ArrowRight className="w-3.5 h-3.5 text-amber-400 group-hover/btn:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
