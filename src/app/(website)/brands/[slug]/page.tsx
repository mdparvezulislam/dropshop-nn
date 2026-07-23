import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublicBrandProductsAction } from "@/features/catalog/actions/public-actions";
import { ProductCard } from "@/components/website/product-card";
import { ShieldCheck, ArrowLeft, Award, CheckCircle2 } from "lucide-react";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const result = await getPublicBrandProductsAction(slug);
  if (!result.data) return { title: "Brand Not Found" };
  const { brand } = result.data;

  return {
    title: `${brand.name} Products - DropshopNN Official Importer`,
    description: brand.description || `Browse original ${brand.name} accessories and gadgets with official warranty in Bangladesh.`,
  };
}

export default async function BrandDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const result = await getPublicBrandProductsAction(slug);

  if (!result.data) {
    notFound();
  }

  const { brand, products } = result.data;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Navigation */}
        <Link href="/brands" className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-amber-400 mb-6 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Brand Directory
        </Link>

        {/* Brand Header Banner */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-md mb-10 flex flex-col md:flex-row items-center gap-6 justify-between">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 bg-slate-950 rounded-2xl border border-slate-800 p-3 flex items-center justify-center shrink-0">
              {brand.logo ? (
                <img src={brand.logo} alt={brand.name} className="max-h-full object-contain" />
              ) : (
                <Award className="w-10 h-10 text-amber-400" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-heading">{brand.name}</h1>
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              </div>
              <p className="text-xs text-slate-400 max-w-xl leading-relaxed">
                {brand.description || `Official importer & distributor of ${brand.name} electronic gadgets in BD.`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="bg-slate-950 border border-slate-800 px-4 py-2.5 rounded-xl text-center">
              <span className="block text-lg font-bold text-amber-400">{products.length}</span>
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Active Products</span>
            </div>
            <div className="bg-emerald-500/10 border border-emerald-500/20 px-4 py-2.5 rounded-xl text-center">
              <span className="block text-xs font-bold text-emerald-400">1 Year</span>
              <span className="text-[10px] text-emerald-300/80 font-semibold uppercase">Official Warranty</span>
            </div>
          </div>
        </div>

        {/* Product Catalog */}
        <h2 className="text-xl font-bold text-white mb-6 font-heading">
          {brand.name} Catalog ({products.length})
        </h2>

        {products.length === 0 ? (
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-12 text-center">
            <p className="text-xs text-slate-400">No products currently listed for this brand.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
