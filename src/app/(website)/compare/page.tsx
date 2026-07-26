import Link from "next/link";
import Image from "next/image";
import { getPublicFeaturedProductsAction } from "@/features/catalog/actions/public-actions";
import { Scale, ShoppingCart } from "lucide-react";
import { PRODUCT_IMAGE_PLACEHOLDER } from "@/config/site";
import type { PublicProductCard } from "@/features/catalog/domain/public-catalog-types";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Compare Products",
  description: "Compare product specifications and prices side-by-side.",
  robots: { index: false },
};

function stockLabel(status: PublicProductCard["stockStatus"]): string {
  if (status === "out_of_stock") return "স্টক শেষ";
  if (status === "low_stock") return "সীমিত স্টক";
  return "স্টকে আছে";
}

export default async function ComparePage() {
  const featuredRes = await getPublicFeaturedProductsAction(4);
  const products = featuredRes.success ? featuredRes.data.slice(0, 3) : [];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="mb-10 text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-amber-400 text-xs font-semibold mb-3">
            <Scale className="w-3.5 h-3.5" aria-hidden /> Product Comparison
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-3">
            প্রোডাক্ট তুলনা করুন
          </h1>
          <p className="text-sm text-slate-400">
            নিচে আমাদের বাছাই করা প্রোডাক্টগুলোর তুলনা দেখানো হচ্ছে। নিজের পছন্দমতো প্রোডাক্ট তুলনা
            করার সুবিধা শীঘ্রই আসছে।
          </p>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-16 bg-slate-900/60 border border-slate-800 rounded-3xl">
            <p className="text-sm font-bold text-slate-400 mb-4">
              তুলনা করার মতো কোনো প্রোডাক্ট পাওয়া যায়নি।
            </p>
            <Link
              href="/products"
              className="inline-flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-5 py-2.5 rounded-lg transition-colors"
            >
              ক্যাটালগ দেখুন
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto bg-slate-900/60 border border-slate-800 rounded-3xl backdrop-blur-md">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/80">
                  <th className="p-4 sm:p-6 w-1/4 font-semibold text-slate-400">Product</th>
                  {products.map((p) => (
                    <th key={p.id} className="p-4 sm:p-6 w-1/4 align-top">
                      <div className="space-y-3">
                        <div className="relative h-32 bg-slate-950 border border-slate-800 rounded-xl p-2 overflow-hidden">
                          <Image
                            src={p.image || PRODUCT_IMAGE_PLACEHOLDER}
                            alt={p.name}
                            fill
                            className="object-contain p-2"
                            sizes="(max-width: 768px) 33vw, 250px"
                          />
                        </div>
                        <h2 className="font-bold text-white line-clamp-2 text-sm">{p.name}</h2>
                        {p.price > 0 ? (
                          <div className="text-amber-400 font-extrabold text-sm tabular-nums">
                            ৳{p.price.toLocaleString("en-BD", { maximumFractionDigits: 0 })}
                            {p.comparePrice !== undefined && (
                              <span className="ml-2 text-slate-500 line-through font-medium">
                                ৳
                                {p.comparePrice.toLocaleString("en-BD", {
                                  maximumFractionDigits: 0,
                                })}
                              </span>
                            )}
                          </div>
                        ) : (
                          <div className="text-slate-400 font-bold text-xs">
                            দামের জন্য যোগাযোগ করুন
                          </div>
                        )}
                        <Link
                          href={`/product/${p.slug}`}
                          className="w-full inline-flex items-center justify-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold py-2 rounded-lg transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400"
                        >
                          <ShoppingCart className="w-3.5 h-3.5" aria-hidden /> প্রোডাক্ট দেখুন
                        </Link>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                <tr>
                  <td className="p-4 sm:p-6 font-semibold text-slate-400">ব্র্যান্ড</td>
                  {products.map((p) => (
                    <td key={p.id} className="p-4 sm:p-6 text-slate-200">
                      {p.brandName ?? "—"}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-4 sm:p-6 font-semibold text-slate-400">ক্যাটাগরি</td>
                  {products.map((p) => (
                    <td key={p.id} className="p-4 sm:p-6 text-slate-200">
                      {p.categoryName ?? "—"}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-4 sm:p-6 font-semibold text-slate-400">স্টক</td>
                  {products.map((p) => (
                    <td key={p.id} className="p-4 sm:p-6">
                      <span
                        className={
                          p.stockStatus === "out_of_stock"
                            ? "text-red-400 font-medium"
                            : "text-emerald-400 font-medium"
                        }
                      >
                        {stockLabel(p.stockStatus)}
                      </span>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
