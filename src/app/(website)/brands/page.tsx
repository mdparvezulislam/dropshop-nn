import Link from "next/link";
import Image from "next/image";
import { getPublicBrandsAction } from "@/features/catalog/actions/public-actions";
import { Award, ArrowRight, ShieldCheck, CheckCircle2 } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Official Brands & Importers - DropshopNN Bangladesh",
  description: "Browse official brand partners including UGREEN, Baseus, Anker, Oraimo, Logitech, A4Tech, and Xiaomi in BD.",
};

export default async function BrandsPage() {
  const brandsRes = await getPublicBrandsAction();
  const brands = brandsRes.data;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-10 text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-amber-400 text-xs font-semibold mb-3">
            <Award className="w-3.5 h-3.5" /> Authorized Importers & Brand Partners
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-heading tracking-tight mb-3">
            Official Brand Partners
          </h1>
          <p className="text-sm text-slate-400">
            All tech gadgets & accessories are sourced directly from verified BD brand representatives with 1 Year Official Warranty.
          </p>
        </div>

        {/* Brands Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {brands.map((brand) => (
            <Link
              key={brand.id}
              href={`/brands/${brand.slug}`}
              className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur-md hover:border-amber-500/40 transition-all duration-300 group flex flex-col justify-between"
            >
              <div>
                <div className="h-16 w-full flex items-center justify-center bg-slate-950/60 rounded-xl border border-slate-800/80 mb-4 p-3 group-hover:scale-105 transition-transform overflow-hidden">
                  {brand.logo ? (
                    <img src={brand.logo} alt={brand.name} className="max-h-full object-contain filter grayscale group-hover:grayscale-0 transition-all" />
                  ) : (
                    <span className="text-lg font-bold text-amber-400 font-heading">{brand.name}</span>
                  )}
                </div>
                <h2 className="text-lg font-bold text-white font-heading group-hover:text-amber-400 transition-colors mb-1 flex items-center gap-1.5">
                  {brand.name} <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                </h2>
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-4">
                  {brand.description || `Official ${brand.name} accessories, chargers & gear in Bangladesh.`}
                </p>
              </div>

              <div className="inline-flex items-center justify-between text-xs font-semibold text-amber-400 pt-3 border-t border-slate-800/80">
                <span>View Products</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
