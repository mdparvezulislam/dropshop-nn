"use client";

import { ShoppingBag, ArrowRight } from "lucide-react";
import { cn } from "@/shared/utils/cn";
import { usePermissions } from "@/shared/hooks/use-permissions";

interface CartSummaryProps {
  subtotal: number;
  currency?: string;
  shippingEstimate?: number;
  itemCount: number;
  onCheckout: () => void;
  loading?: boolean;
}

export function CartSummary({
  subtotal,
  currency = "BDT",
  shippingEstimate,
  itemCount,
  onCheckout,
  loading,
}: CartSummaryProps) {
  const { userRole } = usePermissions();
  const symbol = currency === "BDT" ? "৳" : "$";
  const formatPrice = (price: number) =>
    `${symbol}${price.toLocaleString("en-BD", { minimumFractionDigits: 2 })}`;

  const isReseller = userRole === "reseller";
  const isWholesaler = userRole === "wholesaler";

  const shipping = shippingEstimate ?? (subtotal >= 2000 ? 0 : 120);
  const total = subtotal + shipping;

  return (
    <div className="p-6 rounded-xl border border-border/60 bg-card">
      <h2 className="text-base font-semibold text-foreground mb-4">Order Summary</h2>

      <div className="space-y-3 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-foreground/50">Subtotal ({itemCount} items)</span>
          <span className="font-medium text-foreground">{formatPrice(subtotal)}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-foreground/50">Shipping</span>
          <span className={cn("font-medium", shipping === 0 ? "text-success" : "text-foreground")}>
            {shipping === 0 ? "Free" : formatPrice(shipping)}
          </span>
        </div>

        {isReseller && (
          <div className="flex items-center justify-between text-success">
            <span className="text-xs">Est. Profit</span>
            <span className="text-xs font-semibold">{formatPrice(subtotal * 0.2)}</span>
          </div>
        )}

        {isWholesaler && subtotal < 5000 && (
          <div className="p-2 rounded-lg bg-warning/10 border border-warning/20 text-xs text-warning">
            Add {formatPrice(5000 - subtotal)} more to qualify for bulk shipping discount
          </div>
        )}

        <div className="pt-3 border-t border-border/40">
          <div className="flex items-center justify-between text-base">
            <span className="font-semibold text-foreground">Total</span>
            <span className="font-bold text-foreground">{formatPrice(total)}</span>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={onCheckout}
        disabled={loading || itemCount === 0}
        className="mt-6 w-full inline-flex items-center justify-center gap-2 h-12 rounded-xl bg-primary text-primary-foreground font-semibold px-6 shadow-lg shadow-primary/20 hover:bg-primary/90 hover:shadow-xl transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ShoppingBag className="h-4 w-4" />
        {loading ? "Processing..." : "Proceed to Checkout"}
        <ArrowRight className="h-4 w-4" />
      </button>

      <div className="mt-4 space-y-2">
        {[
          "Secure checkout with SSL encryption",
          "Free shipping on orders over ৳2,000",
          "7-day easy returns",
        ].map((text) => (
          <p key={text} className="flex items-center gap-2 text-[11px] text-foreground/40">
            <span className="h-1 w-1 rounded-full bg-success shrink-0" />
            {text}
          </p>
        ))}
      </div>
    </div>
  );
}
