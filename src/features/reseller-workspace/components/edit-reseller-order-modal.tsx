"use client";

import * as React from "react";
import {
  X,
  Plus,
  Trash2,
  AlertCircle,
  Save,
  Package,
  User,
  MapPin,
  TrendingUp,
  Lock,
  Search,
  Loader2,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { BD_DISTRICTS } from "@/config/bd-districts";
import { toast } from "sonner";
import type { ResellerOrderDTO } from "@/features/reseller/actions/reseller-order-actions";
import { cn } from "@/lib/utils/cn";

interface EditResellerOrderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: any;
  onSuccess: () => void;
}

export function EditResellerOrderModal({
  open,
  onOpenChange,
  order,
  onSuccess,
}: EditResellerOrderModalProps): React.ReactElement | null {
  const [submitting, setSubmitting] = React.useState(false);

  // Customer & Shipping Form State
  const [customerName, setCustomerName] = React.useState("");
  const [customerPhone, setCustomerPhone] = React.useState("");
  const [district, setDistrict] = React.useState("");
  const [upazila, setUpazila] = React.useState("");
  const [fullAddress, setFullAddress] = React.useState("");
  const [deliveryChargeTaka, setDeliveryChargeTaka] = React.useState(60);
  const [advancePaidTaka, setAdvancePaidTaka] = React.useState(0);
  const [notes, setNotes] = React.useState("");

  // Product Search State
  const [showProductSearch, setShowProductSearch] = React.useState(false);
  const [productQuery, setProductQuery] = React.useState("");
  const [searchingProducts, setSearchingProducts] = React.useState(false);
  const [searchResults, setSearchResults] = React.useState<any[]>([]);

  // Order Items List
  const [items, setItems] = React.useState<
    Array<{
      productId: string;
      productName: string;
      variantSku?: string;
      quantity: number;
      unitSellingPriceTaka: number;
      unitCostBasisTaka: number;
    }>
  >([]);

  React.useEffect(() => {
    if (order) {
      const o: any = order;
      setCustomerName(o.customerName || o.customer?.name || o.shipping?.name || "");
      setCustomerPhone(o.customerPhone || o.customer?.phone || o.shipping?.phone || "");

      const currentDistrict = o.district || o.shipping?.city || o.shipping?.district || "Dhaka";
      setDistrict(currentDistrict);
      setUpazila(o.upazila || o.shipping?.area || o.shipping?.upazila || "");
      setFullAddress(o.fullAddress || o.shipping?.streetAddress || o.shipping?.address || "");

      const isDhakaOrder = currentDistrict.toLowerCase().includes("dhaka");
      const rawDeliv =
        o.deliveryChargeCents ??
        (o.pricing?.grandTotal && o.pricing?.subtotal && o.pricing.grandTotal > o.pricing.subtotal
          ? o.pricing.grandTotal - o.pricing.subtotal
          : undefined) ??
        o.shipping?.deliveryFee ??
        o.shipping?.deliveryCharge ??
        o.shippingCost ??
        (isDhakaOrder ? 6000 : 12000);

      const delivTaka = rawDeliv > 1000 ? Math.round(rawDeliv / 100) : rawDeliv;
      setDeliveryChargeTaka(delivTaka);

      const rawAdv =
        o.advancePaidCents ??
        o.pricing?.advancePaid ??
        o.advancePaid ??
        o.metadata?.advancePaid ??
        0;
      const advTaka = rawAdv > 1000 ? Math.round(rawAdv / 100) : rawAdv;
      setAdvancePaidTaka(advTaka);

      const rawNote = o.notes || o.shipping?.deliveryNote || "";
      const userNoteMatch = rawNote.match(/userNote:(.*)$/i);
      const cleanNote = userNoteMatch ? userNoteMatch[1].trim() : (rawNote.includes("payment:") ? "" : rawNote);
      setNotes(cleanNote);

      const mappedItems = (o.items || []).map((i: any) => {
        const rawPrice = i.unitSellingPrice ?? i.unitPrice ?? i.price ?? i.sellingPriceCents ?? 0;
        const priceTaka = rawPrice > 1000 ? Math.round(rawPrice / 100) : rawPrice;

        const rawCost = i.unitCostBasis ?? i.costBasis ?? i.costBasisCents ?? i.wholesalePrice ?? 0;
        const costTaka = rawCost > 1000 ? Math.round(rawCost / 100) : rawCost;

        return {
          productId: i.productId || i.id || "prod-1",
          productName: i.productName || i.name || "Reseller Product",
          variantSku: i.variantSku || i.sku,
          quantity: i.quantity || i.qty || 1,
          unitSellingPriceTaka: priceTaka,
          unitCostBasisTaka: costTaka,
        };
      });

      if (mappedItems.length > 0) {
        setItems(mappedItems);
      } else {
        const rawSinglePrice = o.sellingPriceCents ?? o.pricing?.subtotal ?? 0;
        const singlePriceTaka = rawSinglePrice > 1000 ? Math.round(rawSinglePrice / 100) : rawSinglePrice;

        const rawSingleCost = o.costBasisCents ?? 0;
        const singleCostTaka = rawSingleCost > 1000 ? Math.round(rawSingleCost / 100) : rawSingleCost;

        setItems([
          {
            productId: "prod-1",
            productName: o.productName || "Product Item",
            quantity: o.quantity || 1,
            unitSellingPriceTaka: singlePriceTaka,
            unitCostBasisTaka: singleCostTaka,
          },
        ]);
      }
    }
  }, [order]);

  // Product Search Handler
  const handleProductSearch = React.useCallback(async (queryStr: string) => {
    setProductQuery(queryStr);
    setSearchingProducts(true);
    try {
      const { searchProductsForOrderEditAction } = await import(
        "@/features/reseller/actions/reseller-order-actions"
      );
      const res = await searchProductsForOrderEditAction(queryStr);
      if (res.success && res.data) {
        setSearchResults(res.data);
      } else {
        setSearchResults([]);
      }
    } catch {
      setSearchResults([]);
    } finally {
      setSearchingProducts(false);
    }
  }, []);

  React.useEffect(() => {
    if (showProductSearch) {
      handleProductSearch("");
    }
  }, [showProductSearch, handleProductSearch]);

  if (!open || !order) return null;

  const isBlocked =
    Boolean(order.trackingNumber) ||
    ["pickup_requested", "shipment", "shipped", "in_transit", "delivered", "completed", "cancelled"].includes(
      order.status,
    );
  const isEditable = !isBlocked;

  // Live Pricing Calculations
  const isDhakaOrder = (district || "Dhaka").toLowerCase().includes("dhaka");
  const standardCourierCostTaka = isDhakaOrder ? 60 : 120;

  const subtotalTaka = items.reduce(
    (sum, item) => sum + item.unitSellingPriceTaka * item.quantity,
    0,
  );
  const costBasisTaka = items.reduce(
    (sum, item) => sum + item.unitCostBasisTaka * item.quantity,
    0,
  );
  const grandTotalTaka = subtotalTaka + deliveryChargeTaka;
  const profitTaka = (subtotalTaka - costBasisTaka) + (deliveryChargeTaka - standardCourierCostTaka);

  const handleItemChange = (
    index: number,
    field: "productName" | "quantity" | "unitSellingPriceTaka" | "unitCostBasisTaka",
    val: any,
  ) => {
    setItems((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: val };
      return copy;
    });
  };

  const handleSelectSearchedProduct = (p: any) => {
    const costTaka = p.costBasisTaka ?? 1000;
    const sellTaka = p.sellingPriceTaka ?? 1500;

    setItems((prev) => [
      ...prev,
      {
        productId: p.id || `prod-${Date.now()}`,
        productName: p.title || "Selected Product",
        quantity: 1,
        unitCostBasisTaka: costTaka,
        unitSellingPriceTaka: sellTaka,
      },
    ]);

    setShowProductSearch(false);
    setProductQuery("");
    setSearchResults([]);
    toast.success(`প্রোডাক্ট যোগ করা হয়েছে: ${p.title}`);
  };

  const handleAddBlankItem = () => {
    setItems((prev) => [
      ...prev,
      {
        productId: `prod-${Date.now()}`,
        productName: "নতুন প্রোডাক্ট",
        quantity: 1,
        unitCostBasisTaka: 1000,
        unitSellingPriceTaka: 1500,
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) {
      toast.error("কমপক্ষে একটি প্রোডাক্ট থাকা আবশ্যক।");
      return;
    }
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEditable) {
      toast.error("অনুমোদিত বা প্রক্রিয়াধীন অর্ডার এডিট করা সম্ভব নয়।");
      return;
    }

    if (!customerName.trim() || !customerPhone.trim() || !fullAddress.trim()) {
      toast.error("কাস্টমারের নাম, ফোন নম্বর ও ঠিকানা পূরণ করুন।");
      return;
    }

    setSubmitting(true);
    try {
      const { updateResellerOrderAction } = await import(
        "@/features/reseller/actions/reseller-order-actions"
      );

      const res = await updateResellerOrderAction({
        orderId: order.id,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        district: district.trim(),
        upazila: upazila.trim(),
        fullAddress: fullAddress.trim(),
        deliveryChargeCents: Math.round(deliveryChargeTaka * 100),
        advancePaidCents: Math.round(advancePaidTaka * 100),
        notes: notes.trim(),
        items: items.map((i) => ({
          productId: i.productId,
          productName: i.productName,
          variantSku: i.variantSku,
          quantity: i.quantity,
          unitSellingPrice: Math.round(i.unitSellingPriceTaka * 100),
          unitCostBasis: Math.round(i.unitCostBasisTaka * 100),
        })),
      });

      if (res.success) {
        toast.success("অর্ডারটি সফলভাবে আপডেট করা হয়েছে!");
        onOpenChange(false);
        onSuccess();
      } else {
        toast.error(res.error || "অর্ডার আপডেট করতে ব্যর্থ হয়েছে।");
      }
    } catch {
      toast.error("একটি সমস্যা হয়েছে। পুনরায় চেষ্টা করুন।");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-xs animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-900 px-2 py-0.5 rounded-full">
              ORDER MODIFICATION CENTER
            </span>
            <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100 mt-0.5">
              অর্ডার এডিট #{order.orderNumber}
            </h2>
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body (Scrollable) */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4 text-xs overflow-y-auto flex-1">
          {/* Status Lock Banner */}
          {!isEditable && (
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-amber-700 dark:text-amber-300 text-xs font-bold flex items-center gap-2">
              <Lock className="w-4 h-4 shrink-0" />
              <span>
                অর্ডারটি ইতোমধ্যে এডমিন দ্বারা অনুমোদিত বা কুরিয়ার প্রসেসিংয়ে রয়েছে, তাই এডিট সুবিধাটি লক করা আছে।
              </span>
            </div>
          )}

          {/* Section 1: Customer Info Inputs */}
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  কাস্টমার নাম *
                </label>
                <input
                  type="text"
                  disabled={!isEditable}
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-slate-100 outline-none focus:border-amber-500 disabled:opacity-60"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  মোবাইল নম্বর *
                </label>
                <input
                  type="text"
                  disabled={!isEditable}
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-xs font-mono font-bold text-slate-900 dark:text-slate-100 outline-none focus:border-amber-500 disabled:opacity-60"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  জেলা *
                </label>
                <select
                  disabled={!isEditable}
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-slate-100 outline-none focus:border-amber-500 disabled:opacity-60"
                  required
                >
                  {BD_DISTRICTS.map((d) => (
                    <option key={d.id} value={d.name}>
                      {d.name} ({d.nameEn})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  উপজেলা / এলাকা
                </label>
                <input
                  type="text"
                  disabled={!isEditable}
                  value={upazila}
                  onChange={(e) => setUpazila(e.target.value)}
                  placeholder="যেমন: বরুড়া"
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-slate-100 outline-none focus:border-amber-500 disabled:opacity-60"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                সম্পূর্ণ ঠিকানা *
              </label>
              <input
                type="text"
                disabled={!isEditable}
                value={fullAddress}
                onChange={(e) => setFullAddress(e.target.value)}
                placeholder="যেমন: Cumilla,Barura,Mudafrangaj"
                className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-slate-100 outline-none focus:border-amber-500 disabled:opacity-60"
                required
              />
            </div>
          </div>

          {/* Section 2: Product & Selling Price Header (Matching Screenshot UI) */}
          <div className="space-y-3 border-t border-slate-100 dark:border-slate-800 pt-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                <Package className="w-4 h-4" /> প্রোডাক্ট ও বিক্রয় মূল্য
              </span>
              {isEditable && (
                <Button
                  type="button"
                  onClick={() => setShowProductSearch(!showProductSearch)}
                  variant="outline"
                  size="sm"
                  className="gap-1 text-xs font-bold border-slate-300 dark:border-slate-700"
                >
                  <Plus className="w-3.5 h-3.5" /> প্রোডাক্ট যোগ করুন
                </Button>
              )}
            </div>

            {/* Live Catalog Product Search Bar */}
            {showProductSearch && isEditable && (
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-amber-200 dark:border-amber-900/60 space-y-2 animate-fade-in">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={productQuery}
                    onChange={(e) => handleProductSearch(e.target.value)}
                    placeholder="প্রোডাক্টের নাম বা কোড লিখে খুঁজুন..."
                    className="w-full h-9 pl-9 pr-8 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold outline-none focus:border-amber-500"
                    autoFocus
                  />
                  {searchingProducts && (
                    <Loader2 className="w-3.5 h-3.5 text-amber-500 animate-spin absolute right-3 top-1/2 -translate-y-1/2" />
                  )}
                </div>

                {/* Search Results Dropdown */}
                {searchResults.length > 0 ? (
                  <div className="max-h-48 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-lg">
                    {searchResults.map((p) => {
                      const costT = p.costBasisTaka ?? 1000;
                      const sellT = p.sellingPriceTaka ?? 1500;
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => handleSelectSearchedProduct(p)}
                          className="w-full p-2.5 text-left hover:bg-amber-50 dark:hover:bg-slate-800 flex items-center justify-between gap-2 transition-colors cursor-pointer"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            {p.thumbnail ? (
                              <img
                                src={p.thumbnail}
                                alt=""
                                className="w-8 h-8 object-cover rounded-lg border border-slate-200 shrink-0"
                              />
                            ) : (
                              <Package className="w-6 h-6 text-amber-500 shrink-0" />
                            )}
                            <div className="min-w-0">
                              <p className="font-bold text-slate-900 dark:text-slate-100 text-xs truncate">
                                {p.title}
                              </p>
                              <span className="text-[10px] font-bold text-slate-500 font-mono">
                                Resell price: ৳{costT}
                              </span>
                            </div>
                          </div>
                          <span className="text-xs font-mono font-black text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-1 rounded-lg border border-emerald-200 shrink-0">
                            ৳{sellT}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                ) : productQuery.trim().length > 0 && !searchingProducts ? (
                  <div className="p-2.5 text-center text-slate-500 text-xs flex items-center justify-between">
                    <span>ক্যাটালগে পাওয়া যায়নি</span>
                    <Button
                      type="button"
                      onClick={handleAddBlankItem}
                      variant="ghost"
                      size="sm"
                      className="text-xs font-bold text-amber-600"
                    >
                      + নতুন আইটেম তৈরি করুন
                    </Button>
                  </div>
                ) : null}
              </div>
            )}

            {/* Product Items List (Matching Screenshot Cards) */}
            <div className="space-y-3">
              {items.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-3"
                >
                  {/* Product Title Bar (Matching Screenshot Badge) */}
                  <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className="text-base">🔊</span>
                      <input
                        type="text"
                        disabled={!isEditable}
                        value={item.productName}
                        onChange={(e) =>
                          handleItemChange(idx, "productName", e.target.value)
                        }
                        placeholder="প্রোডাক্ট নাম"
                        className="w-full bg-transparent font-black text-slate-900 dark:text-slate-100 text-xs sm:text-sm outline-none truncate"
                      />
                    </div>

                    {isEditable && items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        className="p-1 rounded-lg text-rose-500 hover:bg-rose-500/10 transition-colors shrink-0"
                        title="রিমুভ করুন"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* 3 Column Inputs: Quantity, Wholesale Cost, Selling Price */}
                  <div className="grid grid-cols-3 gap-2 sm:gap-3 text-xs">
                    <div>
                      <label className="text-[10px] sm:text-[11px] font-bold text-slate-500 dark:text-slate-400 block mb-1">
                        পরিমাণ (টি)
                      </label>
                      <input
                        type="number"
                        min={1}
                        disabled={!isEditable}
                        value={item.quantity}
                        onChange={(e) =>
                          handleItemChange(
                            idx,
                            "quantity",
                            Math.max(1, parseInt(e.target.value) || 1),
                          )
                        }
                        className="w-full h-10 px-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-mono font-bold text-slate-900 dark:text-slate-100 text-center outline-none focus:border-amber-500 disabled:opacity-60"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] sm:text-[11px] font-bold text-slate-500 dark:text-slate-400 block mb-1">
                        Resell price (৳)
                      </label>
                      <input
                        type="number"
                        readOnly
                        disabled
                        value={item.unitCostBasisTaka}
                        className="w-full h-10 px-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800/80 text-xs font-mono font-bold text-slate-500 dark:text-slate-400 text-center outline-none cursor-not-allowed select-none"
                      />
                    </div>

                    {/* Selling Price (Green Outline Highlight matching Screenshot) */}
                    <div>
                      <label className="text-[10px] sm:text-[11px] font-bold text-emerald-600 dark:text-emerald-400 block mb-1">
                        বিক্রয় মূল্য (৳)
                      </label>
                      <input
                        type="number"
                        min={0}
                        disabled={!isEditable}
                        value={item.unitSellingPriceTaka}
                        onChange={(e) =>
                          handleItemChange(
                            idx,
                            "unitSellingPriceTaka",
                            parseFloat(e.target.value) || 0,
                          )
                        }
                        className="w-full h-10 px-2 rounded-xl border-2 border-emerald-500 bg-emerald-500/5 text-xs font-mono font-black text-emerald-600 dark:text-emerald-400 text-center outline-none focus:border-emerald-600 disabled:opacity-60"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Delivery Charge & Special Notes */}
          <div className="space-y-3 border-t border-slate-100 dark:border-slate-800 pt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  ডেলিভারি চার্জ (৳)
                </label>
                <input
                  type="number"
                  min={0}
                  disabled={!isEditable}
                  value={deliveryChargeTaka}
                  onChange={(e) =>
                    setDeliveryChargeTaka(parseFloat(e.target.value) || 0)
                  }
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-xs font-mono font-bold text-slate-900 dark:text-slate-100 outline-none focus:border-amber-500 disabled:opacity-60"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  বিশেষ নোটস / কুরিয়ার নির্দেশিকা
                </label>
                <input
                  type="text"
                  disabled={!isEditable}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="যেমন: ডেলিভারির আগে কল দিয়ে নিশ্চিত করুন..."
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-slate-100 outline-none focus:border-amber-500 disabled:opacity-60"
                />
              </div>
            </div>
          </div>

          {/* Live Financial Breakdown Summary */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2 text-xs font-semibold">
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>পণ্য ক্রয় মূল্য (Cost Basis):</span>
              <span className="font-mono font-bold">৳{costBasisTaka}</span>
            </div>
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>কাস্টমার প্রোডাক্ট সেলস সাবটোটাল:</span>
              <span className="font-mono font-bold">৳{subtotalTaka}</span>
            </div>
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>ডেলিভারি ফি:</span>
              <span className="font-mono font-bold">৳{deliveryChargeTaka}</span>
            </div>

            <div className="flex justify-between text-amber-600 dark:text-amber-400 font-black text-sm pt-1.5 border-t border-slate-200 dark:border-slate-700">
              <span>সর্বমোট কাস্টমার বিল (Total Bill):</span>
              <span className="font-mono text-base">৳{grandTotalTaka}</span>
            </div>

            <div className="flex justify-between text-slate-900 dark:text-slate-100 font-bold pt-1 border-t border-dashed border-slate-200 dark:border-slate-700">
              <span>বাকি বকেয়া (Due Amount / Collection):</span>
              <span className="font-mono font-black text-amber-600 dark:text-amber-400">৳{grandTotalTaka}</span>
            </div>

            {/* Profit Highlight Box (Matching Screenshot Green Badge) */}
            <div
              className={cn(
                "p-2.5 rounded-xl flex items-center justify-between font-black border transition-colors",
                profitTaka >= 0
                  ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800/80 text-emerald-700 dark:text-emerald-300"
                  : "bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800/80 text-rose-700 dark:text-rose-300",
              )}
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-1">
                <span>আপনার নিট লাভ (Profit):</span>
                {deliveryChargeTaka !== standardCourierCostTaka && (
                  <span className="text-[10px] font-semibold opacity-90">
                    ({deliveryChargeTaka < standardCourierCostTaka ? `কুরিয়ার খরচ ৳${standardCourierCostTaka - deliveryChargeTaka} লাভ থেকে বাদ` : `অতিরিক্ত ৳${deliveryChargeTaka - standardCourierCostTaka} লাভে যোগ`})
                  </span>
                )}
              </div>
              <span className="font-mono text-sm">
                {profitTaka >= 0 ? `+৳${profitTaka}` : `-৳${Math.abs(profitTaka)}`}
              </span>
            </div>
          </div>

          {/* Submit Button Bar */}
          {isEditable && (
            <div className="pt-2 shrink-0">
              <Button
                type="submit"
                disabled={submitting}
                className="w-full h-11 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-sm shadow-md transition-all"
              >
                {submitting ? "পরিবর্তন সংরক্ষণ হচ্ছে..." : "পরিবর্তন সংরক্ষণ করুন"}
              </Button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
