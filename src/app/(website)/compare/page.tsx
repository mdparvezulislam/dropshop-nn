import Link from "next/link";
import { getPublicFeaturedProductsAction } from "@/features/catalog/actions/public-actions";
import { Scale, Check, X, ShieldCheck, ShoppingCart, ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Compare Products - DropshopNN Bangladesh",
  description: "Compare specifications, retail vs wholesale prices, warranties, and features side-by-side.",
};

export default async function ComparePage() {
  const featuredRes = await getPublicFeaturedProductsAction(4);
  const products = featuredRes.data.slice(0, 3);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="mb-10 text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-amber-400 text-xs font-semibold mb-3">
            <Scale className="w-3.5 h-3.5" /> Product Comparison Matrix
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-heading tracking-tight mb-3">
            Compare Tech Specs & Prices
          </h1>
          <p className="text-sm text-slate-400">
            Compare specifications, charging speeds, audio drivers, and reseller margins side-by-side.
          </p>
        </div>

        {/* Comparison Table */}
        <div className="overflow-x-auto bg-slate-900/60 border border-slate-800 rounded-3xl backdrop-blur-md">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/80">
                <th className="p-4 sm:p-6 w-1/4 font-semibold text-slate-400">Product Features</th>
                {products.map((p) => (
                  <th key={p.id} className="p-4 sm:p-6 w-1/4 align-top">
                    <div className="space-y-3">
                      <div className="h-32 bg-slate-950 border border-slate-800 rounded-xl p-2 flex items-center justify-center overflow-hidden">
                        <img src={p.image} alt={p.name} className="max-h-full object-contain" />
                      </div>
                      <h3 className="font-bold text-white line-clamp-2">{p.name}</h3>
                      <div className="text-amber-400 font-extrabold text-sm">
                        ৳{(p.retailPrice / 100).toLocaleString("en-BD")} BDT
                      </div>
                      <Link
                        href={`/product/${p.slug}`}
                        className="w-full inline-flex items-center justify-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold py-2 rounded-lg transition-colors"
                      >
                        <ShoppingCart className="w-3.5 h-3.5" /> View Product
                      </Link>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              <tr>
                <td className="p-4 sm:p-6 font-semibold text-slate-400">Warranty</td>
                {products.map((p) => (
                  <td key={p.id} className="p-4 sm:p-6 text-slate-200">
                    <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
                      <ShieldCheck className="w-4 h-4" /> 1 Year Official
                    </span>
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-4 sm:p-6 font-semibold text-slate-400">Stock Availability</td>
                {products.map((p) => (
                  <td key={p.id} className="p-4 sm:p-6 text-slate-200">
                    <span className="inline-flex items-center gap-1.5 text-emerald-400 font-medium bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full text-[11px]">
                      <Check className="w-3.5 h-3.5" /> In Stock (Dhaka Hub)
                    </span>
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-4 sm:p-6 font-semibold text-slate-400">Courier Shipping</td>
                {products.map((p) => (
                  <td key={p.id} className="p-4 sm:p-6 text-slate-300">
                    24h Dhaka / 48h Nationwide
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-4 sm:p-6 font-semibold text-slate-400">Reseller Support</td>
                {products.map((p) => (
                  <td key={p.id} className="p-4 sm:p-6 text-slate-200">
                    <span className="text-amber-400 font-medium">Marketing Kit Available</span>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
