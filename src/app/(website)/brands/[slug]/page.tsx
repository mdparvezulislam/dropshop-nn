import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublicBrandProductsAction } from "@/features/catalog/actions/public-actions";
import { ProductsCatalogClient } from "@/components/website/products-catalog-client";
import { ArrowLeft, Award, CheckCircle2 } from "lucide-react";
import type { ProductCardData } from "@/components/website/product-card";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const result = await getPublicBrandProductsAction(slug);
  if (!result.data) return { title: "Brand Not Found - DropshopNN" };
  const { brand } = result.data;

  return {
    title: `${brand.name} প্রোডাক্টস - DropshopNN অফিসিয়াল পার্টনার`,
    description: brand.description || `বাংলাদেশে ১০০% অরিজিনাল ${brand.name} গ্যাজেট ও ইলেকট্রনিক্স এক্সেসরিজ কিনুন।`,
  };
}

export default async function BrandDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const result = await getPublicBrandProductsAction(slug);

  if (!result.data) {
    notFound();
  }

  const { brand, products } = result.data;

  const mappedProducts: ProductCardData[] = products.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    image: p.image || "",
    retailPrice: p.retailPrice,
    resellerPrice: p.resellerPrice,
    wholesalePrice: p.wholesalePrice,
    comparePrice: p.comparePrice,
    rating: p.rating ?? 4.8,
    reviewCount: p.reviewCount ?? 15,
    brand: brand.name,
    stockStatus: p.stockStatus as "in_stock" | "low_stock" | "out_of_stock",
    moq: p.moq,
    isNew: true,
  }));

  return (
    <div className="min-h-screen bg-[hsl(0_0%_98%)] text-slate-900 py-8">
      <div className="mx-auto max-w-(--content-max) px-4 sm:px-6 lg:px-8">
        {/* Navigation Breadcrumb */}
        <Link
          href="/brands"
          className="inline-flex items-center gap-1.5 text-xs font-extrabold text-amber-600 hover:underline mb-6"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> সকল ব্র্যান্ড
        </Link>

        {/* Brand Banner Card */}
        <div className="bg-white border border-slate-300 rounded-3xl p-6 sm:p-8 shadow-xs mb-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 bg-slate-100 rounded-2xl border border-slate-300 p-3 flex items-center justify-center shrink-0">
              {brand.logo ? (
                <img src={brand.logo} alt={brand.name} className="max-h-full object-contain" />
              ) : (
                <Award className="w-10 h-10 text-amber-500" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900">{brand.name}</h1>
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              </div>
              <p className="text-xs sm:text-sm font-bold text-slate-600 max-w-xl leading-relaxed">
                {brand.description || `বাংলাদেশে ${brand.name} ব্র্যান্ডের ১০০% অরিজিনাল গ্যাজেট ও ইলেকট্রনিক্স প্রোডাক্টের বিশ্বস্ত সাপ্লাই।`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="bg-amber-50 border border-amber-300 px-4 py-2.5 rounded-2xl text-center">
              <span className="block text-xl font-black text-amber-900">{products.length}</span>
              <span className="text-[10px] font-black text-amber-950 uppercase">একটিভ প্রোডাক্টস</span>
            </div>
            <div className="bg-emerald-50 border border-emerald-300 px-4 py-2.5 rounded-2xl text-center">
              <span className="block text-xs font-black text-emerald-900">১ বছর</span>
              <span className="text-[10px] font-black text-emerald-950 uppercase">অফিসিয়াল ওয়ারেন্টি</span>
            </div>
          </div>
        </div>

        {/* Products Catalog Suite */}
        <ProductsCatalogClient
          initialProducts={mappedProducts}
          categories={[]}
          brands={[]}
        />
      </div>
    </div>
  );
}
