"use client";

import { Trash2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { CartItemRow } from "@/components/website/cart-item-row";
import { CartSummary } from "@/components/website/cart-summary";
import { EmptyCart } from "@/components/website/empty-cart";
import type { CartItemData } from "@/components/website/cart-item-row";
import { useLocalCart } from "@/features/checkout/store/local-cart";
import { ShieldCheck, Truck } from "lucide-react";

export default function CartPage() {
  const cart = useLocalCart();

  // Map the store lines into the existing row component's shape (BDT values).
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

  if (!cart.hydrated) {
    return (
      <div className="min-h-screen bg-[hsl(0_0%_98%)] py-10" aria-busy="true">
        <div className="mx-auto max-w-(--content-max) px-4 sm:px-6 lg:px-8">
          <div className="h-8 w-48 bg-slate-200 rounded-lg animate-pulse mb-6" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            <div className="lg:col-span-2 space-y-4">
              {Array.from({ length: 2 }).map((_, i) => (
                <div
                  key={i}
                  className="h-28 bg-white border border-slate-200 rounded-2xl animate-pulse"
                />
              ))}
            </div>
            <div className="h-64 bg-white border border-slate-200 rounded-xl animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

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
              আপনার নির্বাচিত প্রোডাক্টগুলো এখানে সংরক্ষিত আছে।
            </p>
          </div>

          <button
            type="button"
            onClick={cart.clear}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-red-600 transition-colors focus-visible:outline-2 focus-visible:outline-amber-500 rounded"
          >
            <Trash2 className="h-4 w-4" aria-hidden />
            সব মুছে ফেলুন
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start">
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <CartItemRow
                key={`${item.productId}-${item.sku}`}
                item={item}
                onQuantityChange={handleQuantityChange}
                onRemove={handleRemove}
              />
            ))}

            <div className="pt-2">
              <Link
                href="/products"
                className="inline-flex items-center gap-1.5 text-xs font-extrabold text-amber-600 hover:underline focus-visible:outline-2 focus-visible:outline-amber-500 rounded"
              >
                <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
                আরও প্রোডাক্ট শপিং করুন
              </Link>
            </div>
          </div>

          <div className="space-y-4">
            <CartSummary subtotal={cart.subtotal} currency="BDT" itemCount={cart.count} />

            <div className="p-4 rounded-2xl bg-white border border-border/80 space-y-2 text-xs font-semibold text-foreground/80">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-amber-500 shrink-0" aria-hidden />
                <span>১০০% অরিজিনাল প্রোডাক্ট</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-amber-500 shrink-0" aria-hidden />
                <span>সারা বাংলাদেশে হোম ডেলিভারি</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
