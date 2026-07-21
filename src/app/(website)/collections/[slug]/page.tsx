import Link from "next/link";
import { getPublicFeaturedProductsAction, getPublicTrendingProductsAction, getPublicFlashDealsAction } from "@/features/catalog/actions/public-actions";
import { ProductCard } from "@/shared/components/website/product-card";
import { ArrowLeft, Sparkles } from "lucide-react";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const title = slug.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  return {
    title: `${title} Collection - DropshopNN Bangladesh`,
    description: `Browse curated ${title} products with verified warranty and fast BD shipping.`,
  };
}

export default async function CollectionDetailPage({ params }: PageProps) {
  const { slug } = await params;

  let productsRes = await getPublicFeaturedProductsAction(16);
  if (slug === "trending-now") {
    productsRes = await getPublicTrendingProductsAction(16);
  } else if (slug === "fast-charging-hub") {
    productsRes = await getPublicFlashDealsAction(16);
  }

  const products = productsRes.data;
  const title = slug.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10">
      <div className="container mx-auto px-4 max-w-7xl">
        <Link href="/collections" className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-amber-400 mb-6 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to All Collections
        </Link>

        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-8 backdrop-blur-md mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" /> Special Collection
          </div>
          <h1 className="text-3xl font-extrabold text-white font-heading">{title}</h1>
          <p className="text-sm text-slate-400 mt-2 max-w-2xl">
            Explore curated tech accessories and gadgets selected for superior quality and performance.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
}
