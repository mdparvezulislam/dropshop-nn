"use client";

import { useState, useEffect, useCallback } from "react";
import { Trash2, ArrowLeft, ShoppingBag, ShieldCheck, Truck, RotateCcw } from "lucide-react";
import Link from "next/link";
import { usePermissions } from "@/hooks/use-permissions";
import { CartItemRow } from "@/components/website/cart-item-row";
import { CartSummary } from "@/components/website/cart-summary";
import { EmptyCart } from "@/components/website/empty-cart";
import type { CartItemData } from "@/components/website/cart-item-row";

const MOCK_CART_ITEMS: CartItemData[] = [
  {
    index: 0,
    productId: "p-1",
    name: "বোরো i12 TWS এয়ারবাডস",
    slug: "i12-tws-earbuds",
    image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=400&q=80",
    variant: "Color: White",
    sku: "TWS-I12-WHT",
    quantity: 2,
    resolvedPrice: 47000,
    retailPrice: 47000,
    currency: "BDT",
  },
  {
    index: 1,
    productId: "p-2",
    name: "রেমি ৩০০০০mAh পাওয়ার ব্যাংক",
    slug: "remi-30000mah-powerbank",
    image: "https://images.unsplash.com/photo-1609592424109-dd9892f1b177?auto=format&fit=crop&w=400&q=80",
    variant: "Color: Black",
    sku: "PB-REMI-30K",
    quantity: 1,
    resolvedPrice: 145000,
    retailPrice: 145000,
    currency: "BDT",
  },
];

export default function CartPage() {
  const { userRole } = usePermissions();
  const [items, setItems] = useState<CartItemData[]>(MOCK_CART_ITEMS);
  const [loading, setLoading] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const handleQuantityChange = (index: number, quantity: number) => {
    if (quantity === 0) {
      handleRemove(index);
      return;
    }
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, quantity } : item))
    );
  };

  const handleRemove = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleClearCart = () => {
    setItems([]);
  };

  const handleCheckout = () => {
    setCheckoutLoading(true);
    window.location.href = "/checkout";
  };

  const subtotal = items.reduce((sum, item) => sum + item.resolvedPrice * item.quantity, 0);

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[hsl(0_0%_98%)] py-10">
        <div className="mx-auto max-w-(--content-max) px-4 sm:px-6 lg:px-8">
          <EmptyCart />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[hsl(0_0%_98%)] text-foreground py-8">
      <div className="mx-auto max-w-(--content-max) px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-border/80">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-foreground">
              শপিং কার্ট ({items.length})
            </h1>
            <p className="text-xs text-muted-foreground font-medium mt-1">
              আপনার নির্বাচিত প্রোডাক্টগুলো চেকআউট করতে সামনে বাড়ুন।
            </p>
          </div>

          <button
            type="button"
            onClick={handleClearCart}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-red-600 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
            সব মুছে ফেলুন
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start">
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <CartItemRow
                key={`${item.productId}-${item.variant}`}
                item={item}
                onQuantityChange={handleQuantityChange}
                onRemove={handleRemove}
              />
            ))}

            <div className="pt-2">
              <Link
                href="/products"
                className="inline-flex items-center gap-1.5 text-xs font-extrabold text-amber-600 hover:underline"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                আরও প্রোডাক্ট শপিং করুন
              </Link>
            </div>
          </div>

          <div className="space-y-4">
            <CartSummary
              subtotal={subtotal}
              currency="BDT"
              itemCount={items.reduce((sum, item) => sum + item.quantity, 0)}
              onCheckout={handleCheckout}
              loading={checkoutLoading}
            />

            <div className="p-4 rounded-2xl bg-white border border-border/80 space-y-2 text-xs font-semibold text-foreground/80">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-amber-500 shrink-0" />
                <span>১০০% সিকিউর পেমেন্ট ও অরিজিনাল প্রোডাক্ট</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-amber-500 shrink-0" />
                <span>সারা বাংলাদেশে ২-৩ দিনে হোম ডেলিভারি</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
