"use client";

import { cn } from "@/lib/utils/cn";

interface CheckoutSummaryProps {
  items: { name: string; quantity: number; resolvedPrice: number }[];
  subtotal: number;
  shippingCost: number;
  currency?: string;
  className?: string;
}

export function CheckoutSummary({
  items,
  subtotal,
  shippingCost,
  currency = "BDT",
  className,
}: CheckoutSummaryProps) {
  const symbol = currency === "BDT" ? "৳" : "$";
  const fmt = (n: number) => `${symbol}${n.toLocaleString("en-BD", { minimumFractionDigits: 2 })}`;
  const total = subtotal + shippingCost;

  return (
    <div className={cn("p-6 rounded-xl border border-border/60 bg-card", className)}>
      <h2 className="text-base font-semibold text-foreground mb-4">Order Summary</h2>

      <div className="space-y-3 mb-4">
        {items.map((item, i) => (
          <div key={i} className="flex items-center justify-between text-sm">
            <span className="text-foreground/70 truncate max-w-[200px]">
              {item.name} <span className="text-foreground/40">x{item.quantity}</span>
            </span>
            <span className="text-foreground font-medium tabular-nums">
              {fmt(item.resolvedPrice * item.quantity)}
            </span>
          </div>
        ))}
      </div>

      <div className="space-y-2 pt-3 border-t border-border/40 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-foreground/50">Subtotal</span>
          <span className="text-foreground">{fmt(subtotal)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-foreground/50">Shipping</span>
          <span className={cn(shippingCost === 0 ? "text-success" : "text-foreground")}>
            {shippingCost === 0 ? "Free" : fmt(shippingCost)}
          </span>
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-border/40 text-base">
          <span className="font-semibold text-foreground">Total</span>
          <span className="font-bold text-foreground">{fmt(total)}</span>
        </div>
      </div>
    </div>
  );
}
