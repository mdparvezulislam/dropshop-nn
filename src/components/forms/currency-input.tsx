"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils/cn";

export interface CurrencyInputProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "onChange" | "value"
> {
  value: string;
  onChange: (value: string) => void;
  currency?: string;
}

export function CurrencyInput({
  value,
  onChange,
  currency = "USD",
  className,
  ...props
}: CurrencyInputProps): React.ReactElement {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground">
        {currency}
      </span>
      <Input
        type="number"
        min="0"
        step="0.01"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn("pl-12 tabular-nums", className)}
        {...props}
      />
    </div>
  );
}

export default CurrencyInput;
