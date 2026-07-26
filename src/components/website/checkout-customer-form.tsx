"use client";

import { motion } from "framer-motion";

export interface CustomerFormData {
  name: string;
  phone: string;
  email: string;
}

interface CheckoutCustomerFormProps {
  data: CustomerFormData;
  onChange: (data: CustomerFormData) => void;
  onSubmit: () => void;
}

export function CheckoutCustomerForm({ data, onChange, onSubmit }: CheckoutCustomerFormProps) {
  const isValid = data.name.trim().length > 0 && data.phone.trim().length >= 10;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isValid) onSubmit();
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      onSubmit={handleSubmit}
      className="space-y-5"
    >
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-1">Customer Information</h2>
        <p className="text-sm text-foreground/50 mb-4">Who will receive this order?</p>
      </div>

      <div className="space-y-4">
        <div>
          <label
            htmlFor="customer-name"
            className="block text-sm font-medium text-foreground/70 mb-1.5"
          >
            Full Name <span className="text-destructive">*</span>
          </label>
          <input
            id="customer-name"
            type="text"
            value={data.name}
            onChange={(e) => onChange({ ...data, name: e.target.value })}
            placeholder="Enter receiver name"
            className="w-full h-11 rounded-lg border border-border/60 bg-background px-3 text-sm text-foreground placeholder:text-foreground/30 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
            required
          />
        </div>

        <div>
          <label
            htmlFor="customer-phone"
            className="block text-sm font-medium text-foreground/70 mb-1.5"
          >
            Phone Number <span className="text-destructive">*</span>
          </label>
          <input
            id="customer-phone"
            type="tel"
            value={data.phone}
            onChange={(e) => onChange({ ...data, phone: e.target.value })}
            placeholder="01XXXXXXXXX"
            className="w-full h-11 rounded-lg border border-border/60 bg-background px-3 text-sm text-foreground placeholder:text-foreground/30 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
            required
          />
        </div>

        <div>
          <label
            htmlFor="customer-email"
            className="block text-sm font-medium text-foreground/70 mb-1.5"
          >
            Email (optional)
          </label>
          <input
            id="customer-email"
            type="email"
            value={data.email}
            onChange={(e) => onChange({ ...data, email: e.target.value })}
            placeholder="email@example.com"
            className="w-full h-11 rounded-lg border border-border/60 bg-background px-3 text-sm text-foreground placeholder:text-foreground/30 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
          />
        </div>
      </div>

      <div className="pt-2">
        <button
          type="submit"
          className="w-full h-11 rounded-xl bg-primary text-primary-foreground font-semibold px-6 hover:bg-primary/90 transition-all active:scale-[0.98] disabled:opacity-50"
          disabled={!isValid}
        >
          Continue to Shipping
        </button>
      </div>
    </motion.form>
  );
}
