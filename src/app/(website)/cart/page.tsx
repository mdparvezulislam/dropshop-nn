"use client";

import { useState } from "react";
import Link from "next/link";
import { Trash2, ArrowLeft, ShieldCheck, Truck, RotateCcw } from "lucide-react";
import { CartItemRow, type CartItemData } from "@/components/website/cart-item-row";
import { CartSummary } from "@/components/website/cart-summary";
import { EmptyCart } from "@/components/website/empty-cart";
import { CartCouponSection, type CouponInfo } from "@/components/website/cart-coupon-section";
import { useLocalCart } from "@/features/checkout/store/local-cart";

export default function CartPage() {
  const cart = useLocalCart();
  const [appliedCoupon, setAppliedCoupon] = useState<CouponInfo | null>(null);

  // Map the store lines into row DTO shape
  const items: CartItemData[] = cart.items.map((line, index) => ({
    index,
    productId: line.productId,
    name: line.name,
    slug: line.slug,
    image: line.image,
    variant: line.variantLabel,
    sku: line.variantSku ?? "",
    quantity: line.quantity,
    resolvedPrice: line.unitPrice,
    retailPrice: line.unitPrice,
    currency: "BDT",
  }));

  const handleQuantityChange = (index: number, quantity: number) => {
    const line = cart.items[index];
    if (!line) return;
    cart.setQuantity(line.productId, line.variantSku, quantity);
  };

  const handleRemove = (index: number) => {
    const line = cart.items[index];
    if (!line) return;
    cart.removeItem(line.productId, line.variantSku);
  };

  const calculateDiscount = (): number => {
    if (!appliedCoupon) return 0;
    if (appliedCoupon.discountType === "percent") {
      return Math.round((cart.subtotal * appliedCoupon.discountAmount) / 100);
    }
    return Math.min(cart.subtotal, appliedCoupon.discountAmount);
  };

  const discountAmount = calculateDiscount();

  if (!cart.hydrated) {
    return (
      <div className="min-h-screen bg-[hsl(0_0%_98%)] dark:bg-slate-950 py-8" aria-busy="true">
        <div className="mx-auto max-w-(--content-max) px-3 sm:px-6 lg:px-8">
          <div className="h-8 w-48 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse mb-6" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            <div className="lg:col-span-2 space-y-4">
              {Array.from({ length: 2 }).map((_, i) => (
                <div
                  key={i}
                  className="h-32 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl animate-pulse"
                />
              ))}
            </div>
            <div className="h-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[hsl(0_0%_98%)] dark:bg-slate-950 py-10 sm:py-16">
        <div className="mx-auto max-w-(--content-max) px-3 sm:px-6 lg:px-8">
          <EmptyCart />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[hsl(0_0%_98%)] dark:bg-slate-950 text-slate-900 dark:text-slate-100 py-6 sm:py-10 pb-28 md:pb-12">
      <div className="mx-auto max-w-(--content-max) px-3 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h1 className="text-xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-slate-100">
              শপিং কার্ট ({items.length})
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-1">
              আপনার নির্বাচিত প্রোডাক্টগুলো চেকআউট করার জন্য তৈরি আছে।
            </p>
          </div>

          <button
            type="button"
            onClick={cart.clear}
            className="flex items-center gap-1.5 text-xs font-extrabold text-slate-500 hover:text-red-600 dark:hover:text-red-400 transition-colors focus-visible:outline-2 focus-visible:outline-amber-500 rounded-lg p-1.5 touch-manipulation active:scale-95"
          >
            <Trash2 className="h-4 w-4" aria-hidden />
            <span className="hidden sm:inline">সব মুছে ফেলুন</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start">
          {/* Main Cart Items Column */}
          <div className="lg:col-span-2 space-y-4">
            <div className="space-y-3">
              {items.map((item) => (
                <CartItemRow
                  key={`${item.productId}-${item.sku}`}
                  item={item}
                  onQuantityChange={handleQuantityChange}
                  onRemove={handleRemove}
                />
              ))}
            </div>

            {/* Coupon Section */}
            <div className="pt-2">
              <CartCouponSection
                subtotal={cart.subtotal}
                appliedCoupon={appliedCoupon}
                onApplyCoupon={setAppliedCoupon}
                onRemoveCoupon={() => setAppliedCoupon(null)}
              />
            </div>

            <div className="pt-2">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 text-xs font-black text-amber-600 dark:text-amber-400 hover:underline focus-visible:outline-2 focus-visible:outline-amber-500 rounded"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden />
                <span>আরও প্রোডাক্ট ক্যাটালগ দেখুন</span>
              </Link>
            </div>
          </div>

          {/* Right Sidebar Order Summary (Desktop Sticky) */}
          <div className="space-y-4 lg:sticky lg:top-24">
            <CartSummary
              subtotal={cart.subtotal}
              currency="BDT"
              itemCount={cart.count}
              discountAmount={discountAmount}
              deliveryCharge={0}
              couponCode={appliedCoupon?.code}
            />

            {/* Trust Badges */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2.5 text-xs font-extrabold text-slate-700 dark:text-slate-300 shadow-xs">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="h-4 w-4 text-amber-500 shrink-0" aria-hidden />
                <span>১০০% জেনুইন অরিজিনাল প্রোডাক্ট</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Truck className="h-4 w-4 text-amber-500 shrink-0" aria-hidden />
                <span>সারা বাংলাদেশে ক্যাশ অন ডেলিভারি</span>
              </div>
              <div className="flex items-center gap-2.5">
                <RotateCcw className="h-4 w-4 text-amber-500 shrink-0" aria-hidden />
                <span>৭ দিনের ক্যাশব্যাক ও গ্যারান্টি రిప్ளேসমেন্ট</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
