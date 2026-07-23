"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils/cn";

export interface NumberInputProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "onChange" | "value" | "type"
> {
  value: string | number;
  onChange: (value: string) => void;
}

export function NumberInput({
  value,
  onChange,
  className,
  ...props
}: NumberInputProps): React.ReactElement {
  return (
    <Input
      type="number"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={cn("tabular-nums", className)}
      {...props}
    />
  );
}

export default NumberInput;
