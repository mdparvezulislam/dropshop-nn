"use client";

import { motion } from "framer-motion";
import { ArrowLeft, ShoppingBag, Check } from "lucide-react";
import { PriceDisplay } from "@/components/website/price-display";
import type { CustomerFormData } from "./checkout-customer-form";
import type { ShippingFormData } from "./checkout-shipping-form";
import type { PaymentMethod } from "./checkout-payment-form";

interface CheckoutReviewProps {
  items: {
    name: string;
    quantity: number;
    resolvedPrice: number;
    image?: string;
    variant?: string;
  }[];
  customer: CustomerFormData;
  shipping: ShippingFormData;
  paymentMethod: PaymentMethod;
  subtotal: number;
  shippingCost: number;
  currency?: string;
  onBack: () => void;
  onSubmit: () => void;
  submitting?: boolean;
}

const paymentLabels: Record<PaymentMethod, string> = {
  cod: "Cash on Delivery",
  bkash: "bKash",
  nagad: "Nagad",
  rocket: "Rocket",
  bank: "Bank Transfer",
  wallet: "Wallet",
};

export function CheckoutReview({
  items,
  customer,
  shipping,
  paymentMethod,
  subtotal,
  shippingCost,
  currency = "BDT",
  onBack,
  onSubmit,
  submitting,
}: CheckoutReviewProps) {
  const total = subtotal + shippingCost;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-1">Review Your Order</h2>
        <p className="text-sm text-foreground/50 mb-4">
          Please verify everything before placing the order
        </p>
      </div>

      <div className="space-y-4">
        <div className="p-4 rounded-xl border border-border/60 bg-card">
          <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <Check className="h-4 w-4 text-success" />
            Customer Information
          </h3>
          <div className="space-y-1 text-sm text-foreground/70">
            <p>{customer.name}</p>
            <p>{customer.phone}</p>
            {customer.email && <p>{customer.email}</p>}
          </div>
        </div>

        <div className="p-4 rounded-xl border border-border/60 bg-card">
          <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <Check className="h-4 w-4 text-success" />
            Shipping Address
          </h3>
          <div className="space-y-1 text-sm text-foreground/70">
            <p>{shipping.address}</p>
            <p>
              {[shipping.area, shipping.district, shipping.division].filter(Boolean).join(", ")}
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-border/60 bg-card">
          <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <Check className="h-4 w-4 text-success" />
            Payment Method
          </h3>
          <p className="text-sm text-foreground/70">{paymentLabels[paymentMethod]}</p>
        </div>

        <div className="p-4 rounded-xl border border-border/60 bg-card">
          <h3 className="text-sm font-semibold text-foreground mb-3">Order Items</h3>
          <div className="space-y-3">
            {items.map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-muted shrink-0 bg-cover bg-center" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{item.name}</p>
                  {item.variant && <p className="text-xs text-foreground/40">{item.variant}</p>}
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-foreground">
                    {currency === "BDT" ? "৳" : "$"}
                    {(item.resolvedPrice * item.quantity).toLocaleString()}
                  </p>
                  <p className="text-xs text-foreground/40">x{item.quantity}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onBack}
          disabled={submitting}
          className="flex items-center justify-center gap-1.5 h-11 rounded-xl border border-border/60 text-foreground/70 font-medium px-5 hover:bg-muted/60 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
        <button
          type="button"
          onClick={onSubmit}
          disabled={submitting}
          className="flex-1 inline-flex items-center justify-center gap-2 h-11 rounded-xl bg-primary text-primary-foreground font-semibold px-6 hover:bg-primary/90 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ShoppingBag className="h-4 w-4" />
          {submitting ? "Placing Order..." : "Place Order"}
        </button>
      </div>
    </motion.div>
  );
}
