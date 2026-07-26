"use client";

import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";

const BD_DIVISIONS = [
  "Dhaka",
  "Chittagong",
  "Rajshahi",
  "Khulna",
  "Barisal",
  "Sylhet",
  "Rangpur",
  "Mymensingh",
];

export interface ShippingFormData {
  division: string;
  district: string;
  area: string;
  address: string;
}

interface CheckoutShippingFormProps {
  data: ShippingFormData;
  onChange: (data: ShippingFormData) => void;
  onSubmit: () => void;
  onBack: () => void;
}

export function CheckoutShippingForm({
  data,
  onChange,
  onSubmit,
  onBack,
}: CheckoutShippingFormProps) {
  const isValid =
    data.division.trim().length > 0 &&
    data.district.trim().length > 0 &&
    data.address.trim().length > 5;

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
        <h2 className="text-lg font-semibold text-foreground mb-1">Shipping Address</h2>
        <p className="text-sm text-foreground/50 mb-4">Where should we deliver the order?</p>
      </div>

      <div className="space-y-4">
        <div>
          <label
            htmlFor="shipping-division"
            className="block text-sm font-medium text-foreground/70 mb-1.5"
          >
            Division <span className="text-destructive">*</span>
          </label>
          <select
            id="shipping-division"
            value={data.division}
            onChange={(e) => onChange({ ...data, division: e.target.value })}
            className="w-full h-11 rounded-lg border border-border/60 bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
            required
          >
            <option value="">Select division</option>
            {BD_DIVISIONS.map((div) => (
              <option key={div} value={div}>
                {div}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="shipping-district"
            className="block text-sm font-medium text-foreground/70 mb-1.5"
          >
            District <span className="text-destructive">*</span>
          </label>
          <input
            id="shipping-district"
            type="text"
            value={data.district}
            onChange={(e) => onChange({ ...data, district: e.target.value })}
            placeholder="e.g. Dhaka, Chattogram"
            className="w-full h-11 rounded-lg border border-border/60 bg-background px-3 text-sm text-foreground placeholder:text-foreground/30 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
            required
          />
        </div>

        <div>
          <label
            htmlFor="shipping-area"
            className="block text-sm font-medium text-foreground/70 mb-1.5"
          >
            Area / Thana (optional)
          </label>
          <input
            id="shipping-area"
            type="text"
            value={data.area}
            onChange={(e) => onChange({ ...data, area: e.target.value })}
            placeholder="e.g. Gulshan, Mirpur"
            className="w-full h-11 rounded-lg border border-border/60 bg-background px-3 text-sm text-foreground placeholder:text-foreground/30 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
          />
        </div>

        <div>
          <label
            htmlFor="shipping-address"
            className="block text-sm font-medium text-foreground/70 mb-1.5"
          >
            Full Address <span className="text-destructive">*</span>
          </label>
          <textarea
            id="shipping-address"
            value={data.address}
            onChange={(e) => onChange({ ...data, address: e.target.value })}
            placeholder="House, road, building details"
            rows={3}
            className="w-full rounded-lg border border-border/60 bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-foreground/30 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all resize-none"
            required
          />
        </div>
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
          type="submit"
          className="flex-1 h-11 rounded-xl bg-primary text-primary-foreground font-semibold px-6 hover:bg-primary/90 transition-all active:scale-[0.98] disabled:opacity-50"
          disabled={!isValid}
        >
          Continue to Payment
        </button>
      </div>
    </motion.form>
  );
}
