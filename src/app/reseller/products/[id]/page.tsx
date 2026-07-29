"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  Package,
  Heart,
  Share2,
  Download,
  Plus,
  ArrowLeft,
  Truck,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  Flame,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResellerProfitCalculator } from "@/features/reseller-workspace/components/reseller-profit-calculator";
import { ResellerProductMarketingKitTab } from "@/features/reseller-workspace/components/reseller-product-marketing-kit-tab";
import { ResellerProductCard } from "@/features/reseller-workspace/components/reseller-product-card";
import { toast } from "sonner";
import { cn } from "@/lib/utils/cn";

export default function ResellerProductDetailsPage(): React.ReactElement {
  const params = useParams();
  const router = useRouter();
  const productId = (params.id as string) || "";

  const [loading, setLoading] = React.useState(true);
  const [product, setProduct] = React.useState<any>(null);
  const [selectedImage, setSelectedImage] = React.useState<string | null>(null);
  const [isPriceValid, setIsPriceValid] = React.useState(true);
  const [customPriceCents, setCustomPriceCents] = React.useState<number>(0);
  const [customProfitCents, setCustomProfitCents] = React.useState<number>(0);
  const [isFavorite, setIsFavorite] = React.useState(false);
  const [relatedProducts, setRelatedProducts] = React.useState<any[]>([]);

  React.useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const { getResellerByIdAction, searchResellerProductsAction } = await import(
          "@/features/reseller/actions/reseller-actions"
        );

        const res = await searchResellerProductsAction({
          resellerId: "me",
          page: 1,
          limit: 10,
        });

        if (res.success && res.data) {
          const items = (res.data as any).items || [];
          const found = items.find((p: any) => (p.id || p._id) === productId) || items[0];

          if (found) {
            const wholesaleCost = found.pricing?.costBasis ?? 150000;
            const mrp = found.pricing?.recommendedPrice ?? Math.round(wholesaleCost * 1.5);
            const minPrice = found.pricing?.minPrice ?? Math.round(wholesaleCost * 1.05);
            const suggestedPrice = found.pricing?.sellingPrice ?? Math.round(wholesaleCost * 1.25);

            const item = {
              id: found.id || found._id,
              name: found.customTitle ?? found.product?.name ?? found.productName ?? "Reseller Premium Item",
              sku: found.variantSku ?? found.product?.sku ?? found.sku ?? "RSL-9988",
              category: found.product?.category?.name || "Electronics & Gadgets",
              brand: found.product?.brand?.name || "NN Enterprise",
              description: found.product?.description || "প্রিমিয়াম কোয়ালিটি রিসেলার প্রোডাক্ট। গ্রাহকদের জন্য দ্রুত শিপিং সুবিধা।",
              mrp,
              wholesaleCost,
              minPrice,
              suggestedPrice,
              availableStock: found.availableStock ?? 15,
              status: "in_stock",
              images: [
                found.product?.primaryImage?.url || found.imageUrl || "/placeholder.jpg",
                found.product?.images?.[1]?.url,
                found.product?.images?.[2]?.url,
              ].filter(Boolean),
            };

            setProduct(item);
            setSelectedImage(item.images[0] || null);
            setCustomPriceCents(suggestedPrice);
            setCustomProfitCents(suggestedPrice - wholesaleCost);

            // Related items
            const related = items
              .filter((p: any) => (p.id || p._id) !== item.id)
              .slice(0, 4)
              .map((p: any) => ({
                id: p.id || p._id,
                name: p.customTitle ?? p.product?.name ?? "Related Product",
                sku: p.variantSku ?? "RSL-REL",
                mrp: p.pricing?.recommendedPrice ?? 200000,
                wholesaleCost: p.pricing?.costBasis ?? 150000,
                minPrice: p.pricing?.costBasis ?? 150000,
                suggestedPrice: p.pricing?.sellingPrice ?? 180000,
                availableStock: p.availableStock ?? 10,
                status: "in_stock",
              }));
            setRelatedProducts(related);
          }
        }
      } catch {
        toast.error("Failed to load product details");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [productId]);

  const handlePriceChange = (valid: boolean, priceCents: number, profitCents: number) => {
    setIsPriceValid(valid);
    setCustomPriceCents(priceCents);
    setCustomProfitCents(profitCents);
  };

  const handleQuickOrderClick = () => {
    if (!isPriceValid) {
      toast.error("নূন্যতম বিক্রয় মূল্য (রিসেলার মূল্যের চেয়ে কম দামে বিক্রি করা সম্ভব নয়)");
      return;
    }
    router.push(
      `/reseller/orders/create?productId=${product.id}&price=${(customPriceCents / 100).toFixed(0)}`,
    );
  };

  if (loading) {
    return (
      <div className="p-16 text-center text-sm font-semibold text-muted-foreground animate-fade-in">
        Loading reseller product selling details...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="p-16 text-center text-sm font-semibold text-muted-foreground space-y-4">
        <p>Product not found in catalog.</p>
        <Link href="/reseller/products">
          <Button variant="outline" size="sm" className="gap-2">
            <ArrowLeft className="w-4 h-4" /> Back to Products
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in pb-20 lg:pb-8">
      {/* Top Breadcrumb Header */}
      <div className="flex items-center justify-between gap-3 border-b border-border pb-3">
        <Link
          href="/reseller/products"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Reseller Catalog
        </Link>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setIsFavorite((v) => !v);
              toast.success(!isFavorite ? "Added to Wishlist" : "Removed from Wishlist");
            }}
            className={cn(
              "p-2 rounded-xl border border-border transition-colors",
              isFavorite ? "bg-red-500/10 text-red-500 border-red-500/30" : "text-muted-foreground hover:bg-muted",
            )}
            title="Wishlist"
          >
            <Heart className={cn("w-4 h-4", isFavorite && "fill-current")} />
          </button>
        </div>
      </div>

      {/* Main Product Layout (2 Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Gallery & Info (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="border-border/80 shadow-xs overflow-hidden">
            <CardContent className="p-3 space-y-3">
              {/* Main Image */}
              <div className="relative aspect-square rounded-xl bg-muted overflow-hidden border border-border/60">
                {selectedImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={selectedImage} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    <Package className="w-12 h-12" />
                  </div>
                )}
                <div className="absolute top-3 left-3">
                  <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-success/15 text-success border border-success/30 backdrop-blur-md">
                    In Stock ({product.availableStock})
                  </span>
                </div>
              </div>

              {/* Thumbnails */}
              {product.images && product.images.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {product.images.map((img: string, idx: number) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(img)}
                      className={cn(
                        "w-14 h-14 rounded-lg bg-muted overflow-hidden border transition-all shrink-0",
                        selectedImage === img ? "border-primary ring-2 ring-primary/20" : "border-border/60 opacity-70 hover:opacity-100",
                      )}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Delivery & Warranty Info Card */}
          <Card className="border-border/80 shadow-2xs">
            <CardContent className="p-4 space-y-3 text-xs">
              <div className="flex items-center gap-2.5 text-foreground font-bold border-b border-border/40 pb-2">
                <Truck className="w-4 h-4 text-primary shrink-0" />
                <span>শিপিং ও ডেলিভারি তথ্য:</span>
              </div>
              <div className="space-y-1.5 text-muted-foreground font-semibold leading-relaxed">
                <p>• ঢাকার ভেতরে: ২৪-৪৮ ঘণ্টা (ডেলিভারি চার্জ ৳৮০)</p>
                <p>• ঢাকার বাইরে: ২-৩ দিন (ডেলিভারি চার্জ ৳১৫০)</p>
                <p>• ক্যাশ অন ডেলিভারি (COD) সুবিধা রয়েছে</p>
              </div>

              <div className="flex items-center gap-2.5 text-foreground font-bold border-t border-border/40 pt-2">
                <ShieldCheck className="w-4 h-4 text-success shrink-0" />
                <span>ওয়ারেন্টি ও রিটার্ন নীতি:</span>
              </div>
              <div className="space-y-1.5 text-muted-foreground font-semibold leading-relaxed">
                <p>• ৭ দিনের ইনস্ট্যান্ট পার্টস/পণ্য রিপ্লেসমেন্ট গ্যারান্টি</p>
                <p>• ডেলিভারিম্যানের সামনে পণ্য চেক করার সুযোগ</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Title, Selling Tools & Tabs (7 Cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Header Info Box */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-black uppercase tracking-wider text-primary bg-primary/10 border border-primary/20 px-2.5 py-0.5 rounded-full">
                {product.category}
              </span>
              <span className="text-xs font-bold text-muted-foreground uppercase">{product.brand}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-foreground leading-tight">
              {product.name}
            </h1>
            <p className="text-xs font-mono text-muted-foreground">SKU: {product.sku}</p>
          </div>

          {/* Product Action Tabs */}
          <Tabs defaultValue="calculator" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-muted/60 p-1 rounded-xl">
              <TabsTrigger value="calculator" className="text-xs font-black">
                প্রফিট ক্যালকুলেটর
              </TabsTrigger>
              <TabsTrigger value="marketing" className="text-xs font-black">
                মার্কেটিং কিট (Promo)
              </TabsTrigger>
              <TabsTrigger value="specs" className="text-xs font-black">
                বিবরণ ও স্পেকস
              </TabsTrigger>
            </TabsList>

            {/* Tab 1: Live Profit Calculator */}
            <TabsContent value="calculator" className="pt-4 space-y-4">
              <ResellerProfitCalculator
                mrp={product.mrp}
                wholesaleCost={product.wholesaleCost}
                minPrice={product.minPrice}
                suggestedPrice={product.suggestedPrice}
                onPriceChange={handlePriceChange}
              />
            </TabsContent>

            {/* Tab 2: Marketing Kit */}
            <TabsContent value="marketing" className="pt-4">
              <ResellerProductMarketingKitTab
                product={{
                  id: product.id,
                  name: product.name,
                  sku: product.sku,
                  description: product.description,
                  imageUrl: product.images[0],
                  mrp: product.mrp,
                  sellingPrice: customPriceCents,
                  brand: product.brand,
                }}
              />
            </TabsContent>

            {/* Tab 3: Description & Specs */}
            <TabsContent value="specs" className="pt-4">
              <Card className="border-border/80 shadow-2xs">
                <CardContent className="p-5 space-y-4 text-xs font-semibold text-foreground leading-relaxed">
                  <h4 className="text-sm font-black text-foreground">পণ্য বিবরণী:</h4>
                  <p>{product.description}</p>

                  <div className="pt-2 border-t border-border/60 space-y-2">
                    <h4 className="text-xs font-black text-foreground">প্রোডাক্ট হাইলাইটস:</h4>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      <li>হাই-কোয়ালিটি প্রিমিয়াম ম্যাটেরিয়াল মেক</li>
                      <li>দীর্ঘস্থায়ী পারফরম্যান্স ও স্থায়িত্ব</li>
                      <li>রেগুলার ব্যবহার ও ড্রপশিপিং বিক্রয়ের জন্য উপযুক্ত</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Quick Action Button Box */}
          <div className="p-4 rounded-2xl bg-card border border-border shadow-md space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-muted-foreground">নির্ধারিত বিক্রয় মূল্য:</span>
                <p className="text-xl font-black text-primary tabular-nums">
                  ৳{(customPriceCents / 100).toFixed(0)}
                </p>
              </div>
              <div className="text-right">
                <span className="text-[11px] font-bold text-muted-foreground">আপনার নিট প্রফিট:</span>
                <p className="text-lg font-black text-success tabular-nums">
                  +৳{(customProfitCents / 100).toFixed(0)}
                </p>
              </div>
            </div>

            <Button
              onClick={handleQuickOrderClick}
              disabled={!isPriceValid}
              className="w-full h-12 text-sm font-black gap-2 shadow-md disabled:opacity-50"
            >
              <Plus className="w-5 h-5 stroke-[3]" />
              {!isPriceValid ? "নূন্যতম বিক্রয় মূল্যে ফেরত যান" : "অর্ডার ক্রিয়েট প্রসেস শুরু করুন (Quick Order)"}
            </Button>
          </div>
        </div>
      </div>

      {/* Related Products Grid */}
      {relatedProducts.length > 0 && (
        <section className="space-y-4 pt-6 border-t border-border">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-primary">Recommendation</span>
              <h3 className="text-lg font-black text-foreground">সম্পর্কিত অন্যান্য রিসেলার প্রোডাক্ট</h3>
            </div>
            <Link href="/reseller/products" className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
              ক্যাটালগে দেখুন <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {relatedProducts.map((rel) => (
              <ResellerProductCard key={rel.id} product={rel} viewMode="grid" />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
