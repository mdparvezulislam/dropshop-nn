"use client";

import { motion } from "framer-motion";
import { ArrowLeft, CreditCard, Banknote, Smartphone, Building2, Wallet } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export type PaymentMethod = "cod" | "bkash" | "nagad" | "rocket" | "bank" | "wallet";

interface PaymentOption {
  id: PaymentMethod;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

const paymentOptions: PaymentOption[] = [
  { id: "cod", label: "Cash on Delivery", description: "Pay when you receive", icon: Banknote },
  { id: "bkash", label: "bKash", description: "Send money to bKash number", icon: Smartphone },
  { id: "nagad", label: "Nagad", description: "Send money to Nagad number", icon: Smartphone },
  { id: "rocket", label: "Rocket", description: "Send money to Rocket number", icon: Smartphone },
  { id: "bank", label: "Bank Transfer", description: "Deposit to our bank account", icon: Building2 },
  { id: "wallet", label: "Wallet", description: "Pay using your balance", icon: Wallet },
];

interface CheckoutPaymentFormProps {
  selected: PaymentMethod;
  onSelect: (method: PaymentMethod) => void;
  onSubmit: () => void;
  onBack: () => void;
}

export function CheckoutPaymentForm({ selected, onSelect, onSubmit, onBack }: CheckoutPaymentFormProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="space-y-5"
    >
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-1">Payment Method</h2>
        <p className="text-sm text-foreground/50 mb-4">Choose how you want to pay</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {paymentOptions.map((option) => {
          const isSelected = selected === option.id;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onSelect(option.id)}
              className={cn(
                "flex items-start gap-3 p-4 rounded-xl border text-left transition-all",
                isSelected
                  ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                  : "border-border/60 bg-card hover:border-border hover:shadow-sm",
              )}
            >
              <div className={cn(
                "p-2 rounded-lg shrink-0 transition-colors",
                isSelected ? "bg-primary/10 text-primary" : "bg-muted text-foreground/50",
              )}>
                <option.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{option.label}</p>
                <p className="text-xs text-foreground/50 mt-0.5">{option.description}</p>
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center justify-center gap-1.5 h-11 rounded-xl border border-border/60 text-foreground/70 font-medium px-5 hover:bg-muted/60 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
        <button
          type="button"
          onClick={onSubmit}
          disabled={!selected}
          className="flex-1 h-11 rounded-xl bg-primary text-primary-foreground font-semibold px-6 hover:bg-primary/90 transition-all active:scale-[0.98] disabled:opacity-50"
        >
          Continue to Review
        </button>
      </div>
    </motion.div>
  );
}
