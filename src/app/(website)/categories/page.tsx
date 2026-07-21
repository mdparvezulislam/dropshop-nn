import Link from "next/link";
import { getPublicCategoriesAction } from "@/features/catalog/actions/public-actions";
import { FolderTree, ArrowRight, Layers, Smartphone, Headphones, Zap, Laptop, ShieldCheck } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "All Categories - DropshopNN Bangladesh",
  description: "Explore all tech accessory categories including Chargers, Audio, Gaming Peripherals, Power Banks, and Smart Gadgets.",
};

export default async function CategoriesPage() {
  const categoriesRes = await getPublicCategoriesAction();
  const categories = categoriesRes.data;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Breadcrumb & Header */}
        <div className="mb-10 text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-amber-400 text-xs font-semibold mb-3">
            <FolderTree className="w-3.5 h-3.5" /> Complete Product Directory
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-heading tracking-tight mb-3">
            Browse All Categories
          </h1>
          <p className="text-sm text-slate-400">
            Source high quality gadgets, audio accessories, and peripherals sorted by official category.
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <div
              key={category.id}
              className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur-md hover:border-amber-500/40 transition-all duration-300 group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                    <Layers className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-medium text-slate-400 bg-slate-950 border border-slate-800 px-2.5 py-1 rounded-full">
                    Category
                  </span>
                </div>
                <h2 className="text-xl font-bold text-white font-heading group-hover:text-amber-400 transition-colors mb-2">
                  {category.name}
                </h2>
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-4">
                  {category.description || `Browse original ${category.name} products with fast Bangladesh shipping.`}
                </p>
              </div>

              <div>
                <Link
                  href={`/category/${category.slug}`}
                  className="w-full inline-flex items-center justify-between bg-slate-950 border border-slate-800 hover:border-amber-500/50 text-slate-300 hover:text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors group/btn"
                >
                  <span>Explore Products</span>
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
