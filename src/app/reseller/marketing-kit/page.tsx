"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Download,
  Copy,
  Share2,
  Image as ImageIcon,
  QrCode,
  FileText,
  Sparkles,
  Search,
  Check,
  Package,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ResellerStatusGuard } from "@/features/reseller-workspace/components/reseller-status-guard";
import { ResellerProductMarketingKitTab } from "@/features/reseller-workspace/components/reseller-product-marketing-kit-tab";
import { toast } from "sonner";
import { cn } from "@/lib/utils/cn";

export default function ResellerMarketingKitPage(): React.ReactElement {
  const searchParams = useSearchParams();
  const initialProductId = searchParams.get("productId") || "";

  const [loading, setLoading] = React.useState(true);
  const [products, setProducts] = React.useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = React.useState<any | null>(null);
  const [search, setSearch] = React.useState("");
  const [resellerStatus, setResellerStatus] = React.useState("active");

  React.useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const { searchResellerProductsAction } = await import(
          "@/features/reseller/actions/reseller-actions"
        );
        const res = await searchResellerProductsAction({ resellerId: "me", limit: 20 });
        if (res.success && res.data) {
          const items = (res.data as any).items || [];
          setProducts(items);

          if (initialProductId) {
            const found = items.find((p: any) => (p.id || p._id) === initialProductId);
            if (found) setSelectedProduct(found);
            else if (items.length > 0) setSelectedProduct(items[0]);
          } else if (items.length > 0) {
            setSelectedProduct(items[0]);
          }
        }
      } catch {
        toast.error("Failed to load marketing kit catalog");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [initialProductId]);

  const filteredProducts = products.filter((p) => {
    if (!search.trim()) return true;
    const name = p.customTitle ?? p.product?.name ?? "";
    const sku = p.variantSku ?? p.product?.sku ?? "";
    return name.toLowerCase().includes(search.toLowerCase()) || sku.toLowerCase().includes(search.toLowerCase());
  });

  const activeProductData = selectedProduct
    ? {
        id: selectedProduct.id || selectedProduct._id,
        name: selectedProduct.customTitle ?? selectedProduct.product?.name ?? "Premium Product",
        sku: selectedProduct.variantSku ?? selectedProduct.product?.sku ?? "RSL-99",
        description: selectedProduct.product?.description || "প্রিমিয়াম কোয়ালিটি গ্যাজেট ও রিসেলার ক্যাটালগ আইটেম।",
        imageUrl: selectedProduct.product?.primaryImage?.url || selectedProduct.imageUrl,
        mrp: selectedProduct.pricing?.recommendedPrice ?? 250000,
        sellingPrice: selectedProduct.pricing?.sellingPrice ?? 180000,
        brand: selectedProduct.product?.brand?.name || "Dropshop",
      }
    : null;

  return (
    <ResellerStatusGuard status={resellerStatus}>
      <div className="space-y-6 animate-fade-in pb-20 lg:pb-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-primary bg-primary/10 border border-primary/20 px-2.5 py-0.5 rounded-full">
              Promotional Assets Hub
            </span>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground mt-1">
              Marketing Center
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground font-semibold">
              সোশ্যাল মিডিয়া ব্যানার, ক্যাপশন ও এইচডি প্রোডাক্ট ইমেজ ডাউনলোড করুন।
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Product Selector Sidebar (4 Cols) */}
          <div className="lg:col-span-4 space-y-4">
            <Card className="border-border/80 shadow-xs">
              <CardContent className="p-4 space-y-3">
                <h3 className="text-xs font-black text-foreground uppercase tracking-wider">
                  পণ্য নির্বাচন করুন (Catalog Items)
                </h3>

                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="পণ্য বা SKU খুঁজুন..."
                    className="w-full h-9 pl-8 pr-3 rounded-lg border border-border bg-muted/40 text-xs font-semibold text-foreground outline-none focus:border-primary"
                  />
                </div>

                {loading ? (
                  <div className="p-8 text-center text-xs text-muted-foreground">Loading...</div>
                ) : (
                  <div className="space-y-1.5 max-h-[500px] overflow-y-auto pr-1">
                    {filteredProducts.map((p) => {
                      const isSelected = selectedProduct && (selectedProduct.id || selectedProduct._id) === (p.id || p._id);
                      return (
                        <button
                          key={p.id || p._id}
                          onClick={() => setSelectedProduct(p)}
                          className={cn(
                            "w-full p-2.5 rounded-xl border text-left flex items-center gap-2.5 transition-all",
                            isSelected
                              ? "bg-primary/10 border-primary/40 text-foreground font-bold"
                              : "bg-card border-border/60 text-muted-foreground hover:bg-muted hover:text-foreground",
                          )}
                        >
                          <div className="w-10 h-10 rounded-lg bg-muted overflow-hidden shrink-0 border border-border/60">
                            {p.product?.primaryImage?.url || p.imageUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={p.product?.primaryImage?.url || p.imageUrl} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <Package className="w-5 h-5 text-muted-foreground m-auto" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold truncate">
                              {p.customTitle ?? p.product?.name ?? "Product"}
                            </p>
                            <p className="text-[10px] font-mono text-muted-foreground">
                              SKU: {p.variantSku ?? p.product?.sku ?? "—"}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Asset Kit Content (8 Cols) */}
          <div className="lg:col-span-8">
            {activeProductData ? (
              <ResellerProductMarketingKitTab product={activeProductData} />
            ) : (
              <div className="p-12 text-center text-xs font-semibold text-muted-foreground">
                মার্কেটিং কিট দেখতে বামের তালিকা থেকে পণ্য নির্বাচন করুন।
              </div>
            )}
          </div>
        </div>
      </div>
    </ResellerStatusGuard>
  );
}
