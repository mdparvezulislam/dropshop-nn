"use client";

import * as React from "react";
import { Search, Package, Plus, Minus, X, Loader2, Check, AlertTriangle, ShieldAlert } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils/cn";
import { toast } from "sonner";

export interface SelectedOrderProduct {
  id: string;
  name: string;
  sku: string;
  imageUrl?: string;
  wholesaleCost: number; // cents
  minPrice: number; // cents
  suggestedPrice: number; // cents
  customSellingPrice: number; // cents
  quantity: number;
  availableStock: number;
}

export interface QuickOrderProductSearchProps {
  selectedProduct: SelectedOrderProduct | null;
  onSelectProduct: (product: SelectedOrderProduct | null) => void;
  onUpdateProduct: (product: SelectedOrderProduct) => void;
}

export function QuickOrderProductSearch({
  selectedProduct,
  onSelectProduct,
  onUpdateProduct,
}: QuickOrderProductSearchProps): React.ReactElement {
  const [query, setQuery] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [results, setResults] = React.useState<any[]>([]);
  const [isOpen, setIsOpen] = React.useState(false);

  // Load products on mount & on search query
  React.useEffect(() => {
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const { searchResellerProductsAction } = await import(
          "@/features/reseller/actions/reseller-actions"
        );
        const res = await searchResellerProductsAction({
          resellerId: "me",
          search: query.trim() || undefined,
          limit: 8,
        });

        if (res.success && res.data) {
          const items = (res.data as any).items || [];
          setResults(items);
        }
      } catch {
        // silent search fallback
      } finally {
        setLoading(false);
      }
    }, query.trim() ? 200 : 0);

    return () => clearTimeout(timer);
  }, [query]);

  const handlePickProduct = (p: any) => {
    const wholesaleCost = p.pricing?.costBasis ?? 150000;
    const minPrice = p.pricing?.minPrice ?? Math.round(wholesaleCost * 1.05);
    const suggestedPrice = p.pricing?.sellingPrice ?? Math.round(wholesaleCost * 1.25);

    const item: SelectedOrderProduct = {
      id: p.id || p._id,
      name: p.customTitle ?? p.product?.name ?? p.productName ?? "Reseller Product",
      sku: p.variantSku ?? p.product?.sku ?? p.sku ?? "RSL-9988",
      imageUrl: p.product?.primaryImage?.url || p.imageUrl || p.product?.images?.[0]?.url,
      wholesaleCost,
      minPrice,
      suggestedPrice,
      customSellingPrice: suggestedPrice,
      quantity: 1,
      availableStock: p.availableStock ?? 15,
    };

    onSelectProduct(item);
    setQuery("");
    setIsOpen(false);
  };

  const handleQuantityChange = (delta: number) => {
    if (!selectedProduct) return;
    const newQty = Math.max(1, selectedProduct.quantity + delta);
    if (newQty > selectedProduct.availableStock) {
      toast.error(`স্টক সীমাবদ্ধতা: সর্বোচ্চ ${selectedProduct.availableStock} টি এভেলেবল`);
      return;
    }
    onUpdateProduct({ ...selectedProduct, quantity: newQty });
  };

  const handlePriceInputChange = (val: string) => {
    if (!selectedProduct) return;
    const taka = parseFloat(val) || 0;
    const cents = Math.round(taka * 100);
    onUpdateProduct({ ...selectedProduct, customSellingPrice: cents });
  };

  const currentPriceTaka = selectedProduct ? Math.round(selectedProduct.customSellingPrice / 100) : 0;
  const minPriceTaka = selectedProduct ? Math.round(selectedProduct.minPrice / 100) : 0;
  const costTaka = selectedProduct ? Math.round(selectedProduct.wholesaleCost / 100) : 0;
  const isPriceValid = selectedProduct ? selectedProduct.customSellingPrice >= selectedProduct.minPrice : true;

  return (
    <Card className="border-border/80 shadow-xs">
      <CardContent className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-xs font-black text-foreground uppercase tracking-wider flex items-center gap-1.5">
            <Package className="w-4 h-4 text-primary" /> ১. পণ্য নির্বাচন ও প্রাইসিং (Step 1 &amp; 2)
          </label>
          {selectedProduct && (
            <button
              onClick={() => onSelectProduct(null)}
              className="text-xs font-bold text-destructive hover:underline inline-flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" /> পণ্য পরিবর্তন করুন
            </button>
          )}
        </div>

        {/* Product Autocomplete Input */}
        {!selectedProduct && (
          <div className="relative">
            <div className="relative">
              <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={query}
                onFocus={() => setIsOpen(true)}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setIsOpen(true);
                }}
                placeholder="পণ্য বা SKU ক্লিক বা টাইপ করুন (যেমন: Smart Watch / RSL-102)..."
                className="w-full h-12 pl-10 pr-10 rounded-xl border border-border bg-muted/40 text-xs sm:text-sm font-semibold text-foreground outline-none focus:border-primary"
                autoFocus
              />
              {loading && (
                <Loader2 className="w-4 h-4 text-primary animate-spin absolute right-3.5 top-1/2 -translate-y-1/2" />
              )}
            </div>

            {/* Dropdown Results */}
            {isOpen && (
              <div className="absolute top-full left-0 right-0 z-30 mt-1 bg-card border border-border rounded-xl shadow-xl max-h-60 overflow-y-auto divide-y divide-border/60">
                {results.length === 0 ? (
                  <div className="p-4 text-center text-xs font-semibold text-muted-foreground">
                    কোনো প্রোডাক্ট পাওয়া যায়নি
                  </div>
                ) : (
                  results.map((p) => (
                    <button
                      key={p.id || p._id}
                      onClick={() => handlePickProduct(p)}
                      className="w-full flex items-center justify-between p-3 text-left hover:bg-muted/60 transition-colors group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-lg bg-muted overflow-hidden shrink-0 border border-border/60">
                          {p.product?.primaryImage?.url || p.imageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={p.product?.primaryImage?.url || p.imageUrl}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Package className="w-5 h-5 text-muted-foreground m-auto" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-foreground truncate group-hover:text-primary transition-colors">
                            {p.customTitle ?? p.product?.name ?? "Product"}
                          </p>
                          <p className="text-[10px] font-mono text-muted-foreground">
                            SKU: {p.variantSku ?? p.product?.sku ?? "—"} • Stock: {p.availableStock ?? 10}
                          </p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs font-black text-primary">
                          ৳{((p.pricing?.sellingPrice ?? 180000) / 100).toFixed(0)}
                        </p>
                        <p className="text-[10px] text-muted-foreground font-bold">
                          Cost: ৳{((p.pricing?.costBasis ?? 150000) / 100).toFixed(0)}
                        </p>
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {/* Selected Product Controls */}
        {selectedProduct && (
          <div className="p-4 rounded-xl border border-primary/30 bg-primary/5 space-y-4 animate-fade-in">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-14 h-14 rounded-xl bg-card overflow-hidden shrink-0 border border-border/80">
                  {selectedProduct.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={selectedProduct.imageUrl}
                      alt={selectedProduct.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Package className="w-6 h-6 text-muted-foreground m-auto" />
                  )}
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-success/15 text-success border border-success/30">
                    In Stock ({selectedProduct.availableStock})
                  </span>
                  <h4 className="text-xs sm:text-sm font-black text-foreground truncate mt-1">
                    {selectedProduct.name}
                  </h4>
                  <p className="text-[11px] font-mono text-muted-foreground">
                    SKU: {selectedProduct.sku}
                  </p>
                </div>
              </div>
            </div>

            {/* Quantity & Selling Price Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-primary/20">
              {/* Quantity Counter */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">পরিমাণ (Quantity):</label>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleQuantityChange(-1)}
                    className="w-10 h-10 rounded-xl bg-card border border-border text-foreground font-black flex items-center justify-center hover:bg-muted active:scale-95"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <input
                    type="number"
                    min={1}
                    max={selectedProduct.availableStock}
                    value={selectedProduct.quantity}
                    onChange={(e) => {
                      const q = parseInt(e.target.value) || 1;
                      onUpdateProduct({ ...selectedProduct, quantity: q });
                    }}
                    className="w-16 h-10 text-center rounded-xl border border-border bg-card text-sm font-black text-foreground outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleQuantityChange(1)}
                    className="w-10 h-10 rounded-xl bg-card border border-border text-foreground font-black flex items-center justify-center hover:bg-muted active:scale-95"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Selling Price Input */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground flex items-center justify-between">
                  <span>বিক্রয় মূল্য ৳ (প্রতি টি):</span>
                  <span className="text-[10px] text-muted-foreground">নূন্যতম ৳{minPriceTaka}</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-black text-xs text-foreground">
                    ৳
                  </span>
                  <input
                    type="number"
                    min={minPriceTaka}
                    value={currentPriceTaka}
                    onChange={(e) => handlePriceInputChange(e.target.value)}
                    className={cn(
                      "w-full h-10 pl-7 pr-3 rounded-xl border bg-card text-xs sm:text-sm font-black text-foreground outline-none",
                      !isPriceValid ? "border-destructive text-destructive" : "border-border focus:border-primary",
                    )}
                  />
                </div>
              </div>
            </div>

            {/* Price Validation Alert */}
            {!isPriceValid && (
              <div className="p-2.5 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-xs font-black flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>নূন্যতম বিক্রয় মূল্য (রিসেলার মূল্যের চেয়ে কম দামে বিক্রি করা সম্ভব নয়)</span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
