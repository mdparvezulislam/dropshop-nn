"use client";

import * as React from "react";
import { Package, Layers, Boxes, FileText, Briefcase, Gift, Check } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { ProductType } from "@/features/catalog/domain/product-entity";

export interface ProductTypeOption {
  type: ProductType;
  label: string;
  labelBangla: string;
  description: string;
  icon: React.ElementType;
}

export const PRODUCT_TYPE_OPTIONS: ProductTypeOption[] = [
  {
    type: "simple",
    label: "Simple Product",
    labelBangla: "সাধারণ পণ্য",
    description: "Single item with no variations. Most common type.",
    icon: Package,
  },
  {
    type: "variant",
    label: "Variant Product",
    labelBangla: "ভ্যারিয়েন্ট পণ্য",
    description: "Product with multiple colors, sizes, or editions.",
    icon: Layers,
  },
  {
    type: "bundle",
    label: "Bundle",
    labelBangla: "বান্ডল",
    description: "Group of products sold together as a package.",
    icon: Boxes,
  },
  {
    type: "digital",
    label: "Digital Product",
    labelBangla: "ডিজিটাল পণ্য",
    description: "Downloadable software, courses, or files.",
    icon: FileText,
  },
  {
    type: "service",
    label: "Service",
    labelBangla: "সেবা",
    description: "Non-physical service or consultation.",
    icon: Briefcase,
  },
  {
    type: "gift_card",
    label: "Gift Card",
    labelBangla: "গিফট কার্ড",
    description: "Prepaid card with stored value.",
    icon: Gift,
  },
];

interface ProductTypeSelectorProps {
  value: ProductType;
  onChange: (type: ProductType) => void;
  className?: string;
}

export function ProductTypeSelector({
  value,
  onChange,
  className,
}: ProductTypeSelectorProps): React.ReactElement {
  return (
    <div className={cn("space-y-4", className)}>
      <div>
        <h2 className="text-lg font-extrabold tracking-tight text-foreground">
          What are you creating?
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          আপনি কী তৈরি করছেন? পণ্যের ধরন নির্বাচন করুন
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {PRODUCT_TYPE_OPTIONS.map((option) => {
          const Icon = option.icon;
          const isSelected = value === option.type;

          return (
            <button
              key={option.type}
              type="button"
              onClick={() => onChange(option.type)}
              className={cn(
                "relative flex flex-col items-start gap-2 rounded-xl border-2 p-4 text-left transition-all duration-200",
                isSelected
                  ? "border-primary bg-accent shadow-md ring-1 ring-primary/20"
                  : "border-border bg-card hover:border-border/80 hover:bg-muted/30 hover:shadow-sm",
              )}
            >
              <div className="flex items-center justify-between w-full">
                <div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-xl border transition-colors",
                    isSelected
                      ? "border-primary/30 bg-primary/15 text-primary"
                      : "border-border bg-muted/40 text-muted-foreground",
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>
                {isSelected && (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Check className="h-3.5 w-3.5" />
                  </div>
                )}
              </div>

              <div>
                <p className={cn("text-sm font-bold", isSelected ? "text-foreground" : "text-foreground/90")}>
                  {option.label}
                </p>
                <p className="text-[11px] font-semibold text-primary/70 mt-0.5">
                  {option.labelBangla}
                </p>
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed">
                {option.description}
              </p>

              {option.type === "simple" && (
                <span className="inline-flex items-center rounded-md bg-success/15 px-2 py-0.5 text-[10px] font-bold text-success">
                  Default
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default ProductTypeSelector;
