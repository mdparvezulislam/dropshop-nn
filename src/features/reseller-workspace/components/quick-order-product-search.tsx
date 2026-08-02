"use client";

import * as React from "react";
import { Search, Package, Plus, Minus, Loader2, ShieldAlert, Trash2, ShoppingBag } from "lucide-react";
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
  selectedProducts: SelectedOrderProduct[];
  onAddProduct: (product: SelectedOrderProduct) => void;
  onUpdateProduct: (index: number, updated: SelectedOrderProduct) => void;
  onRemoveProduct: (index: number) => void;
}

export function QuickOrderProductSearch({
  selectedProducts,
  onAddProduct,
  onUpdateProduct,
  onRemoveProduct,
}: QuickOrderProductSearchProps): React.ReactElement {
  const [query, setQuery] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [results, setResults] = React.useState<any[]>([]);
  const [isOpen, setIsOpen] = React.useState(false);

  // Search Products
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
          limit: 10,
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
    const productId = p.id || p._id;
    const existingIndex = selectedProducts.findIndex((sp) => sp.id === productId);

    if (existingIndex >= 0) {
      const existing = selectedProducts[existingIndex];
      const newQty = Math.min(existing.quantity + 1, existing.availableStock);
      onUpdateProduct(existingIndex, { ...existing, quantity: newQty });
      toast.info(`"${existing.name}" কার্টে ২য় বার যোগ করা হয়েছে (${newQty} টি)`);
    } else {
      const wholesaleCost = p.pricing?.costBasis ?? p.pricing?.resellerPrice ?? 90000;
      const minPrice = p.pricing?.minPrice ?? wholesaleCost;
      const suggestedPrice = p.pricing?.sellingPrice ?? Math.round(wholesaleCost * 1.1667);

      const item: SelectedOrderProduct = {
        id: productId,
        name: p.customTitle ?? p.product?.name ?? p.productName ?? "Reseller Product",
        sku: p.variantSku ?? p.product?.sku ?? p.sku ?? "RSL-9988",
        imageUrl: p.product?.primaryImage?.url || p.imageUrl || p.product?.images?.[0]?.url,
        wholesaleCost,
        minPrice,
        suggestedPrice,
        customSellingPrice: Math.max(minPrice, suggestedPrice),
        quantity: 1,
        availableStock: p.availableStock ?? 15,
      };

      onAddProduct(item);
      toast.success(`"${item.name}" অর্ডারে যোগ করা হয়েছে!`);
    }

    setQuery("");
    setIsOpen(false);
  };

  const handleQuantityChange = (index: number, delta: number) => {
    const target = selectedProducts[index];
    if (!target) return;
    const newQty = Math.max(1, target.quantity + delta);
    if (newQty > target.availableStock) {
      toast.error(`স্টক সীমাবদ্ধতা: সর্বোচ্চ ${target.availableStock} টি এভেলেবল`);
      return;
    }
    onUpdateProduct(index, { ...target, quantity: newQty });
  };

  const handlePriceChange = (index: number, val: string) => {
    const target = selectedProducts[index];
    if (!target) return;
    const taka = parseFloat(val) || 0;
    const cents = Math.round(taka * 100);
    onUpdateProduct(index, { ...target, customSellingPrice: cents });
  };

  return (
    <Card className="border-border/80 shadow-xs bg-card">
      <CardContent className="p-2.5 sm:p-5 space-y-2.5 sm:space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-[11px] sm:text-xs font-black text-foreground uppercase tracking-wider flex items-center gap-1.5">
            <Package className="w-3.5 h-3.5 text-primary" /> ১. পণ্য খুঁজুন ও যোগ করুন (মাল্টি-প্রোডাক্ট)
          </label>
          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30">
            {selectedProducts.length} টি আইটেম
          </span>
        </div>

        {/* Autocomplete Search Input */}
        <div className="relative z-50">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={query}
              onFocus={() => setIsOpen(true)}
              onChange={(e) => {
                setQuery(e.target.value);
                setIsOpen(true);
              }}
              placeholder="পণ্য বা SKU টাইপ করুন (যেমন: Smart Watch / RSL-102)..."
              className="w-full h-10 sm:h-12 pl-9 pr-9 rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-colors"
            />
            {loading && (
              <Loader2 className="w-4 h-4 text-amber-500 animate-spin absolute right-3 top-1/2 -translate-y-1/2" />
            )}
          </div>

          {/* Dropdown Results Overlay */}
          {isOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
              <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl shadow-2xl max-h-64 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 text-slate-900 dark:text-slate-100">
                {results.length === 0 ? (
                  <div className="p-3 text-center text-xs font-semibold text-slate-500 dark:text-slate-400">
                    কোনো প্রোডাক্ট পাওয়া যায়নি
                  </div>
                ) : (
                  results.map((p) => {
                    const costBdt = Math.round((p.pricing?.costBasis ?? p.pricing?.resellerPrice ?? 150000) / 100);
                    const mrpBdt = Math.round((p.pricing?.sellingPrice ?? Math.round(costBdt * 1.25 * 100)) / 100);
                    return (
                      <button
                        key={p.id || p._id}
                        onClick={() => handlePickProduct(p)}
                        className="w-full flex items-center justify-between p-2.5 text-left hover:bg-amber-50/60 dark:hover:bg-amber-950/40 transition-colors group"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden shrink-0">
                            {p.product?.primaryImage?.url || p.imageUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={p.product?.primaryImage?.url || p.imageUrl}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Package className="w-4 h-4 text-slate-400 m-auto mt-2.5" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-black text-slate-900 dark:text-slate-100 truncate group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                              {p.customTitle ?? p.product?.name ?? "Product"}
                            </p>
                            <p className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                              SKU: {p.variantSku ?? p.product?.sku ?? "—"} • Stock: {p.availableStock ?? 10}
                            </p>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-xs font-black text-amber-600 dark:text-amber-400">
                            ৳{mrpBdt} <span className="text-[9px] text-slate-400 font-normal">MRP</span>
                          </p>
                          <p className="text-[9px] font-bold text-slate-700 dark:text-slate-300 bg-amber-100 dark:bg-amber-900/50 px-1 py-0.5 rounded border border-amber-200 dark:border-amber-800">
                            Resell: ৳{costBdt}
                          </p>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </>
          )}
        </div>

        {/* Selected Products List */}
        {selectedProducts.length === 0 ? (
          <div className="p-6 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/60 dark:bg-slate-900/60 text-slate-500 space-y-1">
            <ShoppingBag className="w-6 h-6 text-slate-400 mx-auto" />
            <p className="text-xs font-extrabold text-slate-700 dark:text-slate-300">এখনো কোনো প্রোডাক্ট যোগ করা হয়নি</p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">উপরের সার্চ বক্স থেকে এক বা একাধিক প্রোডাক্ট যোগ করুন।</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {selectedProducts.map((item, index) => {
              const currentPriceTaka = Math.round(item.customSellingPrice / 100);
              const costTaka = Math.round(item.wholesaleCost / 100);
              const minPriceTaka = Math.round(item.minPrice / 100);
              const isPriceValid = item.customSellingPrice >= item.minPrice;
              const lineProfitTaka = (currentPriceTaka - costTaka) * item.quantity;

              return (
                <div
                  key={`${item.id}-${index}`}
                  className="p-3 rounded-xl border border-amber-200 dark:border-amber-500/30 bg-amber-50/30 dark:bg-amber-950/20 space-y-2.5 relative shadow-2xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden shrink-0 shadow-2xs">
                        {item.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={item.imageUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <Package className="w-4 h-4 text-slate-400 m-auto mt-2.5" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                            In Stock ({item.availableStock} টি)
                          </span>
                        </div>
                        <h4 className="text-xs font-black text-slate-900 dark:text-slate-100 truncate mt-0.5">
                          {item.name}
                        </h4>
                        <p className="text-[10px] font-mono text-slate-600 dark:text-slate-400">
                          SKU: {item.sku} • Resell Price: ৳{costTaka}/টি
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => onRemoveProduct(index)}
                      className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded transition-colors shrink-0"
                      title="রিমুভ করুন"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-amber-200/60 dark:border-amber-500/20">
                    {/* Quantity counter */}
                    <div className="space-y-0.5">
                      <label className="text-[10px] font-extrabold text-slate-800 dark:text-slate-200">পরিমাণ:</label>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleQuantityChange(index, -1)}
                          className="w-8 h-8 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-black flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-700 shadow-2xs"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <input
                          type="number"
                          min={1}
                          max={item.availableStock}
                          value={item.quantity}
                          onChange={(e) => {
                            const q = parseInt(e.target.value) || 1;
                            onUpdateProduct(index, { ...item, quantity: Math.min(q, item.availableStock) });
                          }}
                          className="w-11 h-8 text-center rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-black text-slate-900 dark:text-slate-100 outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => handleQuantityChange(index, 1)}
                          className="w-8 h-8 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-black flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-700 shadow-2xs"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {/* Custom Selling Price */}
                    <div className="space-y-0.5">
                      <label className="text-[10px] font-extrabold text-slate-800 dark:text-slate-200 flex items-center justify-between">
                        <span>বিক্রয় মূল্য ৳:</span>
                        <span className="text-[9px] text-emerald-700 dark:text-emerald-400 font-bold">প্রফিট: +৳{lineProfitTaka}</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 font-black text-xs text-slate-700 dark:text-slate-300">
                          ৳
                        </span>
                        <input
                          type="number"
                          min={minPriceTaka}
                          value={currentPriceTaka}
                          onChange={(e) => handlePriceChange(index, e.target.value)}
                          className={cn(
                            "w-full h-8 pl-5 pr-2 rounded-lg border bg-white dark:bg-slate-800 text-xs font-black text-slate-900 dark:text-slate-100 outline-none shadow-2xs",
                            !isPriceValid ? "border-rose-500 ring-1 ring-rose-500 text-rose-600 dark:text-rose-400" : "border-slate-300 dark:border-slate-700 focus:border-amber-500",
                          )}
                        />
                      </div>
                    </div>
                  </div>

                  {!isPriceValid && (
                    <div className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-[10px] font-extrabold flex items-center gap-1">
                      <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                      <span>নূন্যতম বিক্রয় মূল্য ৳{minPriceTaka}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
